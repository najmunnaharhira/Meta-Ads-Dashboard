# Facebook Ads Management Dashboard

A custom web dashboard for managing Facebook ad campaigns using the Facebook Marketing API (Graph API). This dashboard allows you to view campaigns, manage their status, edit budgets, and preview ads in real-time.

## Features

### Module A: Authorization & Access Control
- Uses Facebook OAuth 2.0 with long-lived access tokens
- Required permissions: `ads_read`, `ads_management`, `read_insights`

### Module B: Real-time Campaign Dashboard
- View all campaigns from selected ad account
- Display campaign metrics: impressions, clicks, CTR, CPC, spend
- Date range filtering (Today, Yesterday, Last 7 Days, This Month)
- Real-time data refresh with auto-refresh every 5 minutes

### Module C: Ad Control System
- **Campaign Status Toggle**: Pause/Activate campaigns directly from the dashboard
- **Budget Editing**: Update daily budgets with automatic currency conversion (dollars to cents)
- Success notifications for all actions

### Module D: Ad Preview System
- Preview ads in Desktop and Mobile formats
- Modal popup with iframe integration
- Shows how ads appear on Facebook

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Axios** for API requests
- **date-fns** for date formatting
- **lucide-react** for icons

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Access Token**
   - Open `src/config.ts`
   - Update the `ACCESS_TOKEN` constant with your long-lived Facebook access token
   - **Important**: In production, use environment variables instead

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Access Token Setup

To get a long-lived access token:

1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app and get a short-lived token
3. Exchange it for a long-lived token using:
   ```
   GET /oauth/access_token?
     grant_type=fb_exchange_token&
     client_id={app-id}&
     client_secret={app-secret}&
     fb_exchange_token={short-lived-token}
   ```

## API Rate Limiting

The application includes built-in rate limiting:
- Minimum 200ms between requests
- Automatic retry with exponential backoff
- Error handling for rate limit errors (429)
- User-friendly error messages

## Data Refresh

- Manual refresh button in header
- Auto-refresh every 5 minutes
- Last refresh timestamp displayed
- Note about 15-20 minute data delay for historical data

## Error Handling

- Comprehensive error handling for all API calls
- Retry logic with exponential backoff
- User-friendly error notifications
- Handles token expiration, rate limits, and network errors

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard component
│   ├── CampaignTable.tsx      # Campaign data table
│   ├── StatusToggle.tsx       # Toggle switch for campaign status
│   ├── DateFilter.tsx         # Date range filter buttons
│   ├── AdPreviewModal.tsx    # Modal for ad preview
│   ├── BudgetEditModal.tsx   # Modal for budget editing
│   └── Notification.tsx      # Toast notification component
├── services/
│   └── facebookApi.ts        # Facebook Graph API service layer
├── hooks/
│   └── useNotification.tsx  # Notification hook
├── types.ts                  # TypeScript type definitions
├── config.ts                 # Configuration (API base URL, token)
└── App.tsx                   # Root component
```

## Usage

1. **Select Ad Account**: Use the dropdown in the header to select an ad account
2. **Filter by Date**: Click date range buttons (Today, Yesterday, etc.)
3. **Toggle Campaign Status**: Click the toggle switch in the Status column
4. **Edit Budget**: Click the edit icon next to the budget amount
5. **Preview Ad**: Click the "Preview" button in the Actions column
6. **Refresh Data**: Click the "Refresh" button or wait for auto-refresh

## Notes

- Facebook API uses cents for budget amounts - the app automatically converts between dollars and cents
- Data may have a 15-20 minute delay for historical insights
- Access tokens expire - use long-lived tokens or implement token refresh logic
- Rate limits apply - the app handles this automatically with retries

## Security Considerations

⚠️ **Important**: Never commit access tokens to version control. Use environment variables in production:

```typescript
// In production, use:
const ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
```

## License

This project is for internal use. Ensure compliance with Facebook's Platform Policy when using the Facebook Marketing API.
