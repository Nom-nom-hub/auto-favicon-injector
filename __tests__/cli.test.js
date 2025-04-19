'use strict';

const path = require('path');
const fs = require('fs-extra');
const cheerio = require('cheerio');
const { spawn } = require('child_process');

// Setup test directory
const TEMP_DIR = path.join(__dirname, 'temp-cli-test-dir');
const CLI_PATH = path.join(__dirname, '../bin/inject-favicon.js');

// Global mocks for console methods
beforeEach(() => {
  // Disable console output during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console mocks
  console.log.mockRestore();
  console.error.mockRestore();
});

// Helper function to check if HTML has a favicon
function hasFavicon(html, expectedFaviconPath = null) {
  const $ = cheerio.load(html);
  const links = $('link');
  
  for (let i = 0; i < links.length; i++) {
    const link = $(links[i]);
    const rel = link.attr('rel');
    
    if (rel && (rel === 'icon' || rel === 'shortcut icon')) {
      if (expectedFaviconPath) {
        return link.attr('href') === expectedFaviconPath;
      }
      return true;
    }
  }
  return false;
}

// Helper function to run the CLI with arguments
function runCLI(args) {
  return new Promise((resolve, reject) => {
    const cli = spawn('node', [CLI_PATH, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    cli.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    cli.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    cli.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr
      });
    });
    
    cli.on('error', (error) => {
      reject(error);
    });
  });
}

describe('CLI', () => {
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
  
  // Reset the temp directory before each test
  beforeEach(async () => {
    await fs.emptyDir(TEMP_DIR);
  });
  
  test('should show help information', async () => {
    const result = await runCLI(['--help']);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('Options:');
  });
  
  test('should show version information', async () => {
    const result = await runCLI(['--version']);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/); // Semantic version number
  });
  
  test('should handle non-existent directory', async () => {
    const result = await runCLI([path.join(TEMP_DIR, 'non-existent')]);
    
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('does not exist');
  });
  
  test('should inject favicon into HTML files', async () => {
    // Create test files
    await fs.writeFile(
      path.join(TEMP_DIR, 'test1.html'), 
      '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>'
    );
    await fs.writeFile(
      path.join(TEMP_DIR, 'test2.html'), 
      '<!DOCTYPE html><html><head><title>Test</title><link rel="icon" href="/existing.ico"></head><body></body></html>'
    );
    
    const result = await runCLI([TEMP_DIR, '--favicon', '/test-favicon.ico']);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Operation completed successfully');
    
    // Verify the favicon was injected
    const test1Html = await fs.readFile(path.join(TEMP_DIR, 'test1.html'), 'utf8');
    expect(hasFavicon(test1Html, '/test-favicon.ico')).toBe(true);
    
    // Verify files with favicon were skipped
    const test2Html = await fs.readFile(path.join(TEMP_DIR, 'test2.html'), 'utf8');
    expect(hasFavicon(test2Html, '/existing.ico')).toBe(true);
  });
  
  test('should use advanced options', async () => {
    await fs.writeFile(
      path.join(TEMP_DIR, 'test.html'), 
      '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>'
    );
    
    const result = await runCLI([
      TEMP_DIR,
      '--favicon', '/custom-favicon.png',
      '--rel', 'shortcut icon',
      '--type', 'image/png',
      '--sizes', '32x32',
      '--verbose'
    ]);
    
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Using favicon options');
    
    // Verify the favicon was injected with correct attributes
    const testHtml = await fs.readFile(path.join(TEMP_DIR, 'test.html'), 'utf8');
    const $ = cheerio.load(testHtml);
    const link = $('link[rel="shortcut icon"]');
    
    expect(link.attr('href')).toBe('/custom-favicon.png');
    expect(link.attr('type')).toBe('image/png');
    expect(link.attr('sizes')).toBe('32x32');
  });
}); 