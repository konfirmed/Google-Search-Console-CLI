# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-07-06

### Added
- **Configuration Management**: New config system to save user preferences
  - `gsc-cli config` - View current configuration
  - `gsc-cli config-set <key> <value>` - Set configuration values
  - `gsc-cli config-reset` - Reset to defaults
- **Multiple Output Formats**: Support for JSON and CSV output
  - `--output json` - Output results as JSON
  - `--output csv` - Output results as CSV
  - `--output table` - Default table format
- **Progress Indicators**: Visual spinners during API operations
- **Save Defaults**: `--save-defaults` flag to persist common options
- **Enhanced Configuration Options**:
  - `defaultSite` - Default site URL
  - `defaultDimensions` - Default query dimensions
  - `defaultMetrics` - Default metrics to include
  - `defaultRowLimit` - Default row limit
  - `defaultStartDaysAgo` - Default start date offset
  - `defaultEndDaysAgo` - Default end date offset
  - `outputFormat` - Preferred output format

### Improved
- Better user experience with loading indicators
- Configurable defaults reduce repetitive option usage
- Structured JSON/CSV output for easier data processing
- Enhanced CLI help and documentation

### Technical
- Added `ora` dependency for progress spinners
- New utility modules: `config.ts` and `formatter.ts`
- Type-safe configuration management
- Secure config file storage with proper permissions

## [1.0.0] - 2025-07-05

### Added
- Initial release with OAuth authentication
- Google Search Console API integration
- Basic CLI commands for sites, queries, and sitemaps
- Secure token storage
- TypeScript implementation with full type safety
