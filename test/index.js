'use strict';

var axiosAuto = require('axios-auto');
var ethers = require('ethers');
var assert = require('assert');
var axios = require('axios');
var MockAdapter = require('axios-mock-adapter');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var MockAdapter__default = /*#__PURE__*/_interopDefaultLegacy(MockAdapter);

const version = "ethers-axios-provider@5.6.20";

const logger = new ethers.utils.Logger(version);
class AxiosProvider extends ethers.providers.JsonRpcProvider {
  constructor(urlOrConfig, extraConfig, network) {
    var _a;
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
    axiosConfig.headers || (axiosConfig.headers = {});
    (_a = axiosConfig.headers)["Content-Type"] || (_a["Content-Type"] = "application/json;charset=utf-8");
    super(axiosConfig.url.replace(/\s+/g, "").split(",")[0], network);
    this.requestId = 1;
    this.axiosConfig = axiosConfig;
  }
  send(method, params) {
    var _a;
    if (method === "eth_chainId" && ((_a = this._network) == null ? void 0 : _a.chainId)) {
      return new Promise((resolve) => {
        var _a2;
        return resolve((_a2 = this._network) == null ? void 0 : _a2.chainId);
      });
    }
    const url = Object.assign({}, this.axiosConfig).url;
    const payload = {
      method,
      params,
      id: this.requestId++,
      jsonrpc: "2.0"
    };
    const options = Object.assign({}, this.axiosConfig);
    delete options.url;
    const filter = (data, count, retryMax) => {
      if (typeof count === "number" && typeof retryMax === "number") {
        let message;
        if (data.error) {
          message = typeof data.error.message === "string" ? data.error.message : typeof data.error === "string" ? data.error : typeof data.error === "object" ? JSON.stringify(data.error) : "";
        } else if (typeof data.result === "undefined") {
          message = typeof data === "string" ? data : typeof data === "object" ? JSON.stringify(data) : "Result not available from remote node";
        }
        if (typeof message !== "undefined" && count < retryMax + 1) {
          throw new Error(message);
        }
      }
    };
    options.filter || (options.filter = filter);
    const sendTxMethods = ["eth_sendRawTransaction", "eth_sendTransaction"];
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
