import {test} from "ava";
import {IFileLoader} from "../src/i-file-loader";
import {FileLoader} from "../src/file-loader";
import {join} from "path";

let fileLoader: IFileLoader;
const ASSET_DIR = join(__dirname, "../../", "test/asset");
const DUMMY_PATH = `${ASSET_DIR}/dummy`;
const DUMMY_TXT_PATH = `${DUMMY_PATH}.txt`;
test.beforeEach(() => fileLoader = new FileLoader());

test(`load() -> Loads a file from disk properly`, async t => {
	const buffer = await fileLoader.load(DUMMY_TXT_PATH);
	t.true(buffer != null);
});

test(`loadSync() -> Loads a file from disk properly`, t => {
	const buffer = fileLoader.loadSync(DUMMY_TXT_PATH);
	t.true(buffer != null);
});

test(`getFilesInDirectory() -> Gets all files in the given directory #1`, async t => {
	const files = await fileLoader.getAllInDirectory(ASSET_DIR);
	t.true(files.length === 2);
});

test(`getFilesInDirectory() -> Gets all files in the given directory #2`, async t => {
	const files = await fileLoader.getAllInDirectory(ASSET_DIR, ["txt"]);
	t.true(files.length === 1);
});

test(`getFilesInDirectory() -> Gets all files in the given directory #3`, async t => {
	const files = await fileLoader.getAllInDirectory(ASSET_DIR, [".txt"]);
	t.true(files.length === 1);
});

test(`getFilesInDirectory() -> Gets all files in the given directory #4`, async t => {
	const files = await fileLoader.getAllInDirectory(ASSET_DIR, ["weird_extension"]);
	t.true(files.length === 0);
});

test(`getFilesInDirectory() -> Gets all files in the given directory #5`, async t => {
	const files = await fileLoader.getAllInDirectory(ASSET_DIR, [".weird_extension"]);
	t.true(files.length === 0);
});

test(`getFilesInDirectory() -> Gets all files in the given directory #6`, async t => {
	const files = await fileLoader.getAllInDirectory(ASSET_DIR);
	t.true(files.length === 2);
});

test(`getFilesInDirectorySync() -> Gets all files in the given directory #1`, t => {
	const files = fileLoader.getAllInDirectorySync(ASSET_DIR);
	t.true(files.length === 2);
});

test(`getFilesInDirectorySync() -> Gets all files in the given directory #2`, t => {
	const files = fileLoader.getAllInDirectorySync(ASSET_DIR, ["txt"]);
	t.true(files.length === 1);
});

test(`getFilesInDirectorySync() -> Gets all files in the given directory #3`, t => {
	const files = fileLoader.getAllInDirectorySync(ASSET_DIR, [".txt"]);
	t.true(files.length === 1);
});

test(`getFilesInDirectorySync() -> Gets all files in the given directory #4`, t => {
	const files = fileLoader.getAllInDirectorySync(ASSET_DIR, ["weird_extension"]);
	t.true(files.length === 0);
});

test(`getFilesInDirectory() -> Gets all files in the given directory #5`, t => {
	const files = fileLoader.getAllInDirectorySync(ASSET_DIR, [".weird_extension"]);
	t.true(files.length === 0);
});

test(`getFilesInDirectory() -> Gets all files in the given directory #6`, t => {
	const files = fileLoader.getAllInDirectorySync(ASSET_DIR);
	t.true(files.length === 2);
});

test(`loadWithFirstMatchingExtension() -> Loads all files in the given directory #1`, async t => {
	const result = await fileLoader.loadWithFirstMatchedExtension(DUMMY_PATH, [".weird_extension"]);
	t.true(result == null);
});

test(`loadWithFirstMatchingExtension() -> Loads all files in the given directory #2`, async t => {
	const result = await fileLoader.loadWithFirstMatchedExtension(DUMMY_PATH, [".md"]);
	t.true(result != null);
});

test(`loadWithFirstMatchingExtension() -> Loads all files in the given directory #3`, async t => {
	const result = await fileLoader.loadWithFirstMatchedExtension(DUMMY_PATH, [".txt"]);
	t.true(result != null);
});

test(`existsWithFirstMatchedExtension() -> Can detect the existence of files #1`, async t => {
	const [buffer] = await fileLoader.existsWithFirstMatchedExtension(DUMMY_PATH, [".txt"]);
	t.true(buffer != null);
});