import { useEffect, useLayoutEffect } from "react";

export const api = <T>(key: string) =>
  fetch(key).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch");
    }
    return res.json();
  }) as Promise<T>;

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
