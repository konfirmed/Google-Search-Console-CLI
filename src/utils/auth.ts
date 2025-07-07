import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline-sync';
import open from 'open';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const TOKEN_PATH = path.join(os.homedir(), '.gsc-cli', 'token.json');

/**
 * Get an authenticated OAuth2 client for Google Search Console API
 * @returns Promise<OAuth2Client> - Authenticated OAuth2 client
 */
export async function getAuthClient(): Promise<OAuth2Client> {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'Missing CLIENT_ID or CLIENT_SECRET environment variables. ' +
      'Please copy .env.example to .env and fill in your credentials.'
    );
  }

  // Create OAuth2 client
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  // Check if we have stored credentials
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokenData = fs.readFileSync(TOKEN_PATH, 'utf8');
      const credentials = JSON.parse(tokenData);
      oAuth2Client.setCredentials(credentials);
      
      // Verify the token is still valid
      try {
        await oAuth2Client.getAccessToken();
        return oAuth2Client;
      } catch (error) {
        console.log('Stored token is invalid, requesting new authorization...');
        // Continue to authorization flow
      }
    } catch (error) {
      console.log('Error reading stored token, requesting new authorization...');
      // Continue to authorization flow
    }
  }

  // Generate authorization URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Opening browser for Google OAuth authorization...');
  console.log('If the browser doesn\'t open automatically, please visit this URL:');
  console.log(authUrl);
  
  // Open the URL in the default browser
  try {
    await open(authUrl);
  } catch (error) {
    console.log('Failed to open browser automatically. Please open the URL manually.');
  }

  // Prompt for authorization code
  const code = readline.question('Enter the authorization code from the browser: ');
  
  if (!code || code.trim() === '') {
    throw new Error('Authorization code is required');
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Store the token to disk for future use
    await storeToken(tokens);

    console.log('Authorization successful! Token stored for future use.');
    return oAuth2Client;
  } catch (error) {
    throw new Error(`Failed to exchange authorization code: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Store OAuth2 tokens to disk
 * @param tokens - OAuth2 tokens to store
 */
async function storeToken(tokens: any): Promise<void> {
  try {
    // Create the directory if it doesn't exist
    const tokenDir = path.dirname(TOKEN_PATH);
    if (!fs.existsSync(tokenDir)) {
      fs.mkdirSync(tokenDir, { recursive: true });
    }

    // Write token to file with restricted permissions
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    
    // Set file permissions to owner read/write only (0o600)
    fs.chmodSync(TOKEN_PATH, 0o600);
    
    console.log(`Token stored to: ${TOKEN_PATH}`);
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
}

/**
 * Revoke stored tokens and remove token file
 */
export async function revokeToken(): Promise<void> {
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokenData = fs.readFileSync(TOKEN_PATH, 'utf8');
      const credentials = JSON.parse(tokenData);
      
      if (credentials.access_token) {
        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials(credentials);
        await oAuth2Client.revokeCredentials();
        console.log('Token revoked successfully.');
      }
    } catch (error) {
      console.log('Error revoking token:', error instanceof Error ? error.message : String(error));
    }
    
    // Remove token file
    fs.unlinkSync(TOKEN_PATH);
    console.log('Token file removed.');
  } else {
    console.log('No token file found.');
  }
}
