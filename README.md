# GSC CLI v1.1

A command-line interface for Google Search Console API with OAuth authentication.

## Features

- **Secure OAuth Authentication**: Browser-based OAuth flow with secure token storage
- **Site Management**: List and view site information
- **Search Analytics**: Query search performance data
- **Sitemap Management**: List, submit, and delete sitemaps
- **Token Management**: Secure token storage and revocation
- **Configuration Management**: Save and manage user preferences and defaults
- **Multiple Output Formats**: Export data as table, JSON, or CSV
- **Progress Indicators**: Visual feedback during API operations
- **Default Persistence**: Save frequently used options as defaults

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- A Google Cloud Project with Search Console API enabled

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd gsc-cli
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Install globally (optional):**
   ```bash
   npm install -g .
   ```

## Google Cloud Console Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Search Console API**

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Desktop application** as the application type
4. Give it a name (e.g., "GSC CLI")
5. Download the credentials JSON file

### 3. Configure Environment Variables

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```
   CLIENT_ID=your-google-client-id
   CLIENT_SECRET=your-google-client-secret
   ```

   Replace with the values from your downloaded credentials JSON file:
   - `CLIENT_ID`: The `client_id` field
   - `CLIENT_SECRET`: The `client_secret` field

## Usage

### First-time Authentication

When you run any command for the first time, the CLI will:

1. Open your default browser to Google's OAuth consent screen
2. Prompt you to authorize the application
3. Ask you to paste the authorization code
4. Save the token securely to `~/.gsc-cli/token.json`

Example:
```bash
gsc-cli sites
# Browser opens automatically
# Follow the OAuth flow
# Enter authorization code when prompted
```

### Commands

#### Authentication

```bash
# Authenticate with Google Search Console
gsc-cli auth

# Revoke stored tokens
gsc-cli revoke
```

#### Configuration

```bash
# View current configuration
gsc-cli config

# Set a configuration value
gsc-cli config-set defaultSite sc-domain:example.com
gsc-cli config-set outputFormat json
gsc-cli config-set defaultRowLimit 50

# Reset configuration to defaults
gsc-cli config-reset
```

#### Site Management

```bash
# List all sites
gsc-cli sites

# Get site information
gsc-cli site https://example.com
```

#### Search Analytics

```bash
# Query search analytics with defaults (last 30 days)
gsc-cli query https://example.com

# Query with custom date range
gsc-cli query https://example.com --start-date 2024-01-01 --end-date 2024-01-31

# Query with specific dimensions and metrics
gsc-cli query https://example.com --dimensions query,page --metrics clicks,impressions --row-limit 50

# Output as JSON
gsc-cli query https://example.com --output json

# Output as CSV
gsc-cli query https://example.com --output csv

# Save current options as defaults
gsc-cli query https://example.com --dimensions page --metrics clicks,impressions --save-defaults
```

##### Search Analytics Options

- `--start-date, -s`: Start date (YYYY-MM-DD, default: 30 days ago)
- `--end-date, -e`: End date (YYYY-MM-DD, default: 3 days ago)
- `--dimensions, -d`: Dimensions to group by (default: query)
  - Available: `query`, `page`, `country`, `device`, `searchAppearance`
- `--metrics, -m`: Metrics to include (default: clicks,impressions,ctr,position)
  - Available: `clicks`, `impressions`, `ctr`, `position`
- `--row-limit, -r`: Maximum rows to return (default: 100)
- `--output, -o`: Output format (default: table)
  - Available: `table`, `json`, `csv`
- `--save-defaults`: Save current options as defaults

#### Sitemap Management

```bash
# List sitemaps for a site
gsc-cli sitemaps https://example.com

# Submit a sitemap
gsc-cli submit-sitemap https://example.com https://example.com/sitemap.xml

# Delete a sitemap
gsc-cli delete-sitemap https://example.com https://example.com/sitemap.xml
```

### Examples

```bash
# Get top 20 queries for the last 7 days
gsc-cli query https://example.com \
  --start-date 2024-01-01 \
  --end-date 2024-01-07 \
  --dimensions query \
  --metrics clicks,impressions,ctr,position \
  --row-limit 20

# Get page performance data
gsc-cli query https://example.com \
  --dimensions page \
  --metrics clicks,impressions \
  --row-limit 50

# Get country-wise performance
gsc-cli query https://example.com \
  --dimensions country \
  --metrics clicks,impressions
```

## Development

### Project Structure

```
src/
├── index.ts              # CLI entry point
├── utils/
│   ├── auth.ts          # OAuth authentication
│   └── gsc.ts           # Google Search Console API client
└── __tests__/
    └── auth.test.ts     # Authentication tests
```

### Available Scripts

```bash
# Development
npm run dev              # Run with ts-node
npm run build           # Build TypeScript
npm run start           # Run built JavaScript

# Testing
npm test                # Run Jest tests
npm run test:watch      # Run tests in watch mode

# Utilities
npm run clean           # Clean build directory
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Security

- **Token Storage**: OAuth tokens are stored in `~/.gsc-cli/token.json` with `600` permissions (owner read/write only)
- **Environment Variables**: Client credentials are stored in `.env` file (excluded from version control)
- **Secure Scope**: Only requests read-only access to Search Console data

## Troubleshooting

### Common Issues

#### "Missing CLIENT_ID or CLIENT_SECRET"

- Ensure you've copied `.env.example` to `.env`
- Verify your Google Cloud Console credentials are correctly set in `.env`
- Check that the credentials are for a "Desktop application" type

#### "Authorization failed"

- Ensure the Search Console API is enabled in your Google Cloud project
- Check that your OAuth consent screen is properly configured
- Verify the authorization code was copied correctly

#### "Token expired" or "Invalid credentials"

```bash
# Revoke and re-authenticate
gsc-cli revoke
gsc-cli auth
```

#### "Site not found" or "Permission denied"

- Ensure the site URL is exactly as it appears in Google Search Console
- Verify you have access to the site in Google Search Console
- Check that the site is verified in your Search Console account

### Token Management

```bash
# View token file location
ls -la ~/.gsc-cli/

# Remove token file manually
rm ~/.gsc-cli/token.json

# Revoke token via CLI
gsc-cli revoke
```

### Regenerating Credentials

If you need to regenerate your OAuth credentials:

1. Go to Google Cloud Console > Credentials
2. Delete the existing OAuth 2.0 client ID
3. Create a new "Desktop application" client ID
4. Update your `.env` file with the new credentials
5. Run `gsc-cli revoke` and `gsc-cli auth`

## API Limits

Google Search Console API has the following limits:

- **Queries per day**: 1,000 requests per day
- **Queries per 100 seconds**: 100 requests per 100 seconds
- **Query results**: Maximum 25,000 rows per query

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and ensure they pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Google Search Console API documentation
3. Open an issue on GitHub with detailed information about your problem

---

**Note**: This tool requires a Google Cloud Project with Search Console API enabled and valid OAuth credentials. The CLI only requests read-only access to your Search Console data.
