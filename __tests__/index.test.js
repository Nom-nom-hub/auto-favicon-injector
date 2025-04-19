'use strict';

const path = require('path');
const fs = require('fs-extra');
const api = require('../index');

// Setup test directory
const TEMP_DIR = path.join(__dirname, 'temp-index-test-dir');

// Global mocks for console methods
beforeEach(() => {
  // Disable console output during tests
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console mocks
  console.warn.mockRestore();
  console.error.mockRestore();
});

// Before all tests, ensure the temp directory exists
beforeAll(async () => {
  if (await fs.pathExists(TEMP_DIR)) {
    await fs.remove(TEMP_DIR);
  }
  await fs.mkdir(TEMP_DIR);
});

// After all tests, clean up
afterAll(async () => {
  try {
    await fs.remove(TEMP_DIR);
  } catch (e) {
    // Ignore errors on cleanup
  }
});

describe('Index API', () => {
  // Reset the temp directory before each test
  beforeEach(async () => {
    await fs.emptyDir(TEMP_DIR);
  });
  
  test('injectFavicon should be exported correctly', async () => {
    // Create test file
    const testFile = path.join(TEMP_DIR, 'test.html');
    await fs.writeFile(
      testFile, 
      '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>'
    );
    
    // Verify the function exists and works
    expect(typeof api.injectFavicon).toBe('function');
    const result = await api.injectFavicon(testFile, '/test-favicon.ico');
    expect(result).toBe(true);
  });
  
  test('injectDir should be exported correctly', async () => {
    // Create test directory structure
    await fs.writeFile(
      path.join(TEMP_DIR, 'test.html'), 
      '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>'
    );
    
    // Verify the function exists and works
    expect(typeof api.injectDir).toBe('function');
    const stats = await api.injectDir(TEMP_DIR, '/test-favicon.ico');
    expect(stats.total).toBe(1);
    expect(stats.injected).toBe(1);
  });
}); 