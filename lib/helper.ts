import { useEffect, useLayoutEffect } from "react";

export const api = <T>(key: string) =>
  fetch(key).then((res) => res.json()) as Promise<T>;

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
