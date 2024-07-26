import { useLayoutEffect, useRef, useState } from "react";
import { Key, Option } from "./type";
import { api } from "./helper";

export const useFetch = <Data, Error>(
  key: Key | null,
  option: Option<Data, Error> = { keepPreviousData: true }
) => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [time, setTime] = useState(0);
  const keyRef = useRef<Key | null>(null);
  const timeRef = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (keyRef.current !== key || timeRef.current !== time) {
      keyRef.current = key;
      timeRef.current = time;
      if (!option.keepPreviousData) {
        setData(null);
        setError(null);
      }
      if (key) {
        api<Data>(key)
          .then((data) => {
            setData(data);
            setError(null);
            option.onSuccess?.(data);
          })
          .catch((error) => {
            setData(null);
            setError(error);
            option.onError?.(error);
          });
      }
    }
  });

  return { data, error, refresh: () => setTime((p) => p + 1) };
};
