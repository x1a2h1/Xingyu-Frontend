import { useCreation, useUnmount } from 'ahooks';
import { useRef } from 'react';

import type { Plugin } from '../type';
import { getCache, setCache } from '../utils/cache';
import type { CachedData } from '../utils/cache';
import { getCachePromise, setCachePromise } from '../utils/cachePromise';
import { subscribe, trigger } from '../utils/cacheSubscribe';

const useCachePlugin: Plugin<any, any[]> = (
  fetchInstance,
  { cacheKey, cacheTime = 5 * 60 * 1000, getCache: customGetCache, setCache: customSetCache, staleTime = 0 }
) => {
  const unSubscribeRef = useRef<() => void>(null);

  const currentPromiseRef = useRef<Promise<any>>(null);

  const _setCache = (key: string, cachedData: CachedData) => {
    if (customSetCache) {
      customSetCache(cachedData);
    } else {
      setCache(key, cacheTime, cachedData);
    }
    trigger(key, cachedData.data);
  };

  const _getCache = (key: string, params: any[] = []) => {
    if (customGetCache) {
      return customGetCache(params);
    }
    return getCache(key);
  };

  useCreation(() => {
    if (!cacheKey) {
      return;
    }

    // get data from cache when init
    const cacheData = _getCache(cacheKey);
    if (cacheData && Object.hasOwn(cacheData, 'data')) {
      fetchInstance.state.data = cacheData.data;
      fetchInstance.state.params = cacheData.params;
      if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
        fetchInstance.state.loading = false;
      }
    }

    // subscribe same cachekey update, trigger update
    unSubscribeRef.current = subscribe(cacheKey, data => {
      fetchInstance.setState({ data });
    });
  }, []);

  useUnmount(() => {
    unSubscribeRef.current?.();
  });

  if (!cacheKey) {
    return {};
  }

  return {
    onBefore: params => {
      const cacheData = _getCache(cacheKey, params);

      if (!cacheData || !Object.hasOwn(cacheData, 'data')) {
        return {};
      }

      // If the data is fresh, stop request
      if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
        return {
          data: cacheData?.data,
          error: undefined,
          loading: false,
          returnNow: true
        };
      }
      // If the data is stale, return data, and request continue
      return {
        data: cacheData?.data,
        error: undefined
      };
    },
    onMutate: data => {
      if (cacheKey) {
        // cancel subscribe, avoid trigger self
        unSubscribeRef.current?.();
        _setCache(cacheKey, {
          data,
          params: fetchInstance.state.params,
          time: new Date().getTime()
        });
        // resubscribe
        unSubscribeRef.current = subscribe(cacheKey, d => {
          fetchInstance.setState({ data: d });
        });
      }
    },
    onRequest: (service, args) => {
      let servicePromise = getCachePromise(cacheKey);

      // If has servicePromise, and is not trigger by self, then use it
      if (servicePromise && servicePromise !== currentPromiseRef.current) {
        return { servicePromise };
      }

      servicePromise = service(...args);
      currentPromiseRef.current = servicePromise;
      setCachePromise(cacheKey, servicePromise);
      return { servicePromise };
    },
    onSuccess: (data, params) => {
      if (cacheKey) {
        // cancel subscribe, avoid trgger self
        unSubscribeRef.current?.();
        _setCache(cacheKey, {
          data,
          params,
          time: new Date().getTime()
        });
        // resubscribe
        unSubscribeRef.current = subscribe(cacheKey, d => {
          fetchInstance.setState({ data: d });
        });
      }
    }
  };
};

export default useCachePlugin;
