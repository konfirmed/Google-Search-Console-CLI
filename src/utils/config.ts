import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.gsc-cli');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export interface Config {
  defaultSite?: string;
  defaultDimensions?: string;
  defaultMetrics?: string;
  defaultRowLimit?: number;
  defaultStartDaysAgo?: number;
  defaultEndDaysAgo?: number;
  outputFormat?: 'table' | 'json' | 'csv';
}

const DEFAULT_CONFIG: Config = {
  defaultDimensions: 'query',
  defaultMetrics: 'clicks,impressions,ctr,position',
  defaultRowLimit: 100,
  defaultStartDaysAgo: 30,
  defaultEndDaysAgo: 3,
  outputFormat: 'table'
};

/**
 * Load configuration from file
 */
export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
      const userConfig = JSON.parse(configData);
      return { ...DEFAULT_CONFIG, ...userConfig };
    }
  } catch (error) {
    console.warn('Warning: Could not load config file, using defaults');
  }
  return DEFAULT_CONFIG;
}

/**
 * Save configuration to file
 */
export function saveConfig(config: Config): void {
  try {
    // Ensure directory exists
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // Save config
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    fs.chmodSync(CONFIG_PATH, 0o600);
    
    console.log(`Configuration saved to: ${CONFIG_PATH}`);
  } catch (error) {
    console.error('Error saving config:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get config file path
 */
export function getConfigPath(): string {
  return CONFIG_PATH;
}
