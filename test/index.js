'use strict';

var axiosAuto = require('axios-auto');
var ethers = require('ethers');
var assert = require('assert');
var axios = require('axios');
var MockAdapter = require('axios-mock-adapter');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var MockAdapter__default = /*#__PURE__*/_interopDefaultLegacy(MockAdapter);

const version = "ethers-axios-provider@5.6.9";

const logger = new ethers.utils.Logger(version);
class AxiosProvider extends ethers.providers.JsonRpcProvider {
  constructor(urlOrConfig, extraConfig, network) {
    if (typeof urlOrConfig === "object" && !urlOrConfig.url) {
      logger.throwArgumentError("missing node url", "urlOrConfig", urlOrConfig);
    }
    const axiosConfig = {
      url: typeof urlOrConfig === "string" ? urlOrConfig : urlOrConfig.url
    };
    if (typeof urlOrConfig === "object") {
      Object.assign(axiosConfig, urlOrConfig);
    }
    if (extraConfig) {
      Object.assign(axiosConfig, extraConfig);
    }
    super(axiosConfig.url.replace(/\s+/g, "").split(",")[0], network);
    this.requestId = 1;
    this.axiosConfig = axiosConfig;
  }
  send(method, params) {
    const url = Object.assign({}, this.axiosConfig).url;
    const payload = {
      method,
      params,
      id: this.requestId++,
      jsonrpc: "2.0"
    };
    const options = Object.assign({}, this.axiosConfig);
    delete options.url;
    if (options.filter === void 0) {
      const filter = (data) => {
        if (data.error) {
          const message = typeof data.error.message === "string" ? data.error.message : typeof data.error === "string" ? data.error : typeof data.error === "object" ? JSON.stringify(data.error) : "";
          throw new Error(message);
        } else if (Array.isArray(data)) {
          const errorArray = data.map((d) => {
            if (d.error) {
              const message = typeof d.error.message === "string" ? d.error.message : typeof d.error === "string" ? d.error : typeof d.error === "object" ? JSON.stringify(d.error) : "";
              return new Error(message);
            }
          }).filter((d) => d);
          if (errorArray.length > 0) {
            throw errorArray;
          }
        }
      };
      options.filter = filter;
    }
    const sendTxMethods = ["eth_sendRawTransaction", "eth_sendTransaction", "klay_sendRawTransaction", "klay_sendTransaction"];
    const sendTransaction = sendTxMethods.includes(method) ? true : false;
    if (sendTransaction) {
      return axiosAuto.post(url.replace(/\s+/g, "").split(",")[0], payload, options).then((postResult) => postResult.result);
    } else {
      return axiosAuto.post(url, payload, options).then((postResult) => postResult.result);
    }
  }
}

describe("ethers-axios-provider", () => {
  it("eth_blockNumber", async () => {
    const axiosInstance = axios__default["default"];
    const mock = new MockAdapter__default["default"](axiosInstance, { onNoMatch: "throwException" });
    const provider = new AxiosProvider("/", { axios: axiosInstance, timeout: 100, retryMax: 0 });
    const chainId = { "jsonrpc": "2.0", "id": 1, "result": "0x5" };
    const blockNumber = { "jsonrpc": "2.0", "id": 2, "result": "0x1" };
    mock.onPost("/", { "jsonrpc": "2.0", "id": 1, "method": "eth_chainId", "params": [] }).reply(200, chainId).onPost("/", { "jsonrpc": "2.0", "id": 2, "method": "eth_blockNumber", "params": [] }).reply(200, blockNumber);
    const result = await provider.getBlockNumber();
    assert.strict.deepEqual(result, 1);
  });
});