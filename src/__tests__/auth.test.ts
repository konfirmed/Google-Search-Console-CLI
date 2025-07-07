import { getAuthClient } from '../utils/auth';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock dependencies
jest.mock('fs');
jest.mock('readline-sync');
jest.mock('googleapis');

// Mock the open module properly
jest.mock('open', () => jest.fn());

const mockFs = fs as jest.Mocked<typeof fs>;
const mockReadlineSync = require('readline-sync');
const mockGoogle = require('googleapis');
const mockOpen = require('open');

describe('Authentication', () => {
  const originalEnv = process.env;
  const TOKEN_PATH = path.join(os.homedir(), '.gsc-cli', 'token.json');

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    
    // Setup Google API mock
    mockGoogle.auth = {
      OAuth2: jest.fn(),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getAuthClient', () => {
    it('should throw error when CLIENT_ID is missing', async () => {
      delete process.env.CLIENT_ID;
      delete process.env.CLIENT_SECRET;

      await expect(getAuthClient()).rejects.toThrow(
        'Missing CLIENT_ID or CLIENT_SECRET environment variables'
      );
    });

    it('should throw error when CLIENT_SECRET is missing', async () => {
      process.env.CLIENT_ID = 'test-client-id';
      delete process.env.CLIENT_SECRET;

      await expect(getAuthClient()).rejects.toThrow(
        'Missing CLIENT_ID or CLIENT_SECRET environment variables'
      );
    });

    it('should return OAuth2Client when valid credentials are provided', async () => {
      process.env.CLIENT_ID = 'test-client-id';
      process.env.CLIENT_SECRET = 'test-client-secret';

      // Mock stored token exists and is valid
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      }));

      // Mock OAuth2 client
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
        getAccessToken: jest.fn().mockResolvedValue('test-access-token'),
      };
      mockGoogle.auth.OAuth2.mockReturnValue(mockOAuth2Client);

      const result = await getAuthClient();
      
      expect(result).toBeDefined();
      expect(result.setCredentials).toBeDefined();
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      });
    });

    it('should initiate OAuth flow when no stored token exists', async () => {
      process.env.CLIENT_ID = 'test-client-id';
      process.env.CLIENT_SECRET = 'test-client-secret';

      // Mock no stored token
      mockFs.existsSync.mockReturnValue(false);

      // Mock OAuth2 client
      const mockOAuth2Client = {
        generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/oauth/authorize'),
        getToken: jest.fn().mockResolvedValue({
          tokens: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
          },
        }),
        setCredentials: jest.fn(),
      };
      mockGoogle.auth.OAuth2.mockReturnValue(mockOAuth2Client);

      // Mock user input
      mockReadlineSync.question.mockReturnValue('test-auth-code');

      // Mock file operations
      mockFs.mkdirSync.mockReturnValue(undefined);
      mockFs.writeFileSync.mockReturnValue(undefined);
      mockFs.chmodSync.mockReturnValue(undefined);

      const result = await getAuthClient();

      expect(result).toBeDefined();
      expect(mockOAuth2Client.generateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });
      expect(mockOAuth2Client.getToken).toHaveBeenCalledWith('test-auth-code');
      expect(mockOpen).toHaveBeenCalledWith('https://accounts.google.com/oauth/authorize');
    });

    it('should throw error when authorization code is empty', async () => {
      process.env.CLIENT_ID = 'test-client-id';
      process.env.CLIENT_SECRET = 'test-client-secret';

      // Mock no stored token
      mockFs.existsSync.mockReturnValue(false);

      // Mock OAuth2 client
      const mockOAuth2Client = {
        generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/oauth/authorize'),
      };
      mockGoogle.auth.OAuth2.mockReturnValue(mockOAuth2Client);

      // Mock empty user input
      mockReadlineSync.question.mockReturnValue('');

      await expect(getAuthClient()).rejects.toThrow('Authorization code is required');
    });

    it('should handle token exchange errors', async () => {
      process.env.CLIENT_ID = 'test-client-id';
      process.env.CLIENT_SECRET = 'test-client-secret';

      // Mock no stored token
      mockFs.existsSync.mockReturnValue(false);

      // Mock OAuth2 client
      const mockOAuth2Client = {
        generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/oauth/authorize'),
        getToken: jest.fn().mockRejectedValue(new Error('Invalid authorization code')),
      };
      mockGoogle.auth.OAuth2.mockReturnValue(mockOAuth2Client);

      // Mock user input
      mockReadlineSync.question.mockReturnValue('invalid-code');

      await expect(getAuthClient()).rejects.toThrow('Failed to exchange authorization code: Invalid authorization code');
    });
  });
});
