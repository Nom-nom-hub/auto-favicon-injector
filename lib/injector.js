'use strict';

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

/**
 * Checks if a file already has a favicon link
 * @param {CheerioAPI} $ - Cheerio instance loaded with HTML
 * @returns {boolean} - Whether file has a favicon
 */
function hasFavicon($) {
  const links = $('link');
  for (let i = 0; i < links.length; i++) {
    const rel = $(links[i]).attr('rel');
    if (rel && (rel === 'icon' || rel === 'shortcut icon' || rel === 'apple-touch-icon')) {
      return true;
    }
  }
  return false;
}

/**
 * Injects a favicon link into an HTML file
 * @param {string} filePath - Path to the HTML file
 * @param {Object|string} options - Options object or favicon path string
 * @param {string} options.path - Path to the favicon file
 * @param {string} options.rel - Relationship attribute (default: 'icon')
 * @param {string} options.type - MIME type of the favicon (auto-detected if not provided)
 * @param {string} options.sizes - Size attribute for the favicon
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function injectFavicon(filePath, options = '/favicon.ico') {
  try {
    // Check if file exists and is a regular file
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      console.warn(`Path is not a file: ${filePath}`);
      return false;
    }
    
    // Skip macOS metadata files (common on macOS file systems)
    if (path.basename(filePath).startsWith('._')) {
      console.warn(`Skipping macOS metadata file: ${filePath}`);
      return false;
    }

    // Handle string argument for backward compatibility
    if (typeof options === 'string') {
      options = { path: options };
    }

    // Set defaults
    const faviconOptions = {
      path: '/favicon.ico',
      rel: 'icon',
      type: null,
      sizes: null,
      ...options
    };

    // Auto-detect MIME type from extension if not provided
    if (!faviconOptions.type) {
      const ext = path.extname(faviconOptions.path).toLowerCase();
      switch (ext) {
        case '.ico':
          faviconOptions.type = 'image/x-icon';
          break;
        case '.png':
          faviconOptions.type = 'image/png';
          break;
        case '.svg':
          faviconOptions.type = 'image/svg+xml';
          break;
        case '.jpg':
        case '.jpeg':
          faviconOptions.type = 'image/jpeg';
          break;
        // No default type for unknown extensions
      }
    }

    // Read the file
    const html = await fs.readFile(filePath, 'utf8');
    
    // Load HTML into cheerio
    const $ = cheerio.load(html);
    
    // Skip if favicon already exists
    if (hasFavicon($)) {
      return false;
    }
    
    // Find the head tag
    const head = $('head');
    
    // If no head tag, we can't inject the favicon
    if (head.length === 0) {
      console.warn(`No <head> tag found in ${filePath}`);
      return false;
    }
    
    // Build the favicon link tag
    let linkTag = `<link rel="${faviconOptions.rel}" href="${faviconOptions.path}"`;
    
    if (faviconOptions.type) {
      linkTag += ` type="${faviconOptions.type}"`;
    }
    
    if (faviconOptions.sizes) {
      linkTag += ` sizes="${faviconOptions.sizes}"`;
    }
    
    linkTag += '>';
    
    // Inject the favicon link
    head.append(linkTag);
    
    // Write the updated HTML back to the file
    await fs.writeFile(filePath, $.html());
    
    return true;
  } catch (error) {
    console.error(`Error injecting favicon into ${filePath}:`, error);
    return false;
  }
}

/**
 * Recursively scans a directory and injects favicon into all HTML files
 * @param {string} dirPath - Path to the directory
 * @param {Object|string} options - Options object or favicon path string
 * @returns {Promise<{total: number, injected: number, skipped: number, failed: number}>} - Operation statistics
 */
async function injectDir(dirPath, options = '/favicon.ico') {
  const stats = {
    total: 0,
    injected: 0,
    skipped: 0,
    failed: 0
  };

  try {
    // Ensure the directory exists
    const exists = await fs.pathExists(dirPath);
    if (!exists) {
      throw new Error(`Directory ${dirPath} does not exist`);
    }

    // Read all files in the directory
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      // Skip macOS metadata files
      if (item.startsWith('._')) {
        continue;
      }
      
      const itemPath = path.join(dirPath, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        const subStats = await injectDir(itemPath, options);
        
        // Aggregate statistics
        stats.total += subStats.total;
        stats.injected += subStats.injected;
        stats.skipped += subStats.skipped;
        stats.failed += subStats.failed;
      } else if (stat.isFile() && itemPath.toLowerCase().endsWith('.html')) {
        // Process HTML files
        stats.total++;
        
        const result = await injectFavicon(itemPath, options);
        if (result) {
          stats.injected++;
        } else {
          const html = await fs.readFile(itemPath, 'utf8');
          const $ = cheerio.load(html);
          
          if (hasFavicon($)) {
            stats.skipped++;
          } else {
            stats.failed++;
          }
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
    return stats;
  }
}

module.exports = {
  injectFavicon,
  injectDir,
  // Export for testing
  hasFavicon
}; 