import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GSCClient {
  private webmasters: any;

  constructor(private auth: OAuth2Client) {
    this.webmasters = google.webmasters({ version: 'v3', auth: this.auth });
  }

  /**
   * List all sites available in Google Search Console
   * @returns Promise with list of sites
   */
  async listSites() {
    try {
      const response = await this.webmasters.sites.list();
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list sites: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get site information
   * @param siteUrl - The URL of the site
   * @returns Promise with site information
   */
  async getSite(siteUrl: string) {
    try {
      const response = await this.webmasters.sites.get({
        siteUrl: siteUrl,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get site information: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Query search analytics data
   * @param siteUrl - The URL of the site
   * @param requestBody - Search analytics query parameters
   * @returns Promise with search analytics data
   */
  async querySearchAnalytics(siteUrl: string, requestBody: any) {
    try {
      const response = await this.webmasters.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: requestBody,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to query search analytics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List sitemaps for a site
   * @param siteUrl - The URL of the site
   * @returns Promise with list of sitemaps
   */
  async listSitemaps(siteUrl: string) {
    try {
      const response = await this.webmasters.sitemaps.list({
        siteUrl: siteUrl,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list sitemaps: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get sitemap information
   * @param siteUrl - The URL of the site
   * @param feedpath - The path of the sitemap
   * @returns Promise with sitemap information
   */
  async getSitemap(siteUrl: string, feedpath: string) {
    try {
      const response = await this.webmasters.sitemaps.get({
        siteUrl: siteUrl,
        feedpath: feedpath,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get sitemap information: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Submit a sitemap
   * @param siteUrl - The URL of the site
   * @param feedpath - The path of the sitemap
   * @returns Promise with submission result
   */
  async submitSitemap(siteUrl: string, feedpath: string) {
    try {
      const response = await this.webmasters.sitemaps.submit({
        siteUrl: siteUrl,
        feedpath: feedpath,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to submit sitemap: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a sitemap
   * @param siteUrl - The URL of the site
   * @param feedpath - The path of the sitemap
   * @returns Promise with deletion result
   */
  async deleteSitemap(siteUrl: string, feedpath: string) {
    try {
      const response = await this.webmasters.sitemaps.delete({
        siteUrl: siteUrl,
        feedpath: feedpath,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete sitemap: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
