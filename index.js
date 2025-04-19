'use strict';

/**
 * Auto-favicon-injector
 * A tool to automatically inject favicon links into HTML files
 */

const injector = require('./lib/injector');

module.exports = {
  /**
   * Injects a favicon link into an HTML file
   * @param {string} filePath - Path to the HTML file
   * @param {Object|string} options - Options object or favicon path string
   * @param {string} options.path - Path to the favicon file (default: '/favicon.ico')
   * @param {string} options.rel - Relationship attribute (default: 'icon')
   * @param {string} options.type - MIME type of the favicon (auto-detected if not provided)
   * @param {string} options.sizes - Size attribute for the favicon
   * @returns {Promise<boolean>} - Whether the operation was successful
   */
  injectFavicon: injector.injectFavicon,
  
  /**
   * Recursively scans a directory and injects favicon into all HTML files
   * @param {string} dirPath - Path to the directory
   * @param {Object|string} options - Options object or favicon path string
   * @param {string} options.path - Path to the favicon file (default: '/favicon.ico')
   * @param {string} options.rel - Relationship attribute (default: 'icon')
   * @param {string} options.type - MIME type of the favicon (auto-detected if not provided)
   * @param {string} options.sizes - Size attribute for the favicon
   * @returns {Promise<{total: number, injected: number, skipped: number, failed: number}>} - Operation statistics
   */
  injectDir: injector.injectDir
}; 