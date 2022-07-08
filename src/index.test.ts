import AxiosProvider from './index';
import { strict as assert } from 'assert';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

/**
 * Test specs written according to
 * https://eth.wiki/json-rpc/API
 * https://docs.ethers.io/v5/api/providers/
 */
describe('ethers-axios-provider', () => {
  it('eth_blockNumber', async () => {
    const axiosInstance = axios;
    const mock = new MockAdapter(axiosInstance, { onNoMatch: 'throwException' });
    const provider = new AxiosProvider('/', { axios: axiosInstance, timeout: 100, retryMax: 0 });
    const chainId = { 'jsonrpc': '2.0', 'id': 1, 'result': '0x5' };
    const blockNumber = { 'jsonrpc': '2.0', 'id': 2, 'result': '0x1' };
    mock
      .onPost('/', { 'jsonrpc': '2.0', 'id': 1, 'method': 'eth_chainId', 'params': [] })
      .reply(200, chainId)
      .onPost('/', { 'jsonrpc': '2.0', 'id': 2, 'method': 'eth_blockNumber', 'params': [] })
      .reply(200, blockNumber);
    const result = await provider.getBlockNumber();
    assert.deepEqual(result, 1);
  });
});
