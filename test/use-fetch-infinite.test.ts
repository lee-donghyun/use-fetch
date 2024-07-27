import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
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

describe("useFetchInfinite", () => {
  let fetcher;

  beforeEach(() => {
    fetcher = vi.fn();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useFetchInfinite("null", fetcher));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.size).toBe(0);
  });

  it("should fetch data successfully", async () => {
    const data = [{ message: "success" }];
    fetcher.mockResolvedValue(data);

    const { result } = renderHook(() => useFetchInfinite("key", fetcher));

    waitFor(() => {
      expect(result.current.data).toEqual([data]);
      expect(result.current.error).toBeNull();
    });
  });

  it("should handle fetch error", async () => {
    const error = new Error("fetch error");
    fetcher.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useFetchInfinite("key", fetcher, { defaultSize: 1 }),
    );

    waitFor(() => {
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toEqual(error);
    });
  });

  it("should return empty data and null error when key is null", async () => {
    const { result } = renderHook(() => useFetchInfinite("null", fetcher));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should reload data", async () => {
    const data = [{ message: "success" }];
    fetcher.mockResolvedValue(data);

    const { result } = renderHook(() => useFetchInfinite("key", fetcher));

    fetcher.mockResolvedValue([{ message: "refreshed" }]);
    await act(async () => {
      await result.current.reload();
    });

    waitFor(async () => {
      expect(result.current.data).toEqual([[{ message: "refreshed" }]]);
    });
  });

  it("should call onSuccess callback on success", async () => {
    const onSuccess = vi.fn();
    const data = [{ message: "success" }];
    fetcher.mockResolvedValue(data);

    renderHook(() =>
      useFetchInfinite("key", fetcher, { onSuccess, defaultSize: 1 }),
    );

    waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith([[{ message: "success" }]]);
    });
  });

  it("should call onError callback on error", async () => {
    const onError = vi.fn();
    const error = new Error("fetch error");
    fetcher.mockRejectedValue(error);

    renderHook(() =>
      useFetchInfinite("key", fetcher, { onError, defaultSize: 1 }),
    );

    waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it("should keep previous data when keepPreviousData is true", async () => {
    const data = [{ message: "success" }];
    fetcher.mockResolvedValue(data);

    const { result } = renderHook(() =>
      useFetchInfinite("key", fetcher, { keepPreviousData: true }),
    );

    waitFor(() => {
      expect(result.current.data).toEqual([data]);
    });

    fetcher.mockResolvedValue([{ message: "updated" }]);

    await act(async () => {
      await result.current.reload();
    });

    waitFor(() => {
      expect(result.current.data).toEqual([[{ message: "updated" }]]);
    });
  });

  it("should not keep previous data when keepPreviousData is false", async () => {
    const data = [{ message: "success" }];
    fetcher.mockResolvedValue(data);

    const { result } = renderHook(() =>
      useFetchInfinite("key", fetcher, {
        keepPreviousData: false,
        defaultSize: 1,
      }),
    );

    waitFor(() => {
      expect(result.current.data).toEqual([data]);
    });

    fetcher.mockResolvedValue([{ message: "updated" }]);

    await act(async () => {
      await result.current.reload();
    });

    waitFor(() => {
      expect(result.current.data).toEqual([[{ message: "updated" }]]);
    });
  });

  it("should fetch data with key change", async () => {
    const data1 = [{ message: "success1" }];
    const data2 = [{ message: "success2" }];
    fetcher.mockResolvedValueOnce(data1).mockResolvedValueOnce(data2);

    const { result, rerender } = renderHook(
      ({ key }) => useFetchInfinite(key, fetcher, { defaultSize: 1 }),
      { initialProps: { key: "key1" } },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([data1]);
    });

    expect(result.current.data).toEqual([data1]);

    result.current.setSize(2);

    await waitFor(() => {
      expect(result.current.size).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([data1, data2]);
    });
  });

  it("should handle concurrent requests properly", async () => {
    const data1 = [{ message: "success1" }];
    const data2 = [{ message: "success2" }];
    fetcher.mockResolvedValueOnce(data1).mockResolvedValueOnce(data2);

    const { result } = renderHook(() =>
      useFetchInfinite("key", fetcher, { defaultSize: 1 }),
    );

    await act(async () => {
      await result.current.reload();
    });

    waitFor(() => {
      expect(result.current.data).toEqual([[{ message: "success2" }]]);
    });
  });

  it("should handle key change during fetch", async () => {
    const data1 = [{ message: "success1" }];
    const data2 = [{ message: "success2" }];
    fetcher.mockResolvedValueOnce(data1).mockResolvedValueOnce(data2);

    const { result, rerender } = renderHook(
      ({ key }) => useFetchInfinite(key, fetcher, { defaultSize: 1 }),
      { initialProps: { key: "key1" } },
    );

    rerender({ key: "key2" });

    waitFor(() => {
      expect(result.current.data).toEqual([data2]);
    });
  });

  it("should cleanup after unmount", async () => {
    const data = [{ message: "success" }];
    fetcher.mockResolvedValue(data);

    const { unmount } = renderHook(() =>
      useFetchInfinite("key", fetcher, { defaultSize: 1 }),
    );

    waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    unmount();

    await act(async () => {
      await new Promise((res) => res(0));
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
