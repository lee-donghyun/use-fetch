import { useLayoutEffect, useRef, useState } from "react";

import { api } from "./helper";
import { Option, Uri } from "./type";

export const useFetch = <Data, Error>(
  key: string,
  uri: Uri | null,
  option: Option<Data, Error> = { keepPreviousData: true },
) => {
  const keyRef = useRef<string | null>(null);
  const freshPromiseId = useRef(0);

  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = async (id: number) => {
    if (uri === null) {
      setData(null);
      setError(null);
      return;
    }

    if (!option.keepPreviousData) {
      setData(null);
      setError(null);
    }
    try {
      const data = await api<Data>(uri);
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

  useLayoutEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      void load(++freshPromiseId.current);
    }
  });

  return { data, error, refresh: () => load(++freshPromiseId.current) };
};
