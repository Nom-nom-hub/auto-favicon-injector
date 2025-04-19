# auto-favicon-injector

[![npm version](https://img.shields.io/npm/v/auto-favicon-injector.svg)](https://www.npmjs.com/package/auto-favicon-injector)
[![npm downloads](https://img.shields.io/npm/dm/auto-favicon-injector.svg)](https://www.npmjs.com/package/auto-favicon-injector)
[![License](https://img.shields.io/npm/l/auto-favicon-injector.svg)](https://github.com/yourusername/auto-favicon-injector/blob/main/LICENSE)

Automatically inject favicon links into HTML files. This utility scans a directory (and its subdirectories) for HTML files and adds a favicon link to the `<head>` section if one doesn't already exist.

## Installation

### Global Installation

```bash
npm install -g auto-favicon-injector
```

### Local Installation

```bash
npm install auto-favicon-injector
```

## CLI Usage

After installing globally, you can use the CLI tool:

```bash
inject-favicon /path/to/directory --favicon /path/to/favicon.ico
```

### Options

- `<dir>`: The directory to scan for HTML files (required)
- `-f, --favicon <path>`: Path to the favicon file (default: '/favicon.ico')
- `-r, --rel <rel>`: Relationship attribute (default: 'icon')
- `-t, --type <type>`: MIME type of the favicon (auto-detected if not provided)
- `-s, --sizes <sizes>`: Size attribute for the favicon (e.g., "16x16", "32x32 48x48")
- `-v, --verbose`: Print detailed information
- `--version`: Show version number
- `--help`: Show help

### Examples

```bash
# Basic usage with default favicon path (/favicon.ico)
inject-favicon ./public

# Specify a custom favicon path
inject-favicon ./public --favicon ./assets/images/icon.png

# Use shortcut icon
inject-favicon ./public --favicon ./favicon.ico --rel "shortcut icon"

# Define PNG favicon with size
inject-favicon ./public --favicon ./favicon.png --type "image/png" --sizes "16x16 32x32"

# Apple Touch Icon
inject-favicon ./public --favicon ./apple-touch-icon.png --rel "apple-touch-icon" --sizes "180x180"

# Enable verbose output
inject-favicon ./public --verbose
```

## API Usage

You can use the library programmatically in your Node.js applications:

### Basic Usage

```javascript
const favicon = require('auto-favicon-injector');

// Inject favicon into a single file
favicon.injectFavicon('./index.html', '/favicon.ico')
  .then(result => {
    if (result) {
      console.log('Favicon injected successfully');
    } else {
      console.log('Favicon already exists or file could not be processed');
    }
  })
  .catch(err => console.error('Error:', err));

// Recursively inject favicons into all HTML files in a directory
favicon.injectDir('./public', '/custom-favicon.ico')
  .then(stats => {
    console.log(`Total files: ${stats.total}`);
    console.log(`Injected: ${stats.injected}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Failed: ${stats.failed}`);
  })
  .catch(err => console.error('Error:', err));
```

### Advanced Usage with Options

```javascript
const favicon = require('auto-favicon-injector');

// Using advanced options
const options = {
  path: '/favicon.png',
  rel: 'icon',
  type: 'image/png',
  sizes: '32x32'
};

// Inject with advanced options
favicon.injectFavicon('./index.html', options)
  .then(result => {
    if (result) {
      console.log('PNG favicon injected successfully');
    } else {
      console.log('Favicon already exists or file could not be processed');
    }
  });

// Apple Touch Icon for iOS
const appleTouchIcon = {
  path: '/apple-touch-icon.png',
  rel: 'apple-touch-icon',
  sizes: '180x180'
};

// Inject Apple Touch Icon into a directory
favicon.injectDir('./public', appleTouchIcon)
  .then(stats => {
    console.log(`Injected Apple Touch Icons: ${stats.injected}`);
  });
```

### API Methods

#### injectFavicon(filePath, options)

Injects a favicon link into a single HTML file.

- `filePath` (string): Path to the HTML file
- `options` (string|object): Either a string representing the favicon path or an options object:
  - `path` (string): Path to the favicon file (default: '/favicon.ico')
  - `rel` (string): Relationship attribute (default: 'icon')
  - `type` (string): MIME type of the favicon (auto-detected if not provided)
  - `sizes` (string): Size attribute for the favicon
- Returns: Promise<boolean> - true if favicon was injected, false if it already exists or couldn't be injected

#### injectDir(dirPath, options)

Recursively scans a directory and injects favicon into all HTML files.

- `dirPath` (string): Path to the directory
- `options` (string|object): Either a string representing the favicon path or an options object (see above)
- Returns: Promise<Object> with these properties:
  - `total`: Number of HTML files found
  - `injected`: Number of files injected with favicon
  - `skipped`: Number of files skipped (already have favicon)
  - `failed`: Number of files failed to inject

## Supported Favicon Types

The package detects and sets the appropriate MIME type based on the file extension:

- `.ico` - `image/x-icon`
- `.png` - `image/png`
- `.svg` - `image/svg+xml`
- `.jpg/.jpeg` - `image/jpeg`

It supports multiple favicon relationships:

- `icon` (default)
- `shortcut icon`
- `apple-touch-icon`

## How It Works

The tool:

1. Scans the specified directory (and subdirectories) for HTML files
2. For each HTML file, checks if it already has a favicon link
3. If no favicon is found, adds a customized link tag to the `<head>` section
4. Preserves the original HTML structure and formatting

### Handling HTML Without Head Tags

This tool uses Cheerio under the hood, which automatically adds standard HTML structure (including `<head>` tags) when parsing incomplete HTML. This means:

- If your HTML files are missing `<head>` tags, they will be automatically added
- The favicon will be injected into the newly created head section
- When the file is saved, it will have a proper HTML structure

This behavior helps make the tool more robust, allowing it to properly handle even incomplete or malformed HTML files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 