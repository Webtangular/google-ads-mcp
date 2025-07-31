# Google Ads MCP Server

A comprehensive Model Context Protocol (MCP) server providing Google Ads API integration. This tool enables you to manage Google Ads campaigns, keywords, ads, conversions, and performance metrics programmatically.

## 🚀 About

This MCP server is designed to integrate Google Ads API with Claude Desktop or other MCP-compatible applications. Written in TypeScript, it serves as a powerful bridge for programmatically managing your Google Ads accounts.

### 🎯 Key Features

- **Account Management**: Manage multiple Google Ads accounts
- **Campaign Creation & Management**: Search, Display, Shopping, Video campaign types
- **Ad Group Management**: Bidding strategies and budget control
- **Keyword Management**: Add/edit positive and negative keywords
- **Performance Tracking**: Detailed metrics and reporting
- **Conversion Tracking**: Conversion action management

## 📋 Available Tools

### 🎯 Campaign Tools
1. **`list_campaigns`** - List all campaigns with performance metrics
2. **`create_campaign`** - Create new campaign (Search, Display, Shopping, Video, Multi-channel)
3. **`update_campaign`** - Update campaign settings (name, status, budget)

### 📁 Ad Group Tools
1. **`list_ad_groups`** - List ad groups with metrics
2. **`create_ad_group`** - Create new ad group
3. **`update_ad_group`** - Update ad group settings
4. **`get_ad_group`** - Get specific ad group details

### 📢 Ad Tools
1. **`list_ads`** - List ads with performance data
2. **`create_responsive_search_ad`** - Create responsive search ads
3. **`update_ad_status`** - Update ad status

### 🔍 Keyword Tools
1. **`list_keywords`** - List keywords with performance data
2. **`add_keywords`** - Add new keywords to ad group
3. **`add_negative_keywords`** - Add negative keywords (campaign or ad group level)
4. **`update_keyword`** - Update keyword status and bid

### 🎯 Conversion Tracking Tools
1. **`list_conversions`** - List all conversion actions
2. **`create_conversion`** - Create new conversion action
3. **`update_conversion`** - Update conversion settings

### 📊 Performance & Analytics Tools
1. **`get_account_performance`** - Account-level performance metrics
2. **`get_campaign_performance`** - Campaign performance report (daily segmentation)
3. **`get_ad_group_performance`** - Ad group performance report
4. **`get_search_terms_report`** - Search terms analysis

### 🛍️ Shopping Campaign Tools
1. **`get_shopping_performance`** - Shopping campaign performance
2. **`get_product_performance`** - Product-based performance analysis

### 👤 Account Management Tools
1. **`list_accounts`** - List all accessible Google Ads accounts
2. **`get_account_hierarchy`** - Show Manager/Client account relationships

## 🛠️ Installation Steps

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Ads API access
- Claude Desktop (for MCP integration)

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/google-ads-mcp.git
cd google-ads-mcp
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Obtain Google Ads API Credentials

#### a) Get Developer Token
1. Visit https://developers.google.com/google-ads/api/docs/get-started/dev-token
2. Sign in with your Google Ads account
3. Apply for a developer token

#### b) Create OAuth2 Credentials
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Desktop app" as application type
6. Save your Client ID and Client Secret

#### c) Get Refresh Token
1. Use Google OAuth2 Playground: https://developers.google.com/oauthplayground/
2. Or use helper scripts from Google Ads API examples

### 5. Set Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` file:
```env
GOOGLE_ADS_CLIENT_ID=your-client-id-here
GOOGLE_ADS_CLIENT_SECRET=your-client-secret-here
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token-here
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token-here
GOOGLE_ADS_CUSTOMER_ID=your-customer-id-here

# For manager accounts (optional)
GOOGLE_ADS_LOGIN_CUSTOMER_ID=your-login-customer-id-here
```

### 6. Build the Project
```bash
npm run build
```

### 7. Claude Desktop Configuration

To add the MCP server to Claude Desktop:

1. Open Claude Desktop settings
2. Use the example from `claude-desktop-config.example.json` to configure:

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "node",
      "args": ["/absolute/path/to/google-ads-mcp/dist/index.js"],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id",
        "GOOGLE_ADS_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "your-developer-token",
        "GOOGLE_ADS_REFRESH_TOKEN": "your-refresh-token",
        "GOOGLE_ADS_CUSTOMER_ID": "your-customer-id"
      }
    }
  }
}
```

3. Restart Claude Desktop

## 💻 Development

### Run in Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Start in Production Mode
```bash
npm start
```

## 🏗️ Project Structure

```
google-ads-mcp/
├── src/
│   ├── index.ts              # Main MCP server file
│   ├── config.ts             # Configuration management
│   ├── google-ads-client.ts  # Google Ads API client
│   └── tools/                # MCP tool implementations
│       ├── accounts.ts       # Account management tools
│       ├── campaigns.ts      # Campaign tools
│       ├── ad-groups.ts      # Ad group tools
│       ├── ads.ts           # Ad tools
│       ├── keywords.ts      # Keyword tools
│       ├── conversions.ts   # Conversion tracking tools
│       ├── performance.ts   # Performance reporting tools
│       ├── analytics.ts     # Analytics tools
│       └── shopping.ts      # Shopping campaign tools
├── dist/                    # Compiled JavaScript files
├── .env.example            # Example environment variables
├── claude-desktop-config.example.json  # Example Claude Desktop config
├── package.json            # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT