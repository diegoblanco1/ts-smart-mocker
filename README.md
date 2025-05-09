# TS API Mocker

A powerful TypeScript-based API mocking library for seamless development and testing.

## Features

- 🔄 **Smart Fetch**: Intercepts API calls and returns mocked data when enabled
- 💾 **Response Storage**: Automatically stores real API responses for future mocking
- 🐞 **Error Handling**: Captures and stores error responses for testing error scenarios
- ⏱️ **Configurable Delays**: Simulate network latency with customizable response delays
- 🔌 **Environment Control**: Toggle mocking on/off via environment variables or code
- 🔍 **Transparent**: Minimal code changes required to implement in existing projects

## Installation

```bash
npm install ts-api-mocker
```

## Quick Start

```typescript
import { ApiMocker } from 'ts-api-mocker';

// Create an instance with default settings
const apiMocker = new ApiMocker();

// Use smartFetch instead of fetch
async function getData() {
  const response = await apiMocker.smartFetch('https://api.example.com/data');
  return await response.json();
}
```

## Configuration

### Via Constructor

```typescript
const apiMocker = new ApiMocker({
  // Enable or disable mocking (default: false)
  isMocking: true,
  
  // Store real API responses for future mocking (default: false)
  storeRealResponses: true,
  
  // Store error responses (default: false)
  storeErrorResponses: true,
  
  // Default delay in milliseconds for mocked responses (default: 1000)
  defaultDelay: 500
});
```

### Via Environment Variables

Create a `.env.development` file:

```
MOCKING_ENABLED=true
MOCKING_DELAY=1000
MOCKING_STORE_REAL_API_CALL=true
MOCKING_SAVE_ERROR_RESPONSE=true
```

## Use Cases

### 1. Development Without Backend Dependencies

Work on frontend features without waiting for backend APIs to be ready.

```typescript
// Initialize with mocking enabled
const apiMocker = new ApiMocker({ isMocking: true });

// First, record a real response (or manually create mock data)
async function setupMocks() {
  // This will store the response for future use
  await apiMocker.smartFetch('https://api.example.com/users');
}

// Later in your application code
async function getUsers() {
  // This will return the mocked data when mocking is enabled
  const response = await apiMocker.smartFetch('https://api.example.com/users');
  return await response.json();
}
```

### 2. Testing Without External Dependencies

Create reliable tests that don't depend on external services.

```typescript
// In your test setup
const apiMocker = new ApiMocker({ 
  isMocking: true,
  storeRealResponses: false // Don't overwrite existing mocks during tests
});

// Test a component that makes API calls
test('displays user data correctly', async () => {
  // Your component uses apiMocker.smartFetch internally
  const component = render(<UserList />);
  
  // Assert that the component displays the mocked data correctly
  await waitFor(() => {
    expect(component.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 3. Simulating Error Scenarios

Test how your application handles API errors.

```typescript
// Enable error response storage
const apiMocker = new ApiMocker({ 
  isMocking: true,
  storeErrorResponses: true
});

// Store an error response
async function setupErrorMock() {
  try {
    // This will fail and store the error
    await apiMocker.smartFetch('https://api.example.com/invalid-endpoint');
  } catch (error) {
    console.log('Error captured for future mocking');
  }
}

// Test error handling in your application
async function testErrorHandling() {
  try {
    const data = await fetchUserData(); // Uses apiMocker internally
  } catch (error) {
    // Handle the error appropriately
    showErrorMessage(error.message);
  }
}
```

### 4. Dynamic Control During Runtime

Toggle mocking on and off during application execution.

```typescript
const apiMocker = new ApiMocker();

// Enable mocking for specific operations
function enterOfflineMode() {
  apiMocker.enableMocking();
  updateUIForOfflineMode();
}

// Disable mocking to use real APIs
function goOnline() {
  apiMocker.disableMocking();
  updateUIForOnlineMode();
}

// Toggle real response storage
function toggleDataCapture(enabled) {
  if (enabled) {
    apiMocker.enableRealResponseStorage();
  } else {
    apiMocker.disableRealResponseStorage();
  }
}
```

### 5. API Development and Testing

Use as a mock server during API development.

```typescript
// In your API development environment
const apiMocker = new ApiMocker({
  isMocking: true,
  defaultDelay: 300 // Faster responses during development
});

// Add custom mock responses
apiMocker.addMock({
  endpoint: '/api/users',
  method: 'GET',
  response: {
    users: [
      { id: 1, name: 'Alice', role: 'Admin' },
      { id: 2, name: 'Bob', role: 'User' }
    ],
    total: 2
  },
  delay: 500 // Custom delay for this endpoint
});

// Your API endpoint implementation
app.get('/api/users', async (req, res) => {
  // During development, this will return the mock
  // In production, it will call the real database
  const response = await apiMocker.smartFetch('/api/users');
  const data = await response.json();
  res.json(data);
});
```

## API Reference

### Main Class

#### `ApiMocker`

```typescript
// Create a new instance
const apiMocker = new ApiMocker(options);
```

### Methods

#### `smartFetch(input, init)`
Similar to the standard fetch API but with mocking capabilities.

#### `enableMocking()` / `disableMocking()`
Toggle mocking on or off.

#### `enableRealResponseStorage()` / `disableRealResponseStorage()`
Toggle storing of real API responses.

#### `enableErrorResponseStorage()` / `disableErrorResponseStorage()`
Toggle storing of error responses.

#### `addMock(config)`
Add a custom mock configuration.

#### `getStoredResponse(url, method, requestBody?)`
Retrieve a stored response.

#### `getStoredResponses()`
Get all stored responses.

#### `clearStoredResponses()`
Clear all stored responses.

### Configuration Properties

Access current configuration via the `config` property:

```typescript
const currentConfig = apiMocker.config;
console.log('Mocking enabled:', currentConfig.isMocking);
console.log('Store real responses:', currentConfig.storeRealResponses);
console.log('Store error responses:', currentConfig.storeErrorResponses);
console.log('Default delay:', currentConfig.defaultDelay);
```

## Best Practices

1. **Initialize Early**: Create the ApiMocker instance at the application's entry point.
2. **Centralize API Calls**: Create a service layer that uses ApiMocker for all API calls.
3. **Environment-Based Configuration**: Use different configurations for development, testing, and production.
4. **Version Control for Mocks**: Consider storing your response files in version control.
5. **Clear Documentation**: Document which endpoints are mocked and how they behave.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
