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
'use strict';

var axiosAuto = require('axios-auto');
var ethers = require('ethers');

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

module.exports = AxiosProvider;
