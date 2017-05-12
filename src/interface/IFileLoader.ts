export interface IFileLoader {
	exists (path: string): Promise<boolean>;
	existsSync (path: string): boolean;
	existsWithFirstMatchedExtension (path: string, extensions: string[]): Promise<[boolean, string|null]>;
	existsWithFirstMatchedExtensionSync (path: string, extensions: string[]): [boolean, string|null];
	load (path: string): Promise<Buffer>;
	loadSync (path: string): Buffer;
	loadAny (paths: string[]): Promise<[Buffer | null, string | null]>;
	loadAnySync (paths: string[]): [Buffer | null, string | null];
	loadAll (files: string[]): Promise<Buffer[]>;
	loadAllSync (files: string[]): Buffer[];
	loadAllInDirectory (directory: string, extensions?: string[]): Promise<Buffer[]>;
	loadAllInDirectorySync (directory: string, extensions?: string[]): Buffer[];
	loadWithFirstMatchedExtension (path: string, extensions: string[]): Promise<[Buffer | null, string | null]>;
	loadWithFirstMatchedExtensionSync (path: string, extensions: string[]): [Buffer | null, string | null];
	getFilesInDirectory (directory: string, extensions?: string[]): Promise<string[]>;
	getFilesInDirectorySync (directory: string, extensions?: string[]): string[];
}