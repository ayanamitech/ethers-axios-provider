import { version } from './_version';
import { post } from 'axios-auto';
import { providers, utils } from 'ethers';
import type { fetchConfig, filter } from 'axios-auto';
const logger = new utils.Logger(version);

export type extraConfig = Omit<fetchConfig, 'url'>;

export default class AxiosProvider extends providers.JsonRpcProvider {
  private axiosConfig: fetchConfig;
  private requestId = 1;

  constructor(urlOrConfig: string | fetchConfig, extraConfig?: extraConfig, network?: providers.Networkish) {
    if (typeof urlOrConfig === 'object' && !urlOrConfig.url) {
      logger.throwArgumentError('missing node url', 'urlOrConfig', urlOrConfig);
    }

    const axiosConfig: fetchConfig = {
      url: (typeof urlOrConfig === 'string') ? urlOrConfig : urlOrConfig.url
    };

    if (typeof urlOrConfig === 'object') {
      Object.assign(axiosConfig, urlOrConfig);
    }

    if (extraConfig) {
      Object.assign(axiosConfig, extraConfig);
    }

    axiosConfig.headers ||= {};
    axiosConfig.headers['Content-Type'] ||= 'application/json;charset=utf-8';

    // Tell JsonRpcProvider only one node (While send queries to multiple nodes at once)
    super(axiosConfig.url.replace(/\s+/g, '').split(',')[0], network);
    this.axiosConfig = axiosConfig;
  }

  send(method: string, params: Array<any>): Promise<any> {
    // Return cached eth_chainId if available
    if (method === 'eth_chainId' && this._network?.chainId) {
      return new Promise(resolve => resolve(this._network?.chainId));
    }

    const url = Object.assign({}, this.axiosConfig).url;

    const payload = {
      method,
      params,
      id: (this.requestId++),
      jsonrpc: '2.0'
    };

    type options = extraConfig & {url?: string};
    const options: options = Object.assign({}, this.axiosConfig);
    delete options.url;

    /**
     * Filter rpc node generated error
     */
    const filter: filter = (data: any, count?: number, retryMax?: number) => {
      if (typeof count === 'number' && typeof retryMax === 'number') {
        let message: string | undefined;
        // Handle usual error object from remote node
        if (data.error) {
          message = (typeof data.error.message === 'string')
            ? data.error.message : (typeof data.error === 'string')
              ? data.error : (typeof data.error === 'object')
                ? JSON.stringify(data.error) : '';
        // Handle custom error from remote node
        } else if (typeof data.result === 'undefined') {
          message = (typeof data === 'string') ? data :
            (typeof data === 'object') ? JSON.stringify(data) :
              'Result not available from remote node';
        }
        // Throw error to retry inside axios-auto function
        if (typeof message !== 'undefined' && count < retryMax + 1) {
          throw new Error(message);
        }
      }
    };

    options.filter ||= filter;

    const sendTxMethods = ['eth_sendRawTransaction', 'eth_sendTransaction'];
    const sendTransaction = sendTxMethods.includes(method) ? true : false;

    if (sendTransaction) {
      // Prevent the use of multiple rpc nodes to prevent duplicated transaction
      return post(url.replace(/\s+/g, '').split(',')[0], payload, options).then(postResult => postResult.result);
    } else {
      return post(url, payload, options).then(postResult => postResult.result);
    }
  }
}
