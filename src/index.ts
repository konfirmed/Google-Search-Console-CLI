#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { getAuthClient, revokeToken } from './utils/auth';
import { GSCClient } from './utils/gsc';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('gsc-cli')
  .description('Google Search Console CLI tool')
  .version('1.0.0');

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

// List sites command
program
  .command('sites')
  .description('List all sites in Google Search Console')
  .action(async () => {
    try {
      const authClient = await getAuthClient();
      const gscClient = new GSCClient(authClient);
      
      const sites = await gscClient.listSites();
      
      if (sites.siteEntry && sites.siteEntry.length > 0) {
        console.log('Your sites:');
        sites.siteEntry.forEach((site: any, index: number) => {
          console.log(`${index + 1}. ${site.siteUrl} (${site.permissionLevel})`);
        });
      } else {
        console.log('No sites found in your Google Search Console account.');
      }
    } catch (error) {
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
  .option('-d, --dimensions <dimensions>', 'Dimensions to group by (comma-separated)', 'query')
  .option('-m, --metrics <metrics>', 'Metrics to include (comma-separated)', 'clicks,impressions,ctr,position')
  .option('-r, --row-limit <limit>', 'Maximum number of rows to return', '100')
  .action(async (url: string, options: any) => {
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
      
      if (data.rows && data.rows.length > 0) {
        console.log(`Search Analytics Data for ${url}:`);
        console.log(`Date range: ${options.startDate} to ${options.endDate}`);
        console.log('---');
        
        data.rows.forEach((row: any, index: number) => {
          console.log(`${index + 1}. ${JSON.stringify(row, null, 2)}`);
        });
      } else {
        console.log('No search analytics data found for the specified criteria.');
      }
    } catch (error) {
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
  date.setDate(date.getDate() - 30); // 30 days ago
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 3); // 3 days ago (GSC data has a delay)
  return date.toISOString().split('T')[0];
}

// Parse command line arguments
program.parse();

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.help();
}
