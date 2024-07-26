import { useEffect, useLayoutEffect } from "react";

import { Uri } from "./type";

export const api = <T>(key: Uri) =>
  fetch(key[0]).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch");
    }
    return res.json();
  }) as Promise<T>;

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
