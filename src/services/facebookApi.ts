import axios, { AxiosError } from 'axios';
import { FACEBOOK_API_BASE, getAccessToken } from '../config';
import { Campaign, AdAccount, DatePreset, DateRange } from '../types';

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms between requests to avoid rate limits

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (url: string, params: Record<string, any> = {}, retries = 3) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(url, {
        params: {
          access_token: getAccessToken(),
          ...params,
        },
        timeout: 30000, // 30 second timeout
      });
      
      // Check for Facebook API errors in response
      if (response.data.error) {
        const fbError = response.data.error;
        if (fbError.code === 190) {
          throw new Error('Access token expired or invalid. Please refresh your token.');
        }
        if (fbError.code === 4 || fbError.code === 17) {
          throw new Error('Rate limit reached. Please wait a moment and try again.');
        }
        throw new Error(fbError.message || 'Facebook API error occurred');
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Handle rate limiting with exponential backoff
      if (axiosError.response?.status === 429) {
        if (attempt < retries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          await delay(waitTime);
          continue;
        }
        throw new Error('Rate limit reached. Please wait a few minutes and try again.');
      }
      
      // Handle authentication errors
      if (axiosError.response?.status === 401) {
        throw new Error('Access token expired or invalid. Please refresh your token.');
      }
      
      // Handle network errors
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        if (attempt < retries - 1) {
          await delay(1000 * (attempt + 1));
          continue;
        }
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }
      
      // Handle other errors
      if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
        const fbError = (axiosError.response.data as any).error;
        throw new Error(fbError?.message || 'An error occurred while fetching data.');
      }
      
      if (attempt === retries - 1) {
        throw new Error(axiosError.message || 'An unexpected error occurred.');
      }
      
      // Retry with delay
      await delay(1000 * (attempt + 1));
    }
  }
  
  throw new Error('Request failed after multiple attempts.');
};

const makePostRequest = async (url: string, data: Record<string, any> = {}, retries = 3) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.post(url, null, {
        params: {
          access_token: getAccessToken(),
          ...data,
        },
        timeout: 30000,
      });
      
      // Check for Facebook API errors in response
      if (response.data.error) {
        const fbError = response.data.error;
        if (fbError.code === 190) {
          throw new Error('Access token expired or invalid. Please refresh your token.');
        }
        if (fbError.code === 4 || fbError.code === 17) {
          throw new Error('Rate limit reached. Please wait a moment and try again.');
        }
        throw new Error(fbError.message || 'Facebook API error occurred');
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Handle rate limiting with exponential backoff
      if (axiosError.response?.status === 429) {
        if (attempt < retries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await delay(waitTime);
          continue;
        }
        throw new Error('Rate limit reached. Please wait a few minutes and try again.');
      }
      
      // Handle authentication errors
      if (axiosError.response?.status === 401) {
        throw new Error('Access token expired or invalid. Please refresh your token.');
      }
      
      // Handle network errors
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        if (attempt < retries - 1) {
          await delay(1000 * (attempt + 1));
          continue;
        }
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }
      
      // Handle other errors
      if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
        const fbError = (axiosError.response.data as any).error;
        throw new Error(fbError?.message || 'An error occurred while updating data.');
      }
      
      if (attempt === retries - 1) {
        throw new Error(axiosError.message || 'An unexpected error occurred.');
      }
      
      // Retry with delay
      await delay(1000 * (attempt + 1));
    }
  }
  
  throw new Error('Request failed after multiple attempts.');
};

// Get ad accounts for the user
export const getAdAccounts = async (): Promise<AdAccount[]> => {
  try {
    const data = await makeRequest(`${FACEBOOK_API_BASE}/me/adaccounts`, {
      fields: 'id,name,account_id',
    });
    return data.data || [];
  } catch (error) {
    console.error('Error fetching ad accounts:', error);
    throw error;
  }
};

// Convert date preset to Facebook API format
const getDatePresetParams = (preset: DatePreset, customRange?: DateRange) => {
  if (preset === 'custom' && customRange) {
    return {
      time_range: JSON.stringify({
        since: customRange.start.toISOString().split('T')[0],
        until: customRange.end.toISOString().split('T')[0],
      }),
    };
  }
  return {
    date_preset: preset === 'today' ? 'today' : 
                 preset === 'yesterday' ? 'yesterday' :
                 preset === 'last_7d' ? 'last_7d' :
                 preset === 'this_month' ? 'this_month' : 'today',
  };
};

