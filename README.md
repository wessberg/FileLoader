# FileLoader
[![NPM version][npm-version-image]][npm-version-url]
[![License-mit][license-mit-image]][license-mit-url]

[license-mit-url]: https://opensource.org/licenses/MIT

[license-mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg

[npm-version-url]: https://www.npmjs.com/package/@wessberg/fileloader

[npm-version-image]: https://badge.fury.io/js/%40wessberg%2Ffileloader.svg
> A Promise-based class that can offers different ways of loading files from disk, including wrappers around the synchronous I/O methods from node.

## Installation
Simply do: `npm install @wessberg/fileloader`.

## DISCLAIMER

This is a very early version. The API may still change greatly.

## Usage
```typescript
const fileLoader = new FileLoader();

// Just a simple Promise-based async I/O method.
const buffer = await fileLoader.load("some_file.ts");

// A wrapper around the "readSync" method from node's "fs" module.
const sync = fileLoader.loadSync("some_file.ts");

// Loads the first matched file associated with the given path
// combined with the given array of ordered extensions.
const [result, path] = await fileLoader.loadWithFirstMatchedExtension("some_path", [".ts", ".fs"]);

// Loads all files in the given directory.
const buffers = await fileLoader.loadAllInDirectory("some_dir");

// Gets a list of all files in the given directory with an extension of "ts".
const buffers = await fileLoader.getFilesInDirectory("some_dir", [".ts"]);
```