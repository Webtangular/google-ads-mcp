import { GoogleAdsApi } from 'google-ads-api';
import { googleAdsConfig } from './config.js';

export function createGoogleAdsClient() {
  const client = new GoogleAdsApi({
    client_id: googleAdsConfig.clientId,
    client_secret: googleAdsConfig.clientSecret,
    developer_token: googleAdsConfig.developerToken,
  });

  const customer = client.Customer({
    customer_id: googleAdsConfig.customerId,
    login_customer_id: googleAdsConfig.loginCustomerId,
    refresh_token: googleAdsConfig.refreshToken,
  });

  return customer;
}