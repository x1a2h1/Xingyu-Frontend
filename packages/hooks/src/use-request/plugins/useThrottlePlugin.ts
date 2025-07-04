import type { DebouncedFunc, ThrottleSettings } from 'lodash-es';
import { throttle } from 'lodash-es';
import { useEffect, useRef } from 'react';

import type { Plugin } from '../type';

const useThrottlePlugin: Plugin<any, any[]> = (fetchInstance, { throttleLeading, throttleTrailing, throttleWait }) => {
  const throttledRef = useRef<DebouncedFunc<any>>(null);

  const options: ThrottleSettings = {};
  if (throttleLeading !== undefined) {
    options.leading = throttleLeading;
  }
  if (throttleTrailing !== undefined) {
    options.trailing = throttleTrailing;
  }

  useEffect(() => {
    if (throttleWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      throttledRef.current = throttle(
        callback => {
          callback();
        },
        throttleWait,
        options
      );

      // throttle runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          throttledRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        fetchInstance.runAsync = _originRunAsync;
        throttledRef.current?.cancel();
      };
    }
    return () => {};
  }, [throttleWait, throttleLeading, throttleTrailing]);

  if (!throttleWait) {
    return {};
  }

  return {
    onCancel: () => {
      throttledRef.current?.cancel();
    }
  };
};

export default useThrottlePlugin;
