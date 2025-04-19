#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const { injectDir } = require('../lib/injector');
const pkg = require('../package.json');

// Set up CLI options
program
  .name('inject-favicon')
  .description('Automatically inject favicon links into HTML files')
  .version(pkg.version)
  .argument('<dir>', 'Directory to scan for HTML files')
  .option('-f, --favicon <path>', 'Path to the favicon file', '/favicon.ico')
  .option('-r, --rel <rel>', 'Relationship attribute (icon, shortcut icon, apple-touch-icon)', 'icon')
  .option('-t, --type <type>', 'MIME type of the favicon (auto-detected if not provided)')
  .option('-s, --sizes <sizes>', 'Size attribute for the favicon (e.g., "16x16", "32x32 48x48")')
  .option('-v, --verbose', 'Print detailed information')
  .action(async (dir, options) => {
    try {
      // Check if directory exists
      const targetDir = path.resolve(dir);
      if (!(await fs.pathExists(targetDir))) {
        console.error(`Error: Directory '${targetDir}' does not exist`);
        process.exit(1);
      }

      // Prepare favicon options
      const faviconOptions = {
        path: options.favicon,
        rel: options.rel
      };
      
      // Add optional attributes if provided
      if (options.type) faviconOptions.type = options.type;
      if (options.sizes) faviconOptions.sizes = options.sizes;

      if (options.verbose) {
        console.log(`Scanning directory: ${targetDir}`);
        console.log('Using favicon options:');
        console.log(` - Path: ${faviconOptions.path}`);
        console.log(` - Rel: ${faviconOptions.rel}`);
        if (faviconOptions.type) console.log(` - Type: ${faviconOptions.type}`);
        if (faviconOptions.sizes) console.log(` - Sizes: ${faviconOptions.sizes}`);
      }

      // Inject favicons
      const stats = await injectDir(targetDir, faviconOptions);
      
      // Output results
      console.log('\nOperation completed successfully!');
      console.log(`Total HTML files found: ${stats.total}`);
      console.log(`Files injected with favicon: ${stats.injected}`);
      console.log(`Files skipped (already have favicon): ${stats.skipped}`);
      
      if (stats.failed > 0) {
        console.log(`Files failed to inject: ${stats.failed}`);
      }
      
    } catch (error) {
      console.error('\nError:', error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv); 