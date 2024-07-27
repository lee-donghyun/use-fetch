import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useFetch } from "../lib/use-fetch";

describe("useFetch", () => {
  it("fetches data successfully", async () => {
    const fetchData = async (key: string) => {
      return { data: `Response for ${key}` };
    };
    const { result } = renderHook(() => useFetch("test-key", fetchData));

    waitFor(() => {
      expect(result.current.data).toEqual({ data: "Response for test-key" });
      expect(result.current.error).toBeNull();
    });
  });

  it("handles fetch error", async () => {
    const fetchError = async () => {
      throw new Error("Fetch error");
    };
    const { result } = renderHook(() => useFetch("test-key", fetchError));

    waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(new Error("Fetch error"));
    });
  });
});
