import { MockConfig, StoredResponse, ApiMockerOptions, MockResponse } from './types.js';
import { loadResponses, saveResponses, clearResponses } from './storage.js';

// Configure node-fetch to use HTTPS
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Set to true in production
});

// Override fetch to use our agent
const fetchWithAgent = (url: RequestInfo, options: RequestInit = {}) => {
  const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
  return fetch(urlStr, { ...options, agent: httpsAgent });
};

/**
 * Utility function to calculate hash code for request body
 * @param str The string to hash
 * @returns A 32-bit hash code
 */
const hashCode = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Main API mocking class that handles both real and mocked API calls
 */
export class ApiMocker {
  /** Private options configuration */
  private options: ApiMockerOptions;
  /** Private state management */
  private state = {
    /** Current mocking state */
    isMocking: false as boolean,
    /** List of configured mocks */
    mocks: [] as MockConfig[],
    /** Stored API responses */
    storedResponses: new Map<string, StoredResponse>()
  };

  /**
   * Get current configuration
   * @returns Current configuration state
   */
  public get config() {
    return {
      /** Whether mocking is currently enabled */
      isMocking: this.state.isMocking,
      /** Whether to store real API responses */
      storeRealResponses: this.options.storeRealResponses,
      /** Whether to store error responses */
      storeErrorResponses: this.options.storeErrorResponses,
      /** Default delay for mocked responses */
      defaultDelay: this.options.defaultDelay,
    };
  }

  /**
   * Create a new instance of ApiMocker
   * @param options Optional configuration to override environment variables
   */
  constructor(options: ApiMockerOptions = {}) {
    // Read environment variables
    const env = {
      /** Whether to enable API mocking */
      isMocking: process.env.MOCKING_ENABLED === 'true',
      /** Default delay in milliseconds for mocked responses */
      defaultDelay: parseInt(process.env.MOCKING_DELAY || '1000'),
      /** Whether to store real API responses */
      storeRealResponses: process.env.MOCKING_STORE_REAL_API_CALL === 'true',
      /** Whether to store error responses when storing real API is enabled */
      storeErrorResponses: process.env.MOCKING_SAVE_ERROR_RESPONSE === 'true'
    };

    // Initialize options with environment variables as defaults
    this.options = {
      /** Whether to store real API responses */
      storeRealResponses: options.storeRealResponses ?? env.storeRealResponses,
      /** Whether to store error responses */
      storeErrorResponses: options.storeErrorResponses ?? env.storeErrorResponses,
      /** Default delay in milliseconds for mocked responses */
      defaultDelay: options.defaultDelay ?? env.defaultDelay,
      /** Whether to enable API mocking */
      isMocking: options.isMocking ?? env.isMocking
    };

    // Ensure boolean values
    this.state.isMocking = Boolean(this.options.isMocking);

    if (this.options.storeRealResponses) {
      this.loadStoredResponses();
    }
  }

  /**
   * Load stored API responses from persistent storage
   */
  private async loadStoredResponses(): Promise<void> {
    try {
      const responses = await loadResponses();
      const newMap = new Map<string, StoredResponse>();
      Object.entries(responses).forEach(([key, value]) => {
        newMap.set(key, value as StoredResponse);
      });
      this.state.storedResponses = newMap;
    } catch (error) {
      console.error('Error loading stored responses:', error);
    }
  }

  /**
   * Save current stored responses to persistent storage
   */
  private async saveToStorage(): Promise<void> {
    if (this.options.storeRealResponses) {
      const responsesObj = Object.fromEntries(this.state.storedResponses);
      await saveResponses(responsesObj);
    }
  }

  /**
   * Enable API mocking
   */
  public enableMocking(): void {
    this.state.isMocking = true;
  }

  /**
   * Disable API mocking
   */
  public disableMocking(): void {
    this.state.isMocking = false;
  }

  /**
   * Add a new mock configuration
   * @param config Mock configuration to add
   */
  public addMock(config: MockConfig): void {
    // Only add if not already present (avoid duplicate mocks)
    const exists = this.state.mocks.some(
      (m: MockConfig) => m.endpoint === config.endpoint && m.method === config.method
    );
    if (!exists) {
      const delay = config.delay ?? this.options.defaultDelay;
      this.state.mocks.push({ ...config, delay });
    }
  }

  public getStoredResponse(url: string, method: string, requestBody?: any): StoredResponse | undefined {
    const key = `${url}_${method}_${hashCode(JSON.stringify(requestBody || {}))}`;
    return this.state.storedResponses.get(key);
  }

  public getStoredResponses(): StoredResponse[] {
    return Array.from(this.state.storedResponses.values());
  }

  public async clearStoredResponses(): Promise<void> {
    this.state.storedResponses = new Map<string, StoredResponse>();
    await this.saveToStorage();
  }

