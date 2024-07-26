import { useLayoutEffect, useRef, useState } from "react";

import { api } from "./helper";
import { Key, Option, Uri } from "./type";

export const useFetchInfinite = <Data, Error>(
  key: Key,
  getUri: (page: number, data: Data[]) => Uri,
  option?: Option<Data[], Error> & { defaultSize?: number },
) => {
  const defaultSize = option?.defaultSize ?? 0;
  const keepPreviousData = option?.keepPreviousData ?? false;

  const KeyRef = useRef(key);
  const promisesRef = useRef<Promise<Data>[]>([]);
  const freshPromiseId = useRef(0);

  const [size, setSize] = useState(defaultSize);
  const [data, setData] = useState<Data[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const forceRerender = () => setData((data) => [...data]);

  const handlePromise = async (promise: Promise<Data>[], id: number) => {
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
      promisesRef.current[page] = api<Data>(getUri(page, data));
      return handlePromise(promisesRef.current, ++freshPromiseId.current);
    }
    // reload all
    promisesRef.current = [];
    while (promisesRef.current.length < size) {
      const uri = getUri(promisesRef.current.length, data);
      promisesRef.current.push(api<Data>(uri));
    }
    if (!keepPreviousData) {
      setData([]);
      setError(null);
    }
    return handlePromise(promisesRef.current, ++freshPromiseId.current);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (KeyRef.current !== key) {
      // make state fresh as first mount
      KeyRef.current = key;
      promisesRef.current = [];
      ++freshPromiseId.current;
      setSize(defaultSize);
      if (!keepPreviousData) {
        setData([]);
        setError(null);
      } else {
        // size is not changed, but need to reload
        forceRerender();
      }
      return;
    }
    let changed = false;
    while (promisesRef.current.length < size) {
      const uri = getUri(promisesRef.current.length, data);
      promisesRef.current.push(api<Data>(uri));
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
