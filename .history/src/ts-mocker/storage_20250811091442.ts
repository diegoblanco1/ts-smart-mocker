import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the absolute path to the storage file (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_FILE = path.join(process.cwd(), 'responses.json');

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
  // Ensure the directory exists
  await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });
  await fs.writeFile(STORAGE_FILE, JSON.stringify(responses, null, 2));
};

export const clearResponses = async (): Promise<void> => {
  try {
    await fs.unlink(STORAGE_FILE);
  } catch (error) {
    // File doesn't exist, ignore error
  }
};
