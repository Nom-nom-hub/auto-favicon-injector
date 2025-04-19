'use strict';

const favicon = require('../index');
const path = require('path');

async function runTest() {
  console.log('Testing auto-favicon-injector API...');
  
  // Test injecting into a single file
  const filePath = path.join(__dirname, 'index.html');
  console.log(`\nInjecting favicon into single file: ${filePath}`);
  try {
    const result = await favicon.injectFavicon(filePath, '/test-favicon.ico');
    console.log(`Result: ${result ? 'Favicon injected' : 'No injection (already exists or failed)'}`);
  } catch (err) {
    console.error('Error:', err);
  }
  
  // Test injecting into a directory
  const dirPath = __dirname;
  console.log(`\nInjecting favicon into directory: ${dirPath}`);
  try {
    const stats = await favicon.injectDir(dirPath, '/dir-favicon.ico');
    console.log('Results:');
    console.log(`- Total HTML files: ${stats.total}`);
    console.log(`- Files injected: ${stats.injected}`);
    console.log(`- Files skipped: ${stats.skipped}`);
    console.log(`- Files failed: ${stats.failed}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

runTest().catch(err => console.error('Unexpected error:', err)); 