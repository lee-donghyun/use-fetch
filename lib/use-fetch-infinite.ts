import { useLayoutEffect, useRef, useState } from "react";
import { Key, Option } from "./type";
import { api } from "./helper";

export const useFetchInfinite = <Data, Error>(
  name: string,
  getKey: (page: number, data: Data[]) => Key,
  option: Omit<Option<Data[], Error>, "keepPreviousData"> & {
    defaultSize?: number;
  } = { defaultSize: 0 }
) => {
  const appliedName = useRef(name);
  const promisesRef = useRef<Promise<Data>[]>([]);

  const [size, setSize] = useState(option.defaultSize ?? 0);
  const [data, setData] = useState<Data[]>([]);
  const [error, setError] = useState<Error | null>(null);

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
      Promise.all(promisesRef.current)
        .then((data) => {
          setData(data);
          option.onSuccess?.(data);
        })
        .catch((error) => {
          setError(error);
          option.onError?.(error);
        });
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
    size,
    setSize,
    isLoading: data.length != size && error === null,
  };
};
