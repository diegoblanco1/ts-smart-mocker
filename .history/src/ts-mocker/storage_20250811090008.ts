import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the absolute path to the storage file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_FILE = path.join(__dirname, '..', '..', 'responses.json');

export const loadResponses = async (): Promise<Record<string, any>> => {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty object
    return {};
  }
};

export const saveResponses = async (responses: Record<string, any>): Promise<void> => {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(responses, null, 2));
};

export const clearResponses = async (): Promise<void> => {
  await fs.writeFile(STORAGE_FILE, '{}');
};
