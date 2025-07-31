import { z } from 'zod';
import { createGoogleAdsClient } from '../google-ads-client.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listKeywordsSchema = z.object({
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
  limit: z.number().optional().default(100),
  includeNegative: z.boolean().optional().default(false),
});

export const addKeywordsSchema = z.object({
  adGroupId: z.string(),
  keywords: z.array(z.object({
    text: z.string(),
    matchType: z.enum(['EXACT', 'PHRASE', 'BROAD']),
    cpcBidMicros: z.number().optional(),
  })),
});

export const addNegativeKeywordsSchema = z.object({
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
  keywords: z.array(z.object({
    text: z.string(),
    matchType: z.enum(['EXACT', 'PHRASE', 'BROAD']),
  })),
});

export const updateKeywordSchema = z.object({
  keywordId: z.string(),
  adGroupId: z.string(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']).optional(),
  cpcBidMicros: z.number().optional(),
});

export const getKeywordPerformanceSchema = z.object({
  keywordId: z.string(),
  adGroupId: z.string(),
  dateRange: z.enum(['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH', 'LAST_MONTH']).optional().default('LAST_30_DAYS'),
});

export async function listKeywords(params: z.infer<typeof listKeywordsSchema>) {
  const customer = createGoogleAdsClient();
  
  let whereClause = 'WHERE ad_group_criterion.type = "KEYWORD"';
  
  if (!params.includeNegative) {
    whereClause += ' AND ad_group_criterion.negative = FALSE';
  }
  
  if (params.campaignId) {
    whereClause += ` AND campaign.id = ${params.campaignId}`;
  }
  
  if (params.adGroupId) {
    whereClause += ` AND ad_group.id = ${params.adGroupId}`;
  }
  
  const query = `
    SELECT
      ad_group_criterion.criterion_id,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status,
      ad_group_criterion.negative,
      ad_group_criterion.cpc_bid_micros,
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc
    FROM ad_group_criterion
    ${whereClause}
    ORDER BY metrics.impressions DESC
    LIMIT ${params.limit}
  `;

  const keywords = await customer.query(query);
  
  return keywords.map((keyword: any) => ({
    id: keyword.ad_group_criterion.criterion_id,
    text: keyword.ad_group_criterion.keyword.text,
    matchType: keyword.ad_group_criterion.keyword.match_type,
    status: keyword.ad_group_criterion.status,
    isNegative: keyword.ad_group_criterion.negative,
    cpcBid: keyword.ad_group_criterion.cpc_bid_micros ? 
      parseInt(keyword.ad_group_criterion.cpc_bid_micros) / 1_000_000 : null,
    adGroup: {
      id: keyword.ad_group.id,
      name: keyword.ad_group.name,
    },
    campaign: {
      id: keyword.campaign.id,
      name: keyword.campaign.name,
    },
    metrics: {
      impressions: keyword.metrics?.impressions || 0,
      clicks: keyword.metrics?.clicks || 0,
      cost: keyword.metrics?.cost_micros ? 
        parseInt(keyword.metrics.cost_micros) / 1_000_000 : 0,
      conversions: keyword.metrics?.conversions || 0,
      ctr: keyword.metrics?.ctr || 0,
      avgCpc: keyword.metrics?.average_cpc ? 
        parseInt(keyword.metrics.average_cpc) / 1_000_000 : 0,
    }
  }));
}

export async function addKeywords(params: z.infer<typeof addKeywordsSchema>) {
  const customer = createGoogleAdsClient();
  
  const operations = params.keywords.map(keyword => ({
    create: {
      ad_group: `customers/${customer.credentials.customer_id}/adGroups/${params.adGroupId}`,
      status: 'ENABLED',
      keyword: {
        text: keyword.text,
        match_type: keyword.matchType,
      },
      cpc_bid_micros: keyword.cpcBidMicros,
    }
  }));
  
  const results = await customer.adGroupCriteria.create(operations);
  
  return {
    success: true,
    addedKeywords: results.length,
    keywords: results.map((result: any) => ({
      id: result.resource_name.split('/').pop(),
      text: params.keywords[results.indexOf(result)].text,
      matchType: params.keywords[results.indexOf(result)].matchType,
    })),
  };
}

export async function addNegativeKeywords(params: z.infer<typeof addNegativeKeywordsSchema>) {
  const customer = createGoogleAdsClient();
  
  if (!params.campaignId && !params.adGroupId) {
    throw new Error('Either campaignId or adGroupId must be provided');
  }
  
  if (params.adGroupId) {
    const operations = params.keywords.map(keyword => ({
      create: {
        ad_group: `customers/${customer.credentials.customer_id}/adGroups/${params.adGroupId}`,
        status: 'ENABLED',
        negative: true,
        keyword: {
          text: keyword.text,
          match_type: keyword.matchType,
        },
      }
    }));
    
    const results = await customer.adGroupCriteria.create(operations);
    
    return {
      success: true,
      level: 'ad_group',
      addedKeywords: results.length,
    };
  } else if (params.campaignId) {
    const operations = params.keywords.map(keyword => ({
      create: {
        campaign: `customers/${customer.credentials.customer_id}/campaigns/${params.campaignId}`,
        negative: true,
        keyword: {
          text: keyword.text,
          match_type: keyword.matchType,
        },
      }
    }));
    
    const results = await customer.campaignCriteria.create(operations);
    
    return {
      success: true,
      level: 'campaign',
      addedKeywords: results.length,
    };
  }
}

export async function updateKeyword(params: z.infer<typeof updateKeywordSchema>) {
  const customer = createGoogleAdsClient();
  
  const updates: any = {};
  
  if (params.status !== undefined) {
    updates.status = params.status;
  }
  
  if (params.cpcBidMicros !== undefined) {
    updates.cpc_bid_micros = params.cpcBidMicros;
  }
  
  await customer.adGroupCriteria.update({
    resource_name: `customers/${customer.credentials.customer_id}/adGroupCriteria/${params.adGroupId}~${params.keywordId}`,
    ...updates,
  });
  
  return { success: true, keywordId: params.keywordId };
}

export async function getKeywordPerformance(params: z.infer<typeof getKeywordPerformanceSchema>) {
  const customer = createGoogleAdsClient();
  
  const query = `
    SELECT
      ad_group_criterion.criterion_id,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.quality_score,
      ad_group_criterion.quality_score.quality_score,
      ad_group_criterion.quality_score.creative_quality_score,
      ad_group_criterion.quality_score.post_click_quality_score,
      ad_group_criterion.quality_score.search_predicted_ctr,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversion_rate,
      metrics.cost_per_conversion,
      metrics.search_impression_share,
      metrics.search_rank_lost_impression_share,
      metrics.search_budget_lost_impression_share
    FROM ad_group_criterion
    WHERE ad_group_criterion.type = "KEYWORD" 
      AND ad_group_criterion.criterion_id = ${params.keywordId}
      AND ad_group.id = ${params.adGroupId}
      AND segments.date DURING ${params.dateRange}
  `;

  const [keyword] = await customer.query(query);
  
  if (!keyword) {
    throw new Error(`Keyword with ID ${params.keywordId} not found`);
  }
  
  return {
    id: keyword.ad_group_criterion.criterion_id,
    text: keyword.ad_group_criterion.keyword.text,
    matchType: keyword.ad_group_criterion.keyword.match_type,
    qualityScore: {
      score: keyword.ad_group_criterion.quality_score?.quality_score || null,
      creativeQuality: keyword.ad_group_criterion.quality_score?.creative_quality_score || null,
      postClickQuality: keyword.ad_group_criterion.quality_score?.post_click_quality_score || null,
      expectedCtr: keyword.ad_group_criterion.quality_score?.search_predicted_ctr || null,
    },
    metrics: {
      impressions: keyword.metrics?.impressions || 0,
      clicks: keyword.metrics?.clicks || 0,
      cost: keyword.metrics?.cost_micros ? 
        parseInt(keyword.metrics.cost_micros) / 1_000_000 : 0,
      conversions: keyword.metrics?.conversions || 0,
      ctr: keyword.metrics?.ctr || 0,
      avgCpc: keyword.metrics?.average_cpc ? 
        parseInt(keyword.metrics.average_cpc) / 1_000_000 : 0,
      conversionRate: keyword.metrics?.conversion_rate || 0,
      costPerConversion: keyword.metrics?.cost_per_conversion ? 
        parseInt(keyword.metrics.cost_per_conversion) / 1_000_000 : 0,
      impressionShare: keyword.metrics?.search_impression_share || 0,
      rankLostImpressionShare: keyword.metrics?.search_rank_lost_impression_share || 0,
      budgetLostImpressionShare: keyword.metrics?.search_budget_lost_impression_share || 0,
    }
  };
}

export const keywordTools: Tool[] = [
  {
    name: 'list_keywords',
    description: 'List keywords with their performance metrics',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', description: 'Filter by campaign ID' },
        adGroupId: { type: 'string', description: 'Filter by ad group ID' },
        limit: { type: 'number', description: 'Maximum number of keywords to return' },
        includeNegative: { type: 'boolean', description: 'Include negative keywords' },
      },
    },
  },
  {
    name: 'add_keywords',
    description: 'Add new keywords to an ad group',
    inputSchema: {
      type: 'object',
      properties: {
        adGroupId: { type: 'string', description: 'Ad group ID' },
        keywords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string', description: 'Keyword text' },
              matchType: { 
                type: 'string',
                enum: ['EXACT', 'PHRASE', 'BROAD'],
                description: 'Keyword match type' 
              },
              cpcBidMicros: { type: 'number', description: 'CPC bid in micros (optional)' },
            },
            required: ['text', 'matchType'],
          },
        },
      },
      required: ['adGroupId', 'keywords'],
    },
  },
  {
    name: 'add_negative_keywords',
    description: 'Add negative keywords to a campaign or ad group',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', description: 'Campaign ID (for campaign-level negatives)' },
        adGroupId: { type: 'string', description: 'Ad group ID (for ad group-level negatives)' },
        keywords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string', description: 'Keyword text' },
              matchType: { 
                type: 'string',
                enum: ['EXACT', 'PHRASE', 'BROAD'],
                description: 'Keyword match type' 
              },
            },
            required: ['text', 'matchType'],
          },
        },
      },
      required: ['keywords'],
    },
  },
  {
    name: 'update_keyword',
    description: 'Update keyword status or bid',
    inputSchema: {
      type: 'object',
      properties: {
        keywordId: { type: 'string', description: 'Keyword ID' },
        adGroupId: { type: 'string', description: 'Ad group ID' },
        status: { 
          type: 'string',
          enum: ['ENABLED', 'PAUSED', 'REMOVED'],
          description: 'New keyword status' 
        },
        cpcBidMicros: { type: 'number', description: 'New CPC bid in micros' },
      },
      required: ['keywordId', 'adGroupId'],
    },
  },
  {
    name: 'get_keyword_performance',
    description: 'Get detailed performance metrics for a keyword',
    inputSchema: {
      type: 'object',
      properties: {
        keywordId: { type: 'string', description: 'Keyword ID' },
        adGroupId: { type: 'string', description: 'Ad group ID' },
        dateRange: { 
          type: 'string',
          enum: ['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH', 'LAST_MONTH'],
          description: 'Date range for metrics' 
        },
      },
      required: ['keywordId', 'adGroupId'],
    },
  },
];