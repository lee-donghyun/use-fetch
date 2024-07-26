import { useLayoutEffect, useRef, useState } from "react";
import { Key, Option } from "./type";
import { api } from "./helper";

export const useFetchInfinite = <Data, Error>(
  name: string,
  getKey: (page: number, data: Data[]) => Key,
  option: Option<Data[], Error> & { defaultSize?: number } = { defaultSize: 0 }
) => {
  const appliedName = useRef(name);
  const promisesRef = useRef<Promise<Data>[]>([]);

  const [size, setSize] = useState(option.defaultSize ?? 0);
  const [data, setData] = useState<Data[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const handlePromise = (promise: Promise<Data>[]) => {
    Promise.all(promise)
      .then((data) => {
        setData(data);
        setError(null);
        option.onSuccess?.(data);
      })
      .catch((error) => {
        setError(error);
        option.onError?.(error);
      });
  };

  const reset = () => {
    promisesRef.current = [];
    if (!option.keepPreviousData) {
      setData([]);
      setError(null);
    }
    while (promisesRef.current.length < size) {
      const key = getKey(promisesRef.current.length, data);
      promisesRef.current.push(api<Data>(key));
    }
    handlePromise(promisesRef.current);
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
      handlePromise(promisesRef.current);
    }
    if (appliedName.current !== name) {
      appliedName.current = name;
      setSize(option.defaultSize ?? 0);
      setData([]);
      setError(null);
    }
  });

  return {
    data,
    error,
    reload: reset,
    size,
    setSize,
    isLoading: data.length != size && error === null,
  };
};
