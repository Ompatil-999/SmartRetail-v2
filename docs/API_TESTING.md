# API Testing with Postman

This directory contains documentation about testing the SmartRetail API.

## Postman Collection

Instead of committing the Postman collection to the repository, you can:

1. **Import from GitHub**: Copy the collection data from your local Postman export
2. **Share via Postman**: Use Postman's team workspace feature to share collections
3. **Generate from Code**: Use tools like `openapi-generator` to auto-generate from OpenAPI/Swagger specs

## Environment Variables

Create a `.postman_environment.json` file locally (add to `.gitignore`) with:
```json
{
  "baseUrl": "http://localhost:8080/api/v1",
  "token": "your-auth-token"
}
```

## API Base URL

- **Development**: `http://localhost:8080/api/v1`
- **Production**: Update based on your deployment

## Quick Setup

1. Install Postman: https://www.postman.com/downloads/
2. Create a new collection
3. Add requests for each endpoint (Auth, Store, Categories, Products, Customers, Billing, Offers)
4. Set up environment variables for dynamic values
