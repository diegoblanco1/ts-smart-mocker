import * as fs from 'fs/promises';
import * as path from 'path';

// Get the absolute path to the storage file
const STORAGE_FILE = path.join(__dirname, '..', 'dist', 'responses.json');

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
