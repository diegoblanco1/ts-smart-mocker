# Storage Examples

This document provides practical examples of how TS API Mocker stores and manages API response data.

## Example 1: Basic Storage Setup

```typescript
import { ApiMocker } from 'ts-api-mocker';

// Initialize with storage enabled
const apiMocker = new ApiMocker({
  storeRealResponses: true,
  storeErrorResponses: true
});

// Make a real API call - response will be automatically stored
const response = await apiMocker.smartFetch('https://jsonplaceholder.typicode.com/users/1');
const userData = await response.json();

console.log('User data:', userData);
// This creates an entry in responses.json
```

## Example 2: Examining Stored Data

After the above call, your `responses.json` file will contain:

```json
{
  "https://jsonplaceholder.typicode.com/users/1_GET_0": {
    "response": {
      "id": 1,
      "name": "Leanne Graham",
      "username": "Bret",
      "email": "Sincere@april.biz",
      "address": {
        "street": "Kulas Light",
        "suite": "Apt. 556",
        "city": "Gwenborough",
        "zipcode": "92998-3874"
      }
    },
    "metadata": {
      "success": true
    },
    "timestamp": "2025-01-15T10:30:00.000Z",
    "headers": {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "max-age=43200"
    },
    "request": {
      "url": "https://jsonplaceholder.typicode.com/users/1",
      "method": "GET",
      "body": null,
      "headers": {}
    }
  }
}
```

## Example 3: Using Stored Responses

```typescript
// Enable mocking to use stored responses
apiMocker.enableMocking();

// This will now return the stored response instead of making a real API call
const cachedResponse = await apiMocker.smartFetch('https://jsonplaceholder.typicode.com/users/1');
const cachedData = await cachedResponse.json();

console.log('Cached data:', cachedData);
// Returns the same data as stored in responses.json
```

## Example 4: POST Request Storage

```typescript
const postData = { name: 'John Doe', email: 'john@example.com' };

// This will create a storage key that includes the request body hash
const response = await apiMocker.smartFetch('https://jsonplaceholder.typicode.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(postData)
});

// Storage key will be something like: 
// "https://jsonplaceholder.typicode.com/users_POST_-1234567890"
```

## Example 5: Managing Storage Programmatically

```typescript
// Get a specific stored response
const storedResponse = apiMocker.getStoredResponse(
  'https://jsonplaceholder.typicode.com/users/1',
  'GET'
);

if (storedResponse) {
  console.log('Found stored response:', storedResponse.response);
  console.log('Stored at:', storedResponse.timestamp);
}

// Get all stored responses
const allResponses = apiMocker.getStoredResponses();
console.log(`Total stored responses: ${allResponses.length}`);

// Clear all stored data
await apiMocker.clearStoredResponses();
console.log('All stored responses cleared');
```

## Example 6: Environment-Based Storage

```typescript
// Development environment - store everything
if (process.env.NODE_ENV === 'development') {
  const apiMocker = new ApiMocker({
    storeRealResponses: true,
    storeErrorResponses: true,
    isMocking: false // Use real APIs but store responses
  });
}

// Testing environment - use stored responses only
if (process.env.NODE_ENV === 'test') {
  const apiMocker = new ApiMocker({
    storeRealResponses: false, // Don't overwrite test data
    isMocking: true // Use stored responses exclusively
  });
}

// Production environment - no storage or mocking
if (process.env.NODE_ENV === 'production') {
  const apiMocker = new ApiMocker({
    storeRealResponses: false,
    storeErrorResponses: false,
    isMocking: false // Use real APIs only
  });
}
```

## Example 7: Custom Storage Location

If you want to customize where responses are stored, you can manually manage the storage:

```typescript
// Get responses and save to custom location
const responses = apiMocker.getStoredResponses();
const customData = {
  environment: 'staging',
  timestamp: new Date().toISOString(),
  responses: responses
};

// Save to custom file (you would implement this)
await saveToCustomLocation('staging-responses.json', customData);
```

## Best Practices from Examples

1. **Separate environments**: Use different storage strategies for dev/test/prod
2. **Version control**: Consider if responses.json should be in git
3. **Data cleanup**: Regularly clear old responses to prevent bloat
4. **Security**: Be careful with responses containing sensitive data
5. **Documentation**: Document which endpoints are mocked for your team