// Get campaigns for an ad account
export const getCampaigns = async (
  adAccountId: string,
  datePreset: DatePreset = 'today',
  customRange?: DateRange
): Promise<Campaign[]> => {
  try {
    const dateParams = getDatePresetParams(datePreset, customRange);
    
    // First, get campaigns
    const campaignsData = await makeRequest(
      `${FACEBOOK_API_BASE}/${adAccountId}/campaigns`,
      {
        fields: 'id,name,status,daily_budget,lifetime_budget,effective_status',
        limit: 100,
      }
    );

    const campaigns: Campaign[] = (campaignsData.data || []).map((camp: any) => ({
      id: camp.id,
      name: camp.name,
      status: camp.status,
      daily_budget: camp.daily_budget ? camp.daily_budget / 100 : undefined, // Convert cents to dollars
      lifetime_budget: camp.lifetime_budget ? camp.lifetime_budget / 100 : undefined,
      delivery_status: camp.effective_status,
    }));

    // Get insights for each campaign
    const campaignsWithInsights = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const insightsData = await makeRequest(
            `${FACEBOOK_API_BASE}/${campaign.id}/insights`,
            {
              fields: 'impressions,clicks,ctr,cpc,spend,actions',
              ...dateParams,
            }
          );

          const insights = insightsData.data?.[0];
          if (insights) {
            campaign.insights = {
              impressions: parseInt(insights.impressions || '0'),
              clicks: parseInt(insights.clicks || '0'),
              ctr: parseFloat(insights.ctr || '0'),
              cpc: parseFloat(insights.cpc || '0'),
              spend: parseFloat(insights.spend || '0'),
              actions: insights.actions || [],
            };
          }

          // Get creative ID for preview
          try {
            const adsData = await makeRequest(
              `${FACEBOOK_API_BASE}/${campaign.id}/ads`,
              {
                fields: 'creative{id}',
                limit: 1,
              }
            );
            if (adsData.data?.[0]?.creative?.id) {
              campaign.creative_id = adsData.data[0].creative.id;
            }
          } catch (err) {
            console.warn(`Could not fetch creative for campaign ${campaign.id}`);
          }
        } catch (err) {
          console.warn(`Could not fetch insights for campaign ${campaign.id}`);
        }
        return campaign;
      })
    );

    return campaignsWithInsights;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

// Update campaign status (PAUSED/ACTIVE)
export const updateCampaignStatus = async (
  campaignId: string,
  status: 'PAUSED' | 'ACTIVE'
): Promise<boolean> => {
  try {
    await makePostRequest(`${FACEBOOK_API_BASE}/${campaignId}`, {
      status,
    });
    return true;
  } catch (error) {
    console.error('Error updating campaign status:', error);
    throw error;
  }
};

// Update campaign budget
export const updateCampaignBudget = async (
  campaignId: string,
  dailyBudget: number
): Promise<boolean> => {
  try {
    // Facebook API expects budget in cents
    const budgetInCents = Math.round(dailyBudget * 100);
    
    await makePostRequest(`${FACEBOOK_API_BASE}/${campaignId}`, {
      daily_budget: budgetInCents,
    });
    return true;
  } catch (error) {
    console.error('Error updating campaign budget:', error);
    throw error;
  }
};

// Get ad preview HTML
export const getAdPreview = async (
  creativeId: string,
  adFormat: 'DESKTOP_FEED_STANDARD' | 'MOBILE_FEED_STANDARD' = 'DESKTOP_FEED_STANDARD'
): Promise<string> => {
  try {
    const data = await makeRequest(
      `${FACEBOOK_API_BASE}/${creativeId}/previews`,
      {
        ad_format: adFormat,
      }
    );
    
    // Facebook returns preview data, extract HTML if available
    if (data.data && data.data[0] && data.data[0].body) {
      return data.data[0].body;
    }
    
    // Fallback: return iframe wrapper
    return `<iframe src="https://www.facebook.com/ads/preview?creative_id=${creativeId}&ad_format=${adFormat}" width="100%" height="600" frameborder="0"></iframe>`;
  } catch (error) {
    console.error('Error fetching ad preview:', error);
    // Return fallback iframe
    return `<iframe src="https://www.facebook.com/ads/preview?creative_id=${creativeId}&ad_format=${adFormat}" width="100%" height="600" frameborder="0"></iframe>`;
  }
};
