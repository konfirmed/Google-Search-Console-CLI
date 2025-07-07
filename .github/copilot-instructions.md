<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GSC CLI Project Instructions

This is a TypeScript CLI project for Google Search Console API with OAuth authentication.

## Project Context

- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Main Purpose**: Command-line interface for Google Search Console API
- **Authentication**: OAuth 2.0 with secure token storage
- **API**: Google Search Console API v3

## Key Technologies

- **CLI Framework**: Commander.js
- **OAuth**: Google Auth Library
- **API Client**: Google APIs Node.js Client
- **Testing**: Jest with ts-jest
- **Build**: TypeScript compiler

## Code Style Guidelines

- Use async/await for asynchronous operations
- Implement proper error handling with descriptive messages
- Use TypeScript strict mode and proper type annotations
- Follow OAuth 2.0 best practices for secure authentication
- Store tokens securely with appropriate file permissions (0o600)
- Use environment variables for sensitive configuration

## Security Considerations

- Never commit OAuth credentials to version control
- Use secure token storage in `~/.gsc-cli/token.json`
- Implement proper error handling for authentication failures
- Use read-only scopes for Google Search Console API

## Testing Guidelines

- Mock external dependencies (Google APIs, file system, user input)
- Test authentication flows and error scenarios
- Verify secure token storage and retrieval
- Test CLI command parsing and execution

## Common Patterns

- All CLI commands should authenticate before API calls
- Use consistent error handling across all commands
- Format API responses in user-friendly output
- Implement proper TypeScript types for API responses
