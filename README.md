# FileLoader [![NPM version][npm-image]][npm-url]
> A Promise-based class that can offers different ways of loading files from disk, including wrappers around the synchronous I/O methods from node.

## Installation
Simply do: `npm install @wessberg/fileloader`.

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

## Changelog:

**v1.0.2**:

- Added `exists` methods.

**v1.0.0**:

- First release.

[npm-url]: https://npmjs.org/package/@wessberg/fileloader
[npm-image]: https://badge.fury.io/js/@wessberg/fileloader.svg