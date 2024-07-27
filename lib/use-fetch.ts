import { useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "./helper";
import { Option } from "./type";

export const useFetch = <Data, Error>(
  key: string | null,
  fetcher: (key: string) => Promise<Data>,
  option: Option<Data, Error> = { keepPreviousData: true },
) => {
  const keyRef = useRef<string | null>(null);
  const freshPromiseId = useRef(0);

  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = async (id: number) => {
    if (key === null) {
      setData(null);
      setError(null);
      return;
    }

    if (!option.keepPreviousData) {
      setData(null);
      setError(null);
    }
    try {
      const data = await fetcher(key);
      if (freshPromiseId.current === id) {
        setData(data);
        setError(null);
        option.onSuccess?.(data);
      }
    } catch (error) {
      if (freshPromiseId.current === id) {
        setData(null);
        setError(error as Error);
        option.onError?.(error as Error);
      }
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      void load(++freshPromiseId.current);
    }
  });

  return { data, error, refresh: () => load(++freshPromiseId.current) };
};
