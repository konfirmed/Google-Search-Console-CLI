#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { getAuthClient, revokeToken } from './utils/auth';
import { GSCClient } from './utils/gsc';
import { loadConfig, saveConfig, getConfigPath, Config } from './utils/config';
import { formatOutput } from './utils/formatter';
import ora from 'ora';

// Load environment variables
dotenv.config();

// Load user configuration
const config = loadConfig();

const program = new Command();

program
  .name('gsc-cli')
  .description('Google Search Console CLI tool')
  .version('1.1.0');

// Auth command
program
  .command('auth')
  .description('Authenticate with Google Search Console')
  .action(async () => {
    try {
      await getAuthClient();
      console.log('Authentication successful!');
    } catch (error) {
      console.error('Authentication failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Revoke command
program
  .command('revoke')
  .description('Revoke stored authentication tokens')
  .action(async () => {
    try {
      await revokeToken();
    } catch (error) {
      console.error('Failed to revoke token:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Config commands
program
  .command('config')
  .description('Manage configuration settings')
  .action(() => {
    console.log('Current configuration:');
    console.log(JSON.stringify(config, null, 2));
    console.log(`\nConfig file location: ${getConfigPath()}`);
  });

program
  .command('config-set <key> <value>')
  .description('Set a configuration value')
  .action((key: string, value: string) => {
    const newConfig = { ...config };
    
    // Handle different value types
    if (key === 'defaultRowLimit' || key === 'defaultStartDaysAgo' || key === 'defaultEndDaysAgo') {
      (newConfig as any)[key] = parseInt(value, 10);
    } else {
      (newConfig as any)[key] = value;
    }
    
    saveConfig(newConfig);
    console.log(`Set ${key} = ${value}`);
  });

program
  .command('config-reset')
  .description('Reset configuration to defaults')
  .action(() => {
    const defaultConfig: Config = {
      defaultDimensions: 'query',
      defaultMetrics: 'clicks,impressions,ctr,position',
      defaultRowLimit: 100,
      defaultStartDaysAgo: 30,
      defaultEndDaysAgo: 3,
      outputFormat: 'table'
    };
    saveConfig(defaultConfig);
    console.log('Configuration reset to defaults');
  });

// List sites command
program
  .command('sites')
  .description('List all sites in Google Search Console')
  .action(async () => {
    const spinner = ora('Loading sites...').start();
    
    try {
      const authClient = await getAuthClient();
      const gscClient = new GSCClient(authClient);
      
      const sites = await gscClient.listSites();
      
      spinner.stop();
      
      if (sites.siteEntry && sites.siteEntry.length > 0) {
        console.log('Your sites:');
        sites.siteEntry.forEach((site: any, index: number) => {
          console.log(`${index + 1}. ${site.siteUrl} (${site.permissionLevel})`);
        });
      } else {
        console.log('No sites found in your Google Search Console account.');
      }
    } catch (error) {
      spinner.stop();
      console.error('Failed to list sites:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Site info command
program
  .command('site <url>')
  .description('Get information about a specific site')
  .action(async (url: string) => {
    try {
      const authClient = await getAuthClient();
      const gscClient = new GSCClient(authClient);
      
      const site = await gscClient.getSite(url);
      console.log('Site information:');
      console.log(JSON.stringify(site, null, 2));
    } catch (error) {
      console.error('Failed to get site information:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Query search analytics command
program
  .command('query <url>')
  .description('Query search analytics data for a site')
  .option('-s, --start-date <date>', 'Start date (YYYY-MM-DD)', getDefaultStartDate())
  .option('-e, --end-date <date>', 'End date (YYYY-MM-DD)', getDefaultEndDate())
  .option('-d, --dimensions <dimensions>', 'Dimensions to group by (comma-separated)', config.defaultDimensions)
  .option('-m, --metrics <metrics>', 'Metrics to include (comma-separated)', config.defaultMetrics)
  .option('-r, --row-limit <limit>', 'Maximum number of rows to return', config.defaultRowLimit?.toString())
  .option('-o, --output <format>', 'Output format (table, json, csv)', config.outputFormat)
  .option('--save-defaults', 'Save current options as defaults')
  .action(async (url: string, options: any) => {
    const spinner = ora('Querying Google Search Console...').start();
    
    try {
      const authClient = await getAuthClient();
      const gscClient = new GSCClient(authClient);
      
      const requestBody = {
        startDate: options.startDate,
        endDate: options.endDate,
        dimensions: options.dimensions.split(','),
        metrics: options.metrics.split(','),
        rowLimit: parseInt(options.rowLimit, 10)
      };
      
      const data = await gscClient.querySearchAnalytics(url, requestBody);
      
      spinner.stop();
      
      if (data.rows && data.rows.length > 0) {
        const output = formatOutput(
          url,
          options.startDate,
          options.endDate,
          data.rows,
          options.output
        );
        console.log(output);
      } else {
        console.log('No search analytics data found for the specified criteria.');
      }
      
      // Save defaults if requested
      if (options.saveDefaults) {
        const newConfig = { ...config };
        newConfig.defaultDimensions = options.dimensions;
        newConfig.defaultMetrics = options.metrics;
        newConfig.defaultRowLimit = parseInt(options.rowLimit, 10);
        newConfig.outputFormat = options.output;
        if (!newConfig.defaultSite) {
          newConfig.defaultSite = url;
        }
        saveConfig(newConfig);
        console.log('\nDefaults saved to configuration.');
      }
    } catch (error) {
      spinner.stop();
      console.error('Failed to query search analytics:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// List sitemaps command
program
  .command('sitemaps <url>')
  .description('List sitemaps for a site')
  .action(async (url: string) => {
    try {
      const authClient = await getAuthClient();
      const gscClient = new GSCClient(authClient);
      
      const sitemaps = await gscClient.listSitemaps(url);
      
      if (sitemaps.sitemap && sitemaps.sitemap.length > 0) {
        console.log(`Sitemaps for ${url}:`);
        sitemaps.sitemap.forEach((sitemap: any, index: number) => {
          console.log(`${index + 1}. ${sitemap.feedpath} (${sitemap.type}, ${sitemap.isPending ? 'Pending' : 'Processed'})`);
        });
      } else {
        console.log('No sitemaps found for this site.');
      }
    } catch (error) {
      console.error('Failed to list sitemaps:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Submit sitemap command
program
  .command('submit-sitemap <url> <sitemap-path>')
  .description('Submit a sitemap for a site')
  .action(async (url: string, sitemapPath: string) => {
    try {
      const authClient = await getAuthClient();
      const gscClient = new GSCClient(authClient);
      
      await gscClient.submitSitemap(url, sitemapPath);
      console.log(`Sitemap submitted successfully: ${sitemapPath}`);
    } catch (error) {
      console.error('Failed to submit sitemap:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Delete sitemap command
program
  .command('delete-sitemap <url> <sitemap-path>')
  .description('Delete a sitemap for a site')
  .action(async (url: string, sitemapPath: string) => {
    try {
      const authClient = await getAuthClient();
      const gscClient = new GSCClient(authClient);
      
      await gscClient.deleteSitemap(url, sitemapPath);
      console.log(`Sitemap deleted successfully: ${sitemapPath}`);
    } catch (error) {
      console.error('Failed to delete sitemap:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Helper functions
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - (config.defaultStartDaysAgo || 30));
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - (config.defaultEndDaysAgo || 3));
  return date.toISOString().split('T')[0];
}

// Parse command line arguments
program.parse();

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.help();
}
