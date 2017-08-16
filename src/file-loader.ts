import {existsSync, lstat, lstatSync, readdir, readdirSync, readFile, readFileSync, stat} from "fs";
import {IFileLoader} from "./i-file-loader";

/**
 * A Promise-based class that can offers different ways of loading files from disk, including wrappers around
 * the synchronous I/O methods from node.
 * @author Frederik Wessberg
 */
export class FileLoader implements IFileLoader {

	/**
	 * Checks if the given path exists and returns a Promise that resolves with a boolean value.
	 * @param {string} path
	 * @returns {Promise<boolean>}
	 */
	public async exists (path: string): Promise<boolean> {
		return new Promise<boolean>((resolve) => stat(path, err => resolve(err != null)));
	}

	/**
	 * Checks if the given path exists and returns a a boolean value.
	 * @param {string} path
	 * @returns {boolean}
	 */
	public existsSync (path: string): boolean {
		return existsSync(path);
	}

	/**
	 * Loads the file on the given path and resolves the Promise with a Buffer when the files has successfully loaded.
	 * @param {string} path
	 * @returns {Promise<Buffer>}
	 */
	public async load (path: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			readFile(path, (err, result) => {
				if (err != null) reject(err);
				else resolve(result);
			});
		});
	}

	/**
	 * Loads the file on the given path synchronously and returns a Buffer.
	 * @param {string} path
	 * @returns {Buffer}
	 */
	public loadSync (path: string): Buffer {
		return readFileSync(path);
	}

	/**
	 * Checks for the existence on disk of the given path and first match in the array of extensions.
	 * It returns a Promise that will resolve with a tuple with a boolean indicating whether it exists or not and the full path to the file, if any.
	 * @param {string} path
	 * @param {string[]} extensions
	 * @returns {Promise<[boolean, string|null]>}
	 */
	public async existsWithFirstMatchedExtension (path: string, extensions: string[]): Promise<[boolean, string|null]> {
		return new Promise<[boolean, string|null]>((resolve) => {
			const self = this;
			let cursor = 0;

			(async function inner (): Promise<void> {
				try {
					if (cursor >= extensions.length) return resolve([false, null]);
					const fullPath = `${path}${self.normalizeExtension(extensions[cursor++])}`;
					const doesExist = await self.exists(fullPath);
					resolve([doesExist, fullPath]);
				} catch (e) {
					await inner();
				}
			}());
		});
	}

	/**
	 * Checks for the existence on disk of the given path and first match in the array of extensions.
	 * It returns a tuple with a boolean indicating whether it exists or not and the full path to the file, if any.
	 * @param {string} path
	 * @param {string[]} extensions
	 * @returns {[boolean, string|null]}
	 */
	public existsWithFirstMatchedExtensionSync (path: string, extensions: string[]): [boolean, string|null] {
		for (const ext of extensions) {
			const fullPath = `${path}${this.normalizeExtension(ext)}`;
			const doesExist = this.existsSync(fullPath);
			if (doesExist) return [true, fullPath];
		}
		return [false, null];
	}

	/**
	 * Loads the first matched file associated with the given path combined with the given array of ordered extensions.
	 * and returns a tuple of the buffer and the matched path.
	 * @param {string} path
	 * @param {string[]} extensions
	 * @returns {[Buffer|null, string|null]}
	 */
	public loadWithFirstMatchedExtensionSync (path: string, extensions: string[]): [Buffer|null, string|null] {
		const pathHasExtension = extensions.some(ext => path.endsWith(this.normalizeExtension(ext)));
		if (pathHasExtension) {
			const buffer = this.loadSync(path);
			return [buffer, path];
		}

		const self = this;
		let cursor = 0;

		let value: [Buffer|null, string|null] = [null, null];

		(function inner (): void {
			try {
				if (cursor >= extensions.length) return;

				const loadPath = `${path}${self.normalizeExtension(extensions[cursor++])}`;
				const result = self.loadSync(loadPath);
				value = [result, loadPath];
			} catch (e) {
				inner();
			}
		}());
		return value;
	}

	/**
	 * Loads the first matched file associated with the given path combined with the given array of ordered extensions.
	 * and returns a Promise that will eventually resolve with a tuple of the buffer and the matched path.
	 * @param {string} path
	 * @param {string[]} extensions
	 * @returns {Promise<[Buffer|null, string|null]>}
	 */
	public async loadWithFirstMatchedExtension (path: string, extensions: string[]): Promise<[Buffer|null, string|null]> {
		const pathHasExtension = extensions.some(ext => path.endsWith(this.normalizeExtension(ext)));
		if (pathHasExtension) {
			const buffer = await this.load(path);
			return [buffer, path];
		}

		return new Promise<[Buffer|null, string|null]>((resolve) => {
			const self = this;
			let cursor = 0;
			(async function inner (): Promise<void> {
				try {
					if (cursor >= extensions.length) return resolve([null, null]);
					const loadPath = `${path}${self.normalizeExtension(extensions[cursor++])}`;
					const result = await self.load(loadPath);
					resolve([result, loadPath]);
				} catch (e) {
					await inner();
				}
			}());
		});
	}

	/**
	 * Loads any of the given paths and resolves the Promise when the first one has succesfully loaded.
	 * @param {string[]} paths
	 * @returns {Promise<[Buffer,string]|null>}
	 */
	public async loadAny (paths: string[]): Promise<[Buffer|null, string|null]> {
		return new Promise<[Buffer|null, string|null]>((resolve) => {
			const self = this;
			let cursor = 0;
			(async function inner (): Promise<void> {
				try {
					if (cursor >= paths.length) return resolve([null, null]);
					const result = await self.load(paths[cursor++]);
					resolve([result, paths[cursor]]);
				} catch (e) {
					await inner();
				}
			}());
		});
	}

	/**
	 * Loads any of the given paths and returns the one that loads first.
	 * @param {string[]} paths
	 * @returns {[Buffer|null,string|null]}
	 */
	public loadAnySync (paths: string[]): [Buffer|null, string|null] {
		const self = this;
		let cursor = 0;
		let value: [Buffer|null, string|null] = [null, null];

		(function inner (): void {
			try {
				if (cursor >= paths.length) return;
				const result = self.loadSync(paths[cursor++]);
				value = [result, paths[cursor]];
			} catch (e) {
				inner();
			}
		}());
		return value;
	}

	/**
	 * Loads all the given paths and returns a Promise that will resolve with an array of Buffers.
	 * @param {string[]} paths
	 * @returns {Promise<Buffer[]>}
	 */
	public async loadAll (paths: string[]): Promise<Buffer[]> {
		return await Promise.all(paths.map(async path => await this.load(path)));
	}

	/**
	 * Loads all the given paths and returns an array of Buffers.
	 * @param {string[]} paths
	 * @returns {Buffer[]}
	 */
	public loadAllSync (paths: string[]): Buffer[] {
		return paths.map(path => this.loadSync(path));
	}

	/**
	 * Gets a list of all files in the given directory. If an array of extensions are given,
	 * only files with any of those extensions will be matched.
	 * @param {string} directory
	 * @param {string[]} [extensions]
	 * @param {boolean} [recursive=false]
	 * @returns {Promise<string[]>}
	 */
	public async getAllInDirectory (directory: string, extensions?: string[], recursive: boolean = false): Promise<string[]> {
		const paths = await this.readdirPromise(directory);
		const newPaths: string[] = [];

		await Promise.all(paths.map(async path => {
			const filePath = `${directory}/${path}`;
			const isDirectory = await this.isDirectory(filePath);

			// If the file is not a directory, allow it if it has a proper extension
			if (!isDirectory) {
				if (this.fileHasValidExtension(filePath, extensions)) newPaths.push(filePath);
				return;
			}

			// If the file is a directory and we shouldn't recursive, don't include the file.
			if (!recursive) return false;

			// Otherwise, recursively push more paths to the array of new paths.
			return newPaths.push(...(await this.getAllInDirectory(filePath, extensions, recursive)));
		}));
		return newPaths;
	}

	/**
	 * Gets a list of all files in the given directory. If an array of extensions are given,
	 * only files with any of those extensions will be matched.
	 * @param {string} directory
	 * @param {string[]} [extensions]
	 * @param {boolean} [recursive]
	 * @returns {string[]}
	 */
	public getAllInDirectorySync (directory: string, extensions?: string[], recursive: boolean = false): string[] {
		const paths = readdirSync(directory);
		const newPaths: string[] = [];

		paths.forEach(path => {
			const filePath = `${directory}/${path}`;
			const isDirectory = this.isDirectorySync(filePath);

			// If the file is not a directory, allow it if it has a proper extension
			if (!isDirectory) {
				if (this.fileHasValidExtension(filePath, extensions)) newPaths.push(filePath);
				return;
			}

			// If the file is a directory and we shouldn't recursive, don't include the file.
			if (!recursive) return false;

			// Otherwise, recursively push more paths to the array of new paths.
			return newPaths.push(...this.getAllInDirectorySync(filePath, extensions, recursive));
		});
		return newPaths;
	}

	/**
	 * Loads all files inside the given directory with the given extension and returns
	 * a Promise that will resolve with an array of Buffers.
	 * @param {string} directory
	 * @param {string[]} [extensions]
	 * @param {boolean} [recursive=false]
	 * @returns {Promise<Buffer[]>}
	 */
	public async loadAllInDirectory (directory: string, extensions?: string[], recursive: boolean = false): Promise<Buffer[]> {
		const paths = await this.getAllInDirectory(directory, extensions, recursive);
		return await Promise.all(paths.map(async path => await this.load(path)));
	}

	/**
	 * Loads all files inside the given directory with the given extension and returns an array of Buffers.
	 * @param {string} directory
	 * @param {string[]} [extensions]
	 * @param {boolean} [recursive=false]
	 * @returns {Buffer[]}
	 */
	public loadAllInDirectorySync (directory: string, extensions?: string[], recursive: boolean = false): Buffer[] {
		return this.getAllInDirectorySync(directory, extensions, recursive)
			.map(path => this.loadSync(path));
	}

	/**
	 * Returns true if a path is a directory
	 * @param {string} path
	 * @returns {Promise<boolean>}
	 */
	public async isDirectory (path: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			lstat(path, (err, stats) => {
				if (err != null) reject(err);
				else resolve(stats.isDirectory());
			});
		});
	}

	/**
	 * Returns true if a path is a directory
	 * @param {string} path
	 * @returns {boolean}
	 */
	public isDirectorySync (path: string): boolean {
		return lstatSync(path).isDirectory();
	}

	/**
	 * Returns the extension with a prefixed "."
	 * @param {string} extension
	 * @returns {string}
	 */
	private normalizeExtension (extension: string): string {
		return extension.startsWith(".") ? extension : `.${extension}`;
	}

	/**
	 * Returns true if the file has an extension that is supported.
	 * @param {string} file
	 * @param {string[]} extensions
	 * @returns {boolean}
	 */
	private fileHasValidExtension (file: string, extensions?: string[]): boolean {
		return extensions == null ? true : extensions.some(ext => file.endsWith(this.normalizeExtension(ext)));
	}

	/**
	 * A Promise-based 'readdir' function
	 * @param {string} directory
	 * @returns {Promise<string[]>}
	 */
	private async readdirPromise (directory: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			readdir(directory, (err, paths) => {
				if (err != null) reject(err);
				else resolve(paths);
			});
		});
	}

}