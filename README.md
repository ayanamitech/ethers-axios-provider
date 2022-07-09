# ethers-axios-provider

[![Build Status](https://github.com/ayanamitech/ethers-axios-provider/actions/workflows/test.yml/badge.svg)](https://github.com/ayanamitech/ethers-axios-provider/actions)
[![NPM Package Version](https://img.shields.io/npm/v/ethers-axios-provider.svg)](https://npmjs.org/package/ethers-axios-provider)
[![NPM Package Downloads](https://img.shields.io/npm/dm/ethers-axios-provider.svg)](https://npmjs.org/package/ethers-axios-provider)
[![Known Vulnerabilities](https://snyk.io/test/github/ayanamitech/ethers-axios-provider/badge.svg?style=flat-square)](https://snyk.io/test/github/ayanamitech/ethers-axios-provider)
[![GitHub Views](https://img.shields.io/badge/dynamic/json?color=green&label=Views&query=uniques&url=https://github.com/ayanamitech/node-github-repo-stats/blob/main/data/ayanamitech/ethers-axios-provider/views.json?raw=True&logo=github)](https://github.com/ayanamitech/ethers-axios-provider)
[![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=uniques&url=https://github.com/ayanamitech/node-github-repo-stats/blob/main/data/ayanamitech/ethers-axios-provider/clone.json?raw=True&logo=github)](https://github.com/ayanamitech/ethers-axios-provider)
[![License: MIT](https://img.shields.io/github/license/ayanamitech/ethers-axios-provider)](https://opensource.org/licenses/MIT)

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Usage](#usage)
  - [Browser](#browser)
  - [Example](#example)

## About

> Fastest, fault tolerant multi node ethers.js compatible JSONRPC provider

**AxiosProvider** is an easy to use [ethers.js v5](https://docs.ethers.io/v5/) compatible Ethereum Javascript (Typescript) JSONRPC API Provider powered by a powerful [Axios](https://axios-http.com/) HTTP client wrapped by [axios-auto](https://ayanamitech.github.io/axios-auto) library to help your automated error handling & [Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) powered client-side load balancing feature.

**Features:**

- Provides much better error handling & timeouts for public RPC nodes the most widely used HTTP client Axios.
- Supports custom http.agent / https.Agent via Axios (Node.js feature to support Tor, Socks5, Https proxy connection)
- Client side load-balancer using [Promise.any()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any) to resolve fastest query result from the fastest node connection.
- Sends a query to multiple nodes (like Promise.all but without waiting for every promise to resolve)
- Advanced retries for server-side error using [axios-auto](https://ayanamitech.github.io/axios-auto)
- Return cached eth_chainId value since network doesn't change for RPC nodes for most cases.

## Installation

**Node.js**

```bash
# Wouldn't work without axios or ethers installed
npm i --save axios ethers ethers-axios-provider
```

## Documentation

https://ayanamitech.github.io/ethers-axios-provider

## Usage

### Browser

Every release of `ethers-axios-provider` will have new build of `./dist/browser/index.js` for use in the browser. To get access to module classes use `AxiosProvider` global variable.

> WARN: We recommend hosting and controlling your own copy for security reasons

```html
<!-- Since Browser bundle comes with axios-auto built in, no need to add additional axios or axios-auto dependency -->
<script src="https://cdn.jsdelivr.net/npm/ethers-axios-provider@latest"></script>
```

```html
<!-- Since Browser bundle comes with axios-auto built in, no need to add additional axios or axios-auto dependency -->
<script src="https://unpkg.com/ethers-axios-provider@latest"></script>
```

Note that it would be helpful to setup the Subresource Integrity hash to ensure that the imported library has the desired codes.

For more info, see https://www.srihash.org/.

### Node.js

```js
// CommonJS
const AxiosProvider = require('ethers-axios-provider');

// ModuleJS / TypeScript
import AxiosProvider from 'ethers-axios-provider';

const provider = new AxiosProvider('rpc-host-here');

provider.getBlockNumber().then(blockNumber => {
  // Will return something like 10000
  console.log(blockNumber);
});
```
