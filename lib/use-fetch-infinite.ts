import { useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "./helper";
import { Key, Option } from "./type";
import { useRerender } from "./use-rerender";

export const useFetchInfinite = <Data, Error>(
  key: Key,
  fetcher: (key: string, page: number, data: Data[]) => Promise<Data>,
  option?: Option<Data[], Error> & { defaultSize?: number },
) => {
  const defaultSize = option?.defaultSize ?? 0;
  const keepPreviousData = option?.keepPreviousData ?? false;

  const keyRef = useRef(key);
  const promisesRef = useRef<Promise<Data>[]>([]);
  const freshPromiseId = useRef(0);

  const [size, setSize] = useState(defaultSize);
  const [data, setData] = useState<Data[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const forceRerender = useRerender();

  const handlePromise = async (promise: Promise<Data>[], id: number) => {
    if (!keepPreviousData) {
      setData(() => []);
      setError(() => null);
    }
    try {
      const data = await Promise.all(promise);
      if (freshPromiseId.current === id) {
        setData(data);
        setError(null);
        option?.onSuccess?.(data);
      }
    } catch (error) {
      if (freshPromiseId.current === id) {
        setError(error as Error);
        option?.onError?.(error as Error);
      }
    }
  };

  const reload = (page?: number) => {
    if (typeof page === "number") {
      // reload by page
      promisesRef.current[page] = fetcher(key, page, data);
      return handlePromise(promisesRef.current, ++freshPromiseId.current);
    }
    // reload all
    promisesRef.current = [];
    while (promisesRef.current.length < size) {
      promisesRef.current.push(fetcher(key, promisesRef.current.length, data));
    }
    return handlePromise(promisesRef.current, ++freshPromiseId.current);
  };

  useIsomorphicLayoutEffect(() => {
    if (keyRef.current !== key) {
      // make state fresh as first mount
      keyRef.current = key;
      promisesRef.current = [];
      ++freshPromiseId.current;
      setSize(defaultSize);
      // size is not changed, but need to reload
      forceRerender();
      return;
    }
    let changed = false;
    while (promisesRef.current.length < size) {
      promisesRef.current.push(fetcher(key, promisesRef.current.length, data));
      changed = true;
    }
    while (promisesRef.current.length > size) {
      void promisesRef.current.pop();
      changed = true;
    }
    if (changed) {
      void handlePromise(promisesRef.current, ++freshPromiseId.current);
    }
  });

  return { data, error, reload, size, setSize };
};