  /**
   * Enable error response storage
   */
  public enableErrorResponseStorage(): void {
    this.options.storeErrorResponses = true;
    console.log('Error response storage enabled');
  }

  /**
   * Disable error response storage
   */
  public disableErrorResponseStorage(): void {
    this.options.storeErrorResponses = false;
    console.log('Error response storage disabled');
  }

  /**
   * Check if error response storage is enabled
   * @returns Whether error response storage is enabled
   */
  public isErrorResponseStorageEnabled(): boolean {
    return Boolean(this.options.storeErrorResponses);
  }

  /**
   * Enable real response storage
   */
  public enableRealResponseStorage(): void {
    this.options.storeRealResponses = true;
    console.log('Real response storage enabled');
  }

  /**
   * Disable real response storage
   */
  public disableRealResponseStorage(): void {
    this.options.storeRealResponses = false;
    console.log('Real response storage disabled');
  }

  /**
   * Check if real response storage is enabled
   * @returns Whether real response storage is enabled
   */
  public isRealResponseStorageEnabled(): boolean {
    return Boolean(this.options.storeRealResponses);
  }

  // Helper to convert Headers to Record<string, string>
  private headersToRecord(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Smart fetch method that handles both real and mocked API calls
   * @param input URL or RequestInfo object
   * @param init Optional request initialization options
   * @returns Promise that resolves to a MockResponse
   */
  /**
   * Smart fetch method that handles both real and mocked API calls with error handling
   * @param input URL or RequestInfo object
   * @param init Optional request initialization options
   * @returns Promise that resolves to a MockResponse
   */
  public async smartFetch(input: RequestInfo, init?: RequestInit): Promise<MockResponse> {
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method || 'GET';
    const requestBody = init?.body;

    try {
      // 1. If mocking is enabled, try to retrieve stored response
      if (this.state.isMocking) {
        const storedResponse = this.getStoredResponse(url, method, requestBody);
        if (storedResponse) {
          return {
            json: () => Promise.resolve(storedResponse.response),
            headers: storedResponse.headers,
            ok: true,
            status: 200,
            statusText: 'OK',
            clone: () => response.clone(),
            text: () => Promise.resolve(JSON.stringify(storedResponse.response))
          } as unknown as MockResponse;
        }
      }

      // 2. If not mocking or no stored response, make real API call
      const response = await fetchWithAgent(input, init);

      // Handle non-200 status codes as errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}, data: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      // 3. If store real responses is enabled, save the response
      if (this.options.storeRealResponses) {
        const key = `${url}_${method}_${hashCode(JSON.stringify(requestBody || {}))}`;
        
        // Store both successful and error responses
        this.state.storedResponses.set(key, {
          response: {
            data,
            error: null,
            success: true
          },
          timestamp: new Date().toISOString(),
          headers: this.headersToRecord(response.headers),
          request: { 
            url, 
            method, 
            body: requestBody,
            headers: init?.headers ? this.headersToRecord(new Headers(init.headers as string[][])) : undefined
          }
        });
        await this.saveToStorage();
      }

      // Return the real response
      return {
        json: () => Promise.resolve(data),
        headers: this.headersToRecord(response.headers),
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        clone: () => response.clone(),
        text: () => response.text()
      } as unknown as MockResponse;

    } catch (error) {
      // Store error responses if configured
      if (this.options.storeRealResponses && this.options.storeErrorResponses) {
        const key = `${url}_${method}_${hashCode(JSON.stringify(requestBody || {}))}`;
        
        // Store the error with its details
        this.state.storedResponses.set(key, {
          response: {
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              name: error instanceof Error ? error.name : 'Error',
              stack: error instanceof Error ? error.stack : null
            },
            data: null,
            success: false
          },
          timestamp: new Date().toISOString(),
          headers: {},
          request: { 
            url, 
            method, 
            body: requestBody,
            headers: init?.headers ? this.headersToRecord(new Headers(init.headers as string[][])) : undefined
          }
        });
        await this.saveToStorage();
      }

      // Throw the error wrapped in a MockResponse for consistent handling
      throw { 
        json: () => Promise.resolve({
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'Error',
            stack: error instanceof Error ? error.stack : null
          },
          data: null,
          success: false
        }),
        headers: {},
        ok: false,
        status: error instanceof Error && error.name === 'TypeError' ? 0 : 500,
        statusText: error instanceof Error ? error.message : 'Unknown error',
        clone: () => ({
          json: () => Promise.resolve({
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              name: error instanceof Error ? error.name : 'Error',
              stack: error instanceof Error ? error.stack : null
            },
            data: null,
            success: false
          })
        }),
        text: () => Promise.resolve(error instanceof Error ? error.message : 'Unknown error')
      } as unknown as MockResponse;
    }
  }
}
