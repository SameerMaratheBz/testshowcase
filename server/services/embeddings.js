import { pipeline } from '@xenova/transformers';
import { getClient } from './redis.js';

let embeddingGenerator;

async function getEmbeddingGenerator() {
  if (!embeddingGenerator) {
    embeddingGenerator = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingGenerator;
}

export async function generateEmbedding(text) {
  const generator = await getEmbeddingGenerator();
  const output = await generator(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function setupVectorIndex() {
  const redis = getClient();
  
  try {
    // Create vector similarity index with all fields
    await redis.call(
      'FT.CREATE', 'idx:ads',
      'ON', 'HASH',
      'PREFIX', '1', 'ad:',
      'SCHEMA',
      'embedding', 'VECTOR', 'FLOAT32', '384', 'FLAT', '6', 'TYPE', 'FLOAT32', 'DIM', '384', 'DISTANCE_METRIC', 'COSINE',
      'account', 'TEXT',
      'brand', 'TEXT',
      'industry', 'TEXT',
      'campaign', 'TEXT',
      'creative_id', 'TEXT',
      'creative_name', 'TEXT',
      'device', 'TEXT',
      'format', 'TEXT',
      'template', 'TEXT',
      'adLink', 'TEXT',
      'features', 'TEXT',
      'thumbnail', 'TEXT'
    );
    console.log('Vector index created successfully');
  } catch (error) {
    if (!error.message.includes('Index already exists')) {
      console.error('Error creating vector index:', error);
      throw error;
    }
  }
}

export async function storeAdVectors(ads) {
  const redis = getClient();
  const pipeline = redis.pipeline();

  for (const ad of ads) {
    // Include all relevant fields in the text for embedding
    const text = [
      ad.account,
      ad.brand,
      ad.industry,
      ad.campaign,
      ad.creative_name,
      ad.format,
      ad.template,
      ad.features
    ].filter(Boolean).join(' ');

    const embedding = await generateEmbedding(text);
    
    pipeline.hset(`ad:${ad.id}`, {
      embedding: Buffer.from(new Float32Array(embedding).buffer),
      account: ad.account,
      brand: ad.brand,
      industry: ad.industry,
      campaign: ad.campaign,
      creative_id: ad.creative_id,
      creative_name: ad.creative_name,
      device: ad.device,
      format: ad.format,
      template: ad.template,
      adLink: ad.adLink,
      features: ad.features,
      thumbnail: ad.thumbnail
    });
  }

  await pipeline.exec();
  console.log(`Stored vectors for ${ads.length} ads`);
}

export async function searchSimilarAds(query, limit = 20) {
  const redis = getClient();
  const queryEmbedding = await generateEmbedding(query);
  
  const results = await redis.call(
    'FT.SEARCH', 'idx:ads',
    `*=>[KNN ${limit} @embedding $blob AS score]`,
    'PARAMS', '2', 'blob', Buffer.from(new Float32Array(queryEmbedding).buffer),
    'RETURN', '12', 'account', 'brand', 'industry', 'campaign', 'creative_name', 'device', 'format', 'template', 'adLink', 'features', 'thumbnail', 'creative_id',
    'SORTBY', 'score'
  );

  if (!results || results.length === 0) {
    return [];
  }

  // Parse results
  const ads = [];
  for (let i = 1; i < results.length; i += 2) {
    const [
      _id,
      [
        _account, account,
        _brand, brand,
        _industry, industry,
        _campaign, campaign,
        _creative_name, creative_name,
        _device, device,
        _format, format,
        _template, template,
        _adLink, adLink,
        _features, features,
        _thumbnail, thumbnail,
        _creative_id, creative_id
      ]
    ] = results[i];

    ads.push({
      id: parseInt(_id.split(':')[1]),
      account,
      brand,
      industry,
      campaign,
      creative_id,
      creative_name,
      device,
      format,
      template,
      adLink,
      features,
      featureFlags: features.split(',').filter(Boolean),
      thumbnail
    });
  }

  return ads;
}