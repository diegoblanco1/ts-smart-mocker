import dotenv from 'dotenv';
import { ApiMocker } from './api-mocker';
import { MockResponse, ApiMockerOptions, StoredResponse } from './types';

dotenv.config({ path: '.env.development' });

export { ApiMocker };
export type { MockResponse, ApiMockerOptions, StoredResponse };
