declare module "folder-hash" {
	export async function hashElement(path: string): Promise<{hash: string}>;
}
