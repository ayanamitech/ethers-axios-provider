import { providers } from 'ethers';
import type { fetchConfig } from 'axios-auto';
export declare type extraConfig = Omit<fetchConfig, 'url'>;
export default class AxiosProvider extends providers.JsonRpcProvider {
    private axiosConfig;
    private requestId;
    constructor(urlOrConfig: string | fetchConfig, extraConfig?: extraConfig, network?: providers.Networkish);
    send(method: string, params: Array<any>): Promise<any>;
}
