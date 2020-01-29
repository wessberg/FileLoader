<!-- SHADOW_SECTION_LOGO_START -->

<!-- SHADOW_SECTION_LOGO_END -->

<!-- SHADOW_SECTION_DESCRIPTION_SHORT_START -->

> A Promise-based class that can offers different ways of loading files from disk, including wrappers around the synchronous I/O methods from node.

<!-- SHADOW_SECTION_DESCRIPTION_SHORT_END -->

<!-- SHADOW_SECTION_BADGES_START -->

<a href="https://npmcharts.com/compare/%40wessberg%2Ffileloader?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/%40wessberg%2Ffileloader.svg"    /></a>
<a href="https://www.npmjs.com/package/%40wessberg%2Ffileloader"><img alt="NPM version" src="https://badge.fury.io/js/%40wessberg%2Ffileloader.svg"    /></a>
<a href="https://david-dm.org/wessberg/fileloader"><img alt="Dependencies" src="https://img.shields.io/david/wessberg%2Ffileloader.svg"    /></a>
<a href="https://github.com/wessberg/fileloader/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/wessberg%2Ffileloader.svg"    /></a>
<a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"    /></a>
<a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"    /></a>
<a href="https://www.patreon.com/bePatron?u=11315442"><img alt="Support on Patreon" src="https://img.shields.io/badge/patreon-donate-green.svg"    /></a>

<!-- SHADOW_SECTION_BADGES_END -->

<!-- SHADOW_SECTION_DESCRIPTION_LONG_START -->

## Description

<!-- SHADOW_SECTION_DESCRIPTION_LONG_END -->

## DISCLAIMER

This library will be deprecated. There are better alternatives built directly
into the `fs` module now. Use that instead.

<!-- SHADOW_SECTION_FEATURE_IMAGE_START -->

<!-- SHADOW_SECTION_FEATURE_IMAGE_END -->

<!-- SHADOW_SECTION_TOC_START -->

## Table of Contents

- [Description](#description)
- [DISCLAIMER](#disclaimer)
- [Table of Contents](#table-of-contents)
- [Install](#install)
  - [npm](#npm)
  - [Yarn](#yarn)
  - [pnpm](#pnpm)
- [Usage](#usage)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [Backers](#backers)
  - [Patreon](#patreon)
- [License](#license)

<!-- SHADOW_SECTION_TOC_END -->

<!-- SHADOW_SECTION_INSTALL_START -->

## Install

### npm

```
$ npm install @wessberg/fileloader
```

### Yarn

```
$ yarn add @wessberg/fileloader
```

### pnpm

```
$ pnpm add @wessberg/fileloader
```

<!-- SHADOW_SECTION_INSTALL_END -->

<!-- SHADOW_SECTION_USAGE_START -->

## Usage

<!-- SHADOW_SECTION_USAGE_END -->

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

<!-- SHADOW_SECTION_CONTRIBUTING_START -->

## Contributing

Do you want to contribute? Awesome! Please follow [these recommendations](./CONTRIBUTING.md).

<!-- SHADOW_SECTION_CONTRIBUTING_END -->

<!-- SHADOW_SECTION_MAINTAINERS_START -->

## Maintainers

| <img alt="Frederik Wessberg" src="https://avatars2.githubusercontent.com/u/20454213?s=460&v=4" height="70"   />                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Frederik Wessberg](mailto:frederikwessberg@hotmail.com)<br><strong>Twitter</strong>: [@FredWessberg](https://twitter.com/FredWessberg)<br><strong>Github</strong>: [@wessberg](https://github.com/wessberg)<br>_Lead Developer_ |

<!-- SHADOW_SECTION_MAINTAINERS_END -->

<!-- SHADOW_SECTION_BACKERS_START -->

## Backers

### Patreon

[Become a backer](https://www.patreon.com/bePatron?u=11315442) and get your name, avatar, and Twitter handle listed here.

<a href="https://www.patreon.com/bePatron?u=11315442"><img alt="Backers on Patreon" src="https://patreon-badge.herokuapp.com/11315442.png"  width="500"  /></a>

<!-- SHADOW_SECTION_BACKERS_END -->

<!-- SHADOW_SECTION_LICENSE_START -->

## License

MIT © [Frederik Wessberg](mailto:frederikwessberg@hotmail.com) ([@FredWessberg](https://twitter.com/FredWessberg)) ([Website](https://github.com/wessberg))

<!-- SHADOW_SECTION_LICENSE_END -->
