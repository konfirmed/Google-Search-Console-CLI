import { Config } from './config';

export interface QueryResult {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface FormattedOutput {
  siteUrl: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  data: QueryResult[];
}

/**
 * Format query results based on output format
 */
export function formatOutput(
  siteUrl: string,
  startDate: string,
  endDate: string,
  data: any[],
  format: Config['outputFormat'] = 'table'
): string {
  const formattedData: FormattedOutput = {
    siteUrl,
    dateRange: { startDate, endDate },
    data: data.map(row => ({
      keys: row.keys || [],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    }))
  };

  switch (format) {
    case 'json':
      return JSON.stringify(formattedData, null, 2);
    
    case 'csv':
      return formatAsCSV(formattedData);
    
    default:
      return formatAsTable(formattedData);
  }
}

/**
 * Format as CSV
 */
function formatAsCSV(data: FormattedOutput): string {
  const headers = ['keys', 'clicks', 'impressions', 'ctr', 'position'];
  const csvRows = [headers.join(',')];
  
  data.data.forEach(row => {
    const values = [
      `"${row.keys.join(', ')}"`,
      row.clicks.toString(),
      row.impressions.toString(),
      row.ctr.toString(),
      row.position.toString()
    ];
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Format as table (existing format)
 */
function formatAsTable(data: FormattedOutput): string {
  let output = `Search Analytics Data for ${data.siteUrl}:\n`;
  output += `Date range: ${data.dateRange.startDate} to ${data.dateRange.endDate}\n`;
  output += '---\n';
  
  data.data.forEach((row, index) => {
    output += `${index + 1}. ${JSON.stringify(row, null, 2)}\n`;
  });
  
  return output;
}
