import {existsSync, lstat, lstatSync, readdir, readdirSync, readFile, readFileSync} from "fs";
import {IFileLoader} from "./i-file-loader";

import {hashElement} from "folder-hash";

/**
 * A Promise-based class that can offers different ways of loading files from disk, including wrappers around
 * the synchronous I/O methods from node.
 * @author Frederik Wessberg
 */
export class FileLoader implements IFileLoader {
	/**
	 * Checks if the given path exists and returns a Promise that resolves with a boolean value.
	 *
	 * @param path
	 * @returns
	 */
	async exists(path: string): Promise<boolean> {
		try {
			return (await this.load(path)) != null;
		} catch {
			return false;
		}
	}

	/**
	 * Checks if the given path exists and returns a a boolean value.
	 *
	 * @param path
	 * @returns
	 */
	existsSync(path: string): boolean {
		return existsSync(path);
	}

	/**
	 * Loads the file on the given path and resolves the Promise with a Buffer when the files has successfully loaded.
	 *
	 * @param path
	 * @returns
	 */
	async load(path: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			readFile(path, (err, result) => {
				if (err != null) reject(err);
				else resolve(result);
			});
		});
	}

	/**
	 * Loads the file on the given path synchronously and returns a Buffer.
	 *
	 * @param path
	 * @returns
	 */
	loadSync(path: string): Buffer {
		return readFileSync(path);
	}

	/**
	 * Converts an Iterable to an array, if it isn't already.
	 *
	 * @param extensions
	 * @returns
	 */
	private toArray(extensions: Iterable<string>): string[] {
		return Array.isArray(extensions) ? extensions : [...extensions];
	}

	/**
	 * Checks for the existence on disk of the given path and first match in the array of extensions.
	 * It returns a Promise that will resolve with a tuple with a boolean indicating whether it exists or not and the full path to the file, if any.
	 *
	 * @param path
	 * @param extensions
	 * @param [excludeExtensions]
	 * @returns
	 */
	async getWithFirstMatchedExtension(path: string, extensions: Iterable<string>, excludeExtensions?: Iterable<string>): Promise<string | null> {
		for (const ext of extensions) {
			// If the path already ends with that extension and it exists, return it
			if (path.endsWith(this.normalizeExtension(ext)) && !this.matchedFileIsExcluded(path, excludeExtensions) && (await this.exists(path))) {
				return path;
			}

			const fullPath = `${path}${this.normalizeExtension(ext)}`;
			// If the file exists but is actually excluded, continue.
			if ((await this.exists(fullPath)) && !this.matchedFileIsExcluded(fullPath, excludeExtensions)) {
				return fullPath;
			}
		}
		return null;
	}

	/**
	 * Checks for the existence on disk of the given path and first match in the array of extensions.
	 * It returns a tuple with a boolean indicating whether it exists or not and the full path to the file, if any.
	 *
	 * @param path
	 * @param extensions
	 * @param [excludeExtensions]
	 * @returns
	 */
	getWithFirstMatchedExtensionSync(path: string, extensions: Iterable<string>, excludeExtensions?: Iterable<string>): string | null {
		for (const ext of extensions) {
			// If the path already ends with that extension and it exists, return it
			if (path.endsWith(this.normalizeExtension(ext)) && !this.matchedFileIsExcluded(path, excludeExtensions) && this.existsSync(path)) {
				return path;
			}

			const fullPath = `${path}${this.normalizeExtension(ext)}`;
			// If the file exists but is actually excluded, continue.
			if (this.existsSync(fullPath) && !this.matchedFileIsExcluded(fullPath, excludeExtensions)) {
				return fullPath;
			}
		}
		return null;
	}

	/**
	 * Returns true if a file path is included in the given set of excluded extensions.
	 *
	 * @param filePath
	 * @param excludeExtensions
	 * @returns
	 */
	private matchedFileIsExcluded(filePath: string, excludeExtensions?: Iterable<string>): boolean {
		if (excludeExtensions == null) return false;

		return this.toArray(excludeExtensions).some(excludedExtension => filePath.endsWith(excludedExtension));
	}

	/**
	 * Loads the first matched file associated with the given path combined with the given array of ordered extensions.
	 * and returns a tuple of the buffer and the matched path.
	 *
	 * @param path
	 * @param extensions
	 * @param [excludeExtensions]
	 * @returns
	 */
	loadWithFirstMatchedExtensionSync(path: string, extensions: Iterable<string>, excludeExtensions?: Iterable<string>): null | [Buffer, string] {
		const match = this.getWithFirstMatchedExtensionSync(path, extensions, excludeExtensions);
		return match == null ? null : [this.loadSync(match), match];
	}

	/**
	 * Loads the first matched file associated with the given path combined with the given array of ordered extensions.
	 * and returns a Promise that will eventually resolve with a tuple of the buffer and the matched path.
	 *
	 * @param path
	 * @param extensions
	 * @param [excludeExtensions]
	 * @returns
	 */
	async loadWithFirstMatchedExtension(
		path: string,
		extensions: Iterable<string>,
		excludeExtensions?: Iterable<string>
	): Promise<null | [Buffer, string]> {
		const match = await this.getWithFirstMatchedExtension(path, extensions, excludeExtensions);
		return match == null ? null : [await this.load(match), match];
	}

	/**
	 * Loads any of the given paths and resolves the Promise when the first one has succesfully loaded.
	 *
	 * @param paths
	 * @returns
	 */
	async loadAny(paths: Iterable<string>): Promise<null | [Buffer, string]> {
		for (const path of paths) {
			try {
				const loaded = await this.load(path);
				return loaded == null ? null : [loaded, path];
			} catch {
				// Move on to the next path
			}
		}

		// Default to returning null
		return null;
	}

	/**
	 * Loads any of the given paths and returns the one that loads first.
	 *
	 * @param paths
	 * @returns
	 */
	loadAnySync(paths: Iterable<string>): null | [Buffer, string] {
		for (const path of paths) {
			try {
				const loaded = this.loadSync(path);
				return loaded == null ? null : [loaded, path];
			} catch {
				// Move on to the next path
			}
		}

		// Default to returning null
		return null;
	}

	/**
	 * Loads all the given paths and returns a Promise that will resolve with an array of Buffers.
	 *
	 * @param paths
	 * @returns
	 */
	async loadAll(paths: Iterable<string>): Promise<Buffer[]> {
		return await Promise.all(this.toArray(paths).map(async path => await this.load(path)));
	}

	/**
	 * Loads all the given paths and returns an array of Buffers.
	 *
	 * @param paths
	 * @returns
	 */
	loadAllSync(paths: Iterable<string>): Buffer[] {
		return this.toArray(paths).map(path => this.loadSync(path));
	}

	/**
	 * Gets a list of all files in the given directory. If an array of extensions are given,
	 * only files with any of those extensions will be matched.
	 *
	 * @param directory
	 * @param [extensions]
	 * @param [excludedExtensions]
	 * @param [recursive=false]
	 * @returns
	 */
	async getAllInDirectory(
		directory: string,
		extensions?: Iterable<string>,
		excludedExtensions?: Iterable<string>,
		recursive = false
	): Promise<string[]> {
		const paths = await this.readdirPromise(directory);
		const newPaths: string[] = [];

		await Promise.all(
			paths.map(async path => {
				const filePath = `${directory}/${path}`;
				const isDirectory = await this.isDirectory(filePath);

				// If the file is not a directory, allow it if it has a proper extension
				if (!isDirectory) {
					if (this.fileHasValidExtension(filePath, extensions) && !this.matchedFileIsExcluded(filePath, excludedExtensions)) newPaths.push(filePath);
					return;
				}

				// If the file is a directory and we shouldn't recursive, don't include the file.
				if (!recursive) return false;

				// Otherwise, recursively push more paths to the array of new paths.
				return newPaths.push(...(await this.getAllInDirectory(filePath, extensions, excludedExtensions, recursive)));
			})
		);
		return newPaths;
	}

	/**
	 * Gets a list of all files in the given directory. If an array of extensions are given,
	 * only files with any of those extensions will be matched.
	 *
	 * @param directory
	 * @param [extensions]
	 * @param [excludedExtensions]
	 * @param [recursive]
	 * @returns
	 */
	getAllInDirectorySync(directory: string, extensions?: Iterable<string>, excludedExtensions?: Iterable<string>, recursive = false): string[] {
		const paths = readdirSync(directory);
		const newPaths: string[] = [];

		paths.forEach(path => {
			const filePath = `${directory}/${path}`;
			const isDirectory = this.isDirectorySync(filePath);

			// If the file is not a directory, allow it if it has a proper extension
			if (!isDirectory) {
				if (this.fileHasValidExtension(filePath, extensions) && !this.matchedFileIsExcluded(filePath, excludedExtensions)) newPaths.push(filePath);
				return;
			}

			// If the file is a directory and we shouldn't recursive, don't include the file.
			if (!recursive) return false;

			// Otherwise, recursively push more paths to the array of new paths.
			return newPaths.push(...this.getAllInDirectorySync(filePath, extensions, excludedExtensions, recursive));
		});
		return newPaths;
	}

	/**
	 * Loads all files inside the given directory with the given extension and returns
	 * a Promise that will resolve with an array of Buffers.
	 *
	 * @param directory
	 * @param [extensions]
	 * @param [excludedExtensions]
	 * @param [recursive=false]
	 * @returns
	 */
	async loadAllInDirectory(
		directory: string,
		extensions?: Iterable<string>,
		excludedExtensions?: Iterable<string>,
		recursive = false
	): Promise<Buffer[]> {
		const paths = await this.getAllInDirectory(directory, extensions, excludedExtensions, recursive);
		return await Promise.all(paths.map(async path => await this.load(path)));
	}

	/**
	 * Loads all files inside the given directory with the given extension and returns an array of Buffers.
	 *
	 * @param directory
	 * @param [extensions]
	 * @param [excludedExtensions]
	 * @param [recursive=false]
	 * @returns
	 */
	loadAllInDirectorySync(directory: string, extensions?: Iterable<string>, excludedExtensions?: Iterable<string>, recursive = false): Buffer[] {
		return this.getAllInDirectorySync(directory, extensions, excludedExtensions, recursive).map(path => this.loadSync(path));
	}

	/**
	 * Returns true if a path is a directory
	 *
	 * @param path
	 * @returns
	 */
	async isDirectory(path: string): Promise<boolean> {
		return new Promise<boolean>(resolve => {
			lstat(path, (err, stats) => {
				if (err != null) resolve(false);
				else resolve(stats.isDirectory());
			});
		});
	}

	/**
	 * Returns true if a path is a directory
	 *
	 * @param path
	 * @returns
	 */
	isDirectorySync(path: string): boolean {
		try {
			return lstatSync(path).isDirectory();
		} catch (ex) {
			return false;
		}
	}

	/**
	 * Returns the extension with a prefixed "."
	 *
	 * @param extension
	 * @returns
	 */
	private normalizeExtension(extension: string): string {
		return extension.startsWith(".") ? extension : `.${extension}`;
	}

	/**
	 * Returns true if the file has an extension that is supported.
	 *
	 * @param file
	 * @param extensions
	 * @returns
	 */
	private fileHasValidExtension(file: string, extensions?: Iterable<string>): boolean {
		const array = extensions == null ? null : this.toArray(extensions);
		return array == null ? true : array.some(ext => file.endsWith(this.normalizeExtension(ext)));
	}

	/**
	 * A Promise-based 'readdir' function
	 *
	 * @param directory
	 * @returns
	 */
	private async readdirPromise(directory: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			readdir(directory, (err, paths) => {
				if (err != null) reject(err);
				else resolve(paths);
			});
		});
	}

	/**
	 * Gets the md5 checksum of the file on the given path
	 *
	 * @param path
	 * @returns
	 */
	async getChecksum(path: string): Promise<string> {
		return (await hashElement(path)).hash;
	}
}
