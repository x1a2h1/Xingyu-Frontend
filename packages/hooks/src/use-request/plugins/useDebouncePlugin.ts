import type { DebounceSettings, DebouncedFunc } from 'lodash-es';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';

import type { Plugin } from '../type';

const useDebouncePlugin: Plugin<any, any[]> = (
  fetchInstance,
  { debounceLeading, debounceMaxWait, debounceTrailing, debounceWait }
) => {
  const debouncedRef = useRef<DebouncedFunc<any>>(null);

  const options = useMemo(() => {
    const ret: DebounceSettings = {};
    if (debounceLeading !== undefined) {
      ret.leading = debounceLeading;
    }
    if (debounceTrailing !== undefined) {
      ret.trailing = debounceTrailing;
    }
    if (debounceMaxWait !== undefined) {
      ret.maxWait = debounceMaxWait;
    }
    return ret;
  }, [debounceLeading, debounceTrailing, debounceMaxWait]);

  useEffect(() => {
    if (debounceWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      debouncedRef.current = debounce(
        (callback: () => void) => {
          callback();
        },
        debounceWait,
        options
      );

      // debounce runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          debouncedRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        debouncedRef.current?.cancel();
        fetchInstance.runAsync = _originRunAsync;
      };
    }
    return () => {};
  }, [debounceWait, options]);

  if (!debounceWait) {
    return {};
  }

  return {
    onCancel: () => {
      debouncedRef.current?.cancel();
    }
  };
};

export default useDebouncePlugin;
