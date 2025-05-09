/**
 * Configuration for a mock endpoint
 */
export interface MockConfig {
  /** The endpoint URL to mock */
  endpoint: string;
  /** HTTP method to mock (GET, POST, etc.) */
  method: string;
  /** Response data to return when mocked */
  response: any;
  /** Optional delay in milliseconds before responding */
  delay?: number;
  /** Optional request configuration */
  request?: {
    /** URL of the request */
    url: string;
    /** HTTP method of the request */
    method: string;
    /** Request body */
    body?: any;
  };
}

/**
 * Environment variables interface
 */
interface Env {
  /** Enable API mocking (true/false) */
  MOCKING_ENABLED: string;
  /** Default delay in milliseconds for mocked responses */
  MOCKING_DELAY: string;
  /** Enable storing real API responses */
  MOCKING_STORE_REAL_API_CALL: string;
  /** Enable storing error responses when store real API is enabled */
  MOCKING_SAVE_ERROR_RESPONSE: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

import { Headers } from 'node-fetch';

/**
 * Type for HTTP headers initialization
 */
export type HeadersInit = Headers | string[][] | Record<string, string> | undefined;

/**
 * Stored API response with metadata
 */
export interface StoredResponse {
  /** The response data */
  response: any;
  /** Timestamp when the response was stored */
  timestamp: string;
  /** Response headers */
  headers: Record<string, string> | undefined;
  /** Original request information */
  request: {
    /** Request URL */
    url: string;
    /** HTTP method */
    method: string;
    /** Request body */
    body?: any;
    /** Request headers */
    headers: Record<string, string> | undefined;
  };
}

/**
 * Mocked Response type that extends node-fetch Response
 */
export type MockResponse = {
  /** Parse response as JSON */
  json(): Promise<any>;
  /** Response headers */
  headers: Record<string, string>;
  /** Whether the response is successful */
  ok: boolean;
  /** HTTP status code */
  status: number;
  /** Status text */
  statusText: string;
  /** Clone the response */
  clone(): Response;
  /** Get response as text */
  text(): Promise<string>;
  /** Additional properties */
  [key: string]: any;
};

// Type for the Request object from node-fetch
export type MockRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  [key: string]: any;
};

export interface ApiMockerOptions {
  storeRealResponses?: boolean;
  storeErrorResponses?: boolean;
  defaultDelay?: number;
  isMocking?: boolean;
}
