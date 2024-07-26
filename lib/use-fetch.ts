import { useLayoutEffect, useRef, useState } from "react";

import { api } from "./helper";
import { Key, Option } from "./type";

export const useFetch = <Data, Error>(
  key: Key | null,
  option: Option<Data, Error> = { keepPreviousData: true },
) => {
  const keyRef = useRef<Key | null>(null);
  const freshPromiseId = useRef(0);
  const timeRef = useRef(0);

  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [time, setTime] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (keyRef.current !== key || timeRef.current !== time) {
      keyRef.current = key;
      timeRef.current = time;

      if (key === null) {
        setData(null);
        setError(null);
        return;
      }

      if (!option.keepPreviousData) {
        setData(null);
        setError(null);
      }
      const id = ++freshPromiseId.current;
      api<Data>(key)
        .then((data) => {
          if (freshPromiseId.current === id) {
            setData(data);
            setError(null);
            option.onSuccess?.(data);
          }
        })
        .catch((error) => {
          if (freshPromiseId.current === id) {
            setData(null);
            setError(error as Error);
            option.onError?.(error as Error);
          }
        });
    }
  });

  return { data, error, refresh: () => setTime((p) => p + 1) };
};
