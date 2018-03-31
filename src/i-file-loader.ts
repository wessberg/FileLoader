export interface IFileLoader {
	isDirectory (path: string): Promise<boolean>;
	isDirectorySync (path: string): boolean;
	exists (path: string): Promise<boolean>;
	existsSync (path: string): boolean;
	getWithFirstMatchedExtension (path: string, extensions: Iterable<string>, excludeExtensions?: Iterable<string>): Promise<string|null>;
	getWithFirstMatchedExtensionSync (path: string, extensions: Iterable<string>, excludeExtensions?: Iterable<string>): string|null;
	load (path: string): Promise<Buffer>;
	loadSync (path: string): Buffer;
	loadAny (paths: Iterable<string>): Promise<null|[Buffer, string]>;
	loadAnySync (paths: Iterable<string>): null|[Buffer, string];
	loadAll (files: Iterable<string>): Promise<Buffer[]>;
	loadAllSync (files: Iterable<string>): Buffer[];
	loadAllInDirectory (directory: string, extensions?: Iterable<string>, excludedExtensions?: Iterable<string>, recursive?: boolean): Promise<Buffer[]>;
	loadAllInDirectorySync (directory: string, extensions?: Iterable<string>, excludedExtensions?: Iterable<string>, recursive?: boolean): Buffer[];
	loadWithFirstMatchedExtension (path: string, extensions: Iterable<string>, excludeExtensions?: Iterable<string>): Promise<null|[Buffer, string]>;
	loadWithFirstMatchedExtensionSync (path: string, extensions: Iterable<string>, excludeExtensions?: Iterable<string>): null|[Buffer, string];
	getAllInDirectory (directory: string, extensions?: Iterable<string>, excludedExtensions?: Iterable<string>, recursive?: boolean): Promise<string[]>;
	getAllInDirectorySync (directory: string, extensions?: Iterable<string>, excludedExtensions?: Iterable<string>, recursive?: boolean): string[];
}