/*!
 * MIT License
 * 
 * Copyright (c) 2022 AyanamiTech
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
import { post } from 'axios-auto';
import { utils, providers } from 'ethers';

const version = "ethers-axios-provider@5.6.14";

const logger = new utils.Logger(version);
class AxiosProvider extends providers.JsonRpcProvider {
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
      if (typeof count === "number" && typeof retryMax === "number" && data.error) {
        const message = typeof data.error.message === "string" ? data.error.message : typeof data.error === "string" ? data.error : typeof data.error === "object" ? JSON.stringify(data.error) : "";
        if (count < retryMax + 1) {
          throw new Error(message);
        }
      }
    };
    options.filter || (options.filter = filter);
    const sendTxMethods = ["eth_sendRawTransaction", "eth_sendTransaction"];
    const sendTransaction = sendTxMethods.includes(method) ? true : false;
    if (sendTransaction) {
      return post(url.replace(/\s+/g, "").split(",")[0], payload, options).then((postResult) => postResult.result);
    } else {
      return post(url, payload, options).then((postResult) => postResult.result);
    }
  }
}

export { AxiosProvider as default };
