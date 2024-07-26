import { useLayoutEffect, useRef, useState } from "react";

import { api } from "./helper";
import { Key, Option } from "./type";

export const useFetchInfinite = <Data, Error>(
  name: string,
  getKey: (page: number, data: Data[]) => Key,
  option?: Option<Data[], Error> & { defaultSize?: number },
) => {
  const defulatSize = option?.defaultSize ?? 0;
  const keepPreviousData = option?.keepPreviousData ?? false;

  const appliedName = useRef(name);
  const promisesRef = useRef<Promise<Data>[]>([]);
  const freshPromiseId = useRef(0);

  const [size, setSize] = useState(defulatSize);
  const [data, setData] = useState<Data[]>([]);
  const [error, setError] = useState<Error | null>(null);

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
      promisesRef.current[page] = api<Data>(getKey(page, data));
      void handlePromise(promisesRef.current, ++freshPromiseId.current);
      return;
    }
    // reload all
    promisesRef.current = [];
    while (promisesRef.current.length < size) {
      const key = getKey(promisesRef.current.length, data);
      promisesRef.current.push(api<Data>(key));
    }
    if (!keepPreviousData) {
      setData([]);
      setError(null);
    }
    void handlePromise(promisesRef.current, ++freshPromiseId.current);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    let changed = false;
    while (promisesRef.current.length < size) {
      const key = getKey(promisesRef.current.length, data);
      promisesRef.current.push(api<Data>(key));
      changed = true;
    }
    while (promisesRef.current.length > size) {
      void promisesRef.current.pop();
      changed = true;
    }
    if (changed) {
      void handlePromise(promisesRef.current, ++freshPromiseId.current);
    }
    if (appliedName.current !== name) {
      appliedName.current = name;
      setSize(defulatSize);
      setData([]);
      setError(null);
    }
  });

  return { data, error, reload, size, setSize };
};
