import { ApiMocker } from './index';

export async function runTests() {
  try {
    console.log('Starting API Mocker test...');

    // Create an instance of ApiMocker using environment variables
    const apiMocker = new ApiMocker({
      defaultDelay: parseInt(process.env.MOCKING_DELAY || '1000'),
      isMocking: process.env.MOCKING_ENABLED === 'true',
      storeRealResponses: process.env.MOCKING_STORE_REAL_API_CALL === 'true',
      storeErrorResponses: process.env.MOCKING_SAVE_ERROR_RESPONSE === 'true'
    });

    console.log('Configuration:', apiMocker.config);

    // First, make a real API call and store the response
    console.log('\n=== First Call: Real API (with storage) ===');
    const realEndpoint = 'https://jsonplaceholder.typicode.com/posts/1';
    try {
      const realResponse = await apiMocker.smartFetch(realEndpoint);
      const responseData = await realResponse.json();
      if (!realResponse.ok) {
        console.error('Error response:', responseData);
      } else {
        console.log('Real API Response:', {
          status: realResponse.status,
          data: responseData
        });
      }
    } catch (error) {
      console.error('First call error:', error);
      if (error instanceof Error) {
        if ('json' in error && typeof error.json === 'function') {
          try {
            const errorData = await (error as any).json();
            console.error('Error details:', errorData);
          } catch (jsonError) {
            console.error('Failed to parse error JSON:', jsonError);
          }
        }
      }
    }

    // Second call: Real API (POST request)
    console.log('\n=== Second Call: Real API (POST request) ===');
    const secondRealEndpoint = 'https://echo.free.beeceptor.com/sample-request?author=beeceptor';
    const secondRealResponse = await apiMocker.smartFetch(secondRealEndpoint, {
      method: 'POST',
      body: JSON.stringify({ name: "John Doe", age: 30, city: "New York" }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!secondRealResponse.ok) {
      const errorData = await secondRealResponse.json();
      console.error('Second call error:', {
        status: secondRealResponse.status,
        statusText: secondRealResponse.statusText,
        data: errorData
      });
    } else {
      const responseData = await secondRealResponse.json();
      console.log('Real API Response:', {
        status: secondRealResponse.status,
        data: responseData
      });
    }

    // Test error handling
    console.log('\n=== Testing Error Handling ===');
    const errorEndpoint = 'https://jsonplaceholder.typicode.com/nonexistent';
    try {
      const errorResponse = await apiMocker.smartFetch(errorEndpoint);
      const responseData = await errorResponse.json();
      if (!errorResponse.ok) {
        console.error('Expected error:', responseData);
      } else {
        console.log('Unexpected success:', responseData);
      }
    } catch (error: unknown) {
      console.log('Error caught as expected');
      if (error && typeof error === 'object' && 'json' in error) {
        const errorData = await (error as any).json();
        console.log('Error details:', errorData);
      } else {
        console.error('Error:', error instanceof Error ? error.message : String(error));
      }
    }

    // Enable mocking mode
    console.log('\n=== Enabling Mocking Mode ===');
    apiMocker.enableMocking();
    console.log('Mocking enabled:', apiMocker.config.isMocking);

    // Make the same call again in mocking mode
    console.log('\n=== Second Call: Mocked API ===');
    try {
      const mockedResponse = await apiMocker.smartFetch(realEndpoint);
      const responseData = await mockedResponse.json();
      if (!mockedResponse.ok) {
        const errorData = await mockedResponse.json();
        console.error('Error response:', {
          status: mockedResponse.status,
          statusText: mockedResponse.statusText,
          data: errorData
        });
      } else {
        console.log('Mocked API Response:', {
          status: mockedResponse.status,
          data: responseData
        });
      }
    } catch (error: unknown) {
      console.error('Mocked call error:', error);
      if (error && typeof error === 'object' && 'json' in error) {
        const errorData = await (error as { json: () => Promise<any> }).json();
        console.error('Error details:', errorData);
      }
    }



    // Compare responses
    console.log('\n=== Response Comparison ===');
    // Get the stored response for comparison
    const storedResponse = apiMocker.getStoredResponse(realEndpoint, 'GET');
    if (storedResponse) {
      console.log('Stored response found');
      console.log('Stored data:', JSON.stringify(storedResponse.response, null, 2));
    } else {
      console.log('No stored response found');
    }

    // Test error response storage methods
    console.log('\n=== Testing Error Response Storage Methods ===');
    console.log('Error storage initially enabled:', apiMocker.isErrorResponseStorageEnabled());
    
    // Disable error response storage
    apiMocker.disableErrorResponseStorage();
    console.log('Error storage after disabling:', apiMocker.isErrorResponseStorageEnabled());
    
    // Re-enable error response storage
    apiMocker.enableErrorResponseStorage();
    console.log('Error storage after re-enabling:', apiMocker.isErrorResponseStorageEnabled());

    // Test real response storage methods
    console.log('\n=== Testing Real Response Storage Methods ===');
    console.log('Real response storage initially enabled:', apiMocker.isRealResponseStorageEnabled());
    
    // Disable real response storage
    apiMocker.disableRealResponseStorage();
    console.log('Real response storage after disabling:', apiMocker.isRealResponseStorageEnabled());
    
    // Re-enable real response storage
    apiMocker.enableRealResponseStorage();
    console.log('Real response storage after re-enabling:', apiMocker.isRealResponseStorageEnabled());

  } catch (error) {
    console.error('API Error:', error);
  }
}

runTests()
