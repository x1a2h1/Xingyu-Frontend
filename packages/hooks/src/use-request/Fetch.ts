// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type { FlatResponseData } from '@sa/axios';
import type { AxiosError } from 'axios';
import type { MutableRefObject } from 'react';

import type { FetchState, Options, PluginReturn, Service, Subscribe } from './type';
import { isFunction } from './utils';

export default class Fetch<TData extends FlatResponseData, TParams extends any[]> {
  pluginImpls: PluginReturn<TData, TParams>[];

  count: number = 0;

  options: Options<TData, TParams>;

  state: FetchState<TData, TParams> = {
    data: undefined,
    error: null,
    loading: false,
    params: undefined,
    response: null
  };

  constructor(
    public serviceRef: MutableRefObject<Service<TData, TParams>>,
    public options: Options<TData, TParams>,
    public subscribe: Subscribe
  ) {
    this.state = {
      ...this.state,
      loading: !options.manual
    };

    this.options = options;
  }

  setState(s: Partial<FetchState<TData, TParams>> = {}) {
    this.state = {
      ...this.state,
      ...s
    };

    this.subscribe();
  }

  runPluginHandler(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {
    const r = this.pluginImpls.map(i => i[event]?.(...rest)).filter(Boolean);
    return Object.assign({}, ...r);
  }

  async runAsync(...params: TParams): Promise<TData> {
    this.count += 1;
    const currentCount = this.count;

    const { returnNow = false, stopNow = false, ...state } = this.runPluginHandler('onBefore', params);

    // stop request
    if (stopNow) {
      return new Promise(() => {});
    }

    this.setState({
      loading: true,
      params,
      ...state
    });

    // return now
    if (returnNow) {
      return Promise.resolve(state.data);
    }

    this.options.onBefore?.(params);

    try {
      // replace service
      let { servicePromise } = this.runPluginHandler('onRequest', this.serviceRef.current, params);

      if (!servicePromise) {
        servicePromise = this.serviceRef.current(...params);
      }

      const res = await servicePromise;

      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }

      // const formattedResult = this.options.formatResultRef.current ? this.options.formatResultRef.current(res) : res;

      this.setState({
        data: res.data,
        error: null,
        loading: false,
        response: res.response
      });

      this.options.onSuccess?.(res.data, params);
      this.runPluginHandler('onSuccess', res, params);

      this.options.onFinally?.(params, res.data, null);

      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, res, null);
      }

      return res;
    } catch (error) {
      const errorMessage = error as AxiosError;
      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }

      this.setState({
        data: null,
        error: errorMessage,
        loading: false,
        response: error.response
      });

      this.options.onError?.(errorMessage, params);
      this.runPluginHandler('onError', error, params);

      this.options.onFinally?.(params, undefined, errorMessage);

      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, undefined, error);
      }

      throw error;
    }
  }

  run(...params: TParams) {
    this.runAsync(...params).catch(error => {
      if (!this.options.onError) {
        console.error(error);
      }
    });
  }

  cancel() {
    this.count += 1;

    this.setState({
      loading: false
    });

    this.runPluginHandler('onCancel');
  }

  refresh() {
    this.run(...(this.state.params || []));
  }

  refreshAsync() {
    return this.runAsync(...(this.state.params || []));
  }

  mutate(data?: TData | ((oldData: TData | null) => TData | null)) {
    const targetData = isFunction(data) ? data(this.state.data) : data;
    this.runPluginHandler('onMutate', targetData);
    this.setState({
      data: targetData
    });
  }
}
