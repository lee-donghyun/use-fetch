import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFetchInfinite } from "../lib";

const fetchPageData = async (key: string, page: number) => {
  return [`${key}-data-page-${page}`];
};

describe("useFetchInfinite", () => {
  it("fetches initial page data successfully", async () => {
    const { result } = renderHook(() =>
      useFetchInfinite("test-key", fetchPageData, { defaultSize: 1 }),
    );

    waitFor(() => {
      expect(result.current.data).toEqual(["test-key-data-page-1"]);
      expect(result.current.error).toBeNull();
    });
  });

  it("loads more pages successfully", async () => {
    const { result } = renderHook(() =>
      useFetchInfinite("test-key", fetchPageData, { defaultSize: 1 }),
    );
    waitFor(async () => {
      expect(result.current.data).toEqual(["test-key-data-page-1"]);
    });

    act(() => {
      result.current.setSize(2);
    });

    waitFor(() => {
      expect(result.current.data).toEqual([
        "test-key-data-page-1",
        "test-key-data-page-2",
      ]);
    });
  });

  it("handles fetch error", async () => {
    const fetchError = async () => {
      throw new Error("Fetch error");
    };

    const { result } = renderHook(() =>
      useFetchInfinite("test-key", fetchError, { defaultSize: 1 }),
    );
    waitFor(async () => {
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toEqual(new Error("Fetch error"));
    });
  });
});
