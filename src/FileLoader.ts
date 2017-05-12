import {readdir, readdirSync, readFile, readFileSync} from 'fs';
import {IFileLoader} from './Interface/IFileLoader';

/**
 * A Promise-based class that can offers different ways of loading files from disk, including wrappers around
 * the synchronous I/O methods from node.
 * @author Frederik Wessberg
 */
export class FileLoader implements IFileLoader {

	/**
	 * Loads the file on the given path and resolves the Promise with a Buffer when the files has successfully loaded.
	 * @param {string} path
	 * @returns {Promise<Buffer>}
	 */
	public async load (path: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			readFile(path, (err, result) => {
				if (err) reject(err);
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
	 * Loads the first matched file associated with the given path combined with the given array of ordered extensions.
	 * and returns a tuple of the buffer and the matched path.
	 * @param {string} path
	 * @param {string[]} extensions
	 * @returns {[Buffer|null, string|null]}
	 */
	public loadWithFirstMatchedExtensionSync (path: string, extensions: string[]): [Buffer | null, string | null] {
		const pathHasExtension = extensions.some(ext => path.endsWith(this.normalizeExtension(ext)));
		if (pathHasExtension) {
			const buffer = this.loadSync(path);
			return [buffer, path];
		}

		const self = this;
		let cursor = 0;

		let value: [Buffer | null, string | null] = [null, null];

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
	public async loadWithFirstMatchedExtension (path: string, extensions: string[]): Promise<[Buffer | null, string | null]> {
		const pathHasExtension = extensions.some(ext => path.endsWith(this.normalizeExtension(ext)));
		if (pathHasExtension) {
			const buffer = await this.load(path);
			return [buffer, path];
		}

		return new Promise<[Buffer | null, string | null]>((resolve) => {
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
	public async loadAny (paths: string[]): Promise<[Buffer | null, string | null]> {
		return new Promise<[Buffer | null, string | null]>((resolve) => {
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
	public loadAnySync (paths: string[]): [Buffer | null, string | null] {
		const self = this;
		let cursor = 0;
		let value: [Buffer | null, string | null] = [null, null];

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
		return await Promise.all(paths.map(path => this.load(path)));
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
	 * @returns {Promise<string[]>}
	 */
	public async getFilesInDirectory (directory: string, extensions?: string[]): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			readdir(directory, async (err, filePaths) => {
				if (err) reject(err);
				resolve(this.filterFiles(filePaths, extensions));
			});
		});
	}

	/**
	 * Gets a list of all files in the given directory. If an array of extensions are given,
	 * only files with any of those extensions will be matched.
	 * @param {string} directory
	 * @param {string[]} [extensions]
	 * @returns {string[]}
	 */
	public getFilesInDirectorySync (directory: string, extensions?: string[]): string[] {
		const paths = readdirSync(directory);
		return this.filterFiles(paths, extensions);
	}

	/**
	 * Loads all files inside the given directory with the given extension and returns
	 * a Promise that will resolve with an array of Buffers.
	 * @param {string} directory
	 * @param {string[]} [extensions]
	 * @returns {Promise<Buffer[]>}
	 */
	public async loadAllInDirectory (directory: string, extensions?: string[]): Promise<Buffer[]> {
		const filePaths = await this.getFilesInDirectory(directory, extensions);
		const filtered = this.filterFiles(filePaths, extensions);
		return await this.loadAll(filtered.map(path => `${directory}/${path}`));
	}

	/**
	 * Loads all files inside the given directory with the given extension and returns an array of Buffers.
	 * @param {string} directory
	 * @param {string[]} [extensions]
	 * @returns {Buffer[]}
	 */
	public loadAllInDirectorySync (directory: string, extensions?: string[]): Buffer[] {
		const filePaths = readdirSync(directory);
		const filtered = this.filterFiles(filePaths, extensions);
		return this.loadAllSync(filtered.map(path => `${directory}/${path}`));
	}

	/**
	 * Returns the extension with a prefixed "."
	 * @param {string} extension
	 * @returns {string}
	 */
	private normalizeExtension (extension: string): string {
		return extension.startsWith('.') ? extension : `.${extension}`;
	}

	/**
	 * Removes all files that doesn't end with any of the given extensions.
	 * If no extensions are given, the original list of files will be returned.
	 * @param {string[]} files
	 * @param {string[]} [extensions]
	 * @returns {string[]}
	 */
	private filterFiles (files: string[], extensions?: string[]): string[] {
		return extensions == null ? files : files.filter(path => extensions.some(ext => path.endsWith(this.normalizeExtension(ext))));
	}

}