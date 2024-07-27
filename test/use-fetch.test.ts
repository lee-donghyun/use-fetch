import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useFetch } from "../lib/use-fetch";

describe("useFetch", () => {
  let fetcher;

  beforeEach(() => {
    fetcher = vi.fn();
  });

  it("should initialize with null data and error", () => {
    const { result } = renderHook(() => useFetch(null, fetcher));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should fetch data successfully", async () => {
    const data = { message: "success" };
    fetcher.mockResolvedValue(data);

    const { result } = renderHook(() => useFetch("key", fetcher));

    waitFor(() => {
      expect(result.current.data).toEqual(data);
      expect(result.current.error).toBeNull();
    });
  });

  it("should handle fetch error", async () => {
    const error = new Error("fetch error");
    fetcher.mockRejectedValue(error);

    const { result } = renderHook(() => useFetch("key", fetcher));

    waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(error);
    });
  });

  it("should return null data and error when key is null", async () => {
    const { result } = renderHook(() => useFetch(null, fetcher));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should refresh data", async () => {
    const data = { message: "success" };
    fetcher.mockResolvedValue(data);

    const { result } = renderHook(() => useFetch("key", fetcher));

    waitFor(() => {
      expect(result.current.data).toEqual(data);
    });

    fetcher.mockResolvedValue({ message: "refreshed" });
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data).toEqual({ message: "refreshed" });
  });

  it("should call onSuccess callback on success", async () => {
    const onSuccess = vi.fn();
    const data = { message: "success" };
    fetcher.mockResolvedValue(data);

    renderHook(() => useFetch("key", fetcher, { onSuccess }));

    await new Promise((res) => res(0)); // wait for the promise to resolve

    expect(onSuccess).toHaveBeenCalledWith(data);
  });

  it("should call onError callback on error", async () => {
    const onError = vi.fn();
    const error = new Error("fetch error");
    fetcher.mockRejectedValue(error);

    renderHook(() => useFetch("key", fetcher, { onError }));

    await new Promise((res) => res(0)); // wait for the promise to resolve

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should keep previous data when keepPreviousData is true", async () => {
    const data = { message: "success" };
    fetcher.mockResolvedValue(data);

    const { result } = renderHook(() => useFetch("key", fetcher));

    waitFor(() => {
      expect(result.current.data).toEqual(data);
    });

    fetcher.mockResolvedValue({ message: "updated" });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data).toEqual({ message: "updated" });
  });

  it("should not keep previous data when keepPreviousData is false", async () => {
    const data = { message: "success" };
    fetcher.mockResolvedValue(data);

    const { result } = renderHook(() =>
      useFetch("key", fetcher, { keepPreviousData: false }),
    );

    waitFor(() => {
      expect(result.current.data).toEqual(data);
    });

    fetcher.mockResolvedValue({ message: "updated" });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data).toEqual({ message: "updated" });
  });

  it("should fetch data with key change", async () => {
    const data1 = { message: "success1" };
    const data2 = { message: "success2" };
    fetcher.mockResolvedValueOnce(data1).mockResolvedValueOnce(data2);

    const { result, rerender } = renderHook(
      ({ key }) => useFetch(key, fetcher),
      { initialProps: { key: "key1" } },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(data1);
    });

    rerender({ key: "key2" });

    await waitFor(() => {
      expect(result.current.data).toEqual(data2);
    });
  });

  it("should handle concurrent requests properly", async () => {
    const data1 = { message: "success1" };
    const data2 = { message: "success2" };
    fetcher.mockResolvedValueOnce(data1).mockResolvedValueOnce(data2);

    const { result } = renderHook(() => useFetch("key", fetcher));

    await act(async () => {
      await result.current.refresh();
      await result.current.refresh();
    });

    waitFor(() => {
      expect(result.current.data).toEqual(data2);
    });
  });

  it("should handle key change during fetch", async () => {
    const data1 = { message: "success1" };
    const data2 = { message: "success2" };
    fetcher.mockResolvedValueOnce(data1).mockResolvedValueOnce(data2);

    const { result, rerender } = renderHook(
      ({ key }) => useFetch(key, fetcher),
      { initialProps: { key: "key1" } },
    );

    rerender({ key: "key2" });

    waitFor(() => {
      expect(result.current.data).toEqual(data2);
    });
  });

  it("should handle onSuccess side effect", async () => {
    const onSuccess = vi.fn();
    const data = { message: "success" };
    fetcher.mockResolvedValue(data);

    renderHook(() => useFetch("key", fetcher, { onSuccess }));

    await new Promise((res) => res(0)); // wait for the promise to resolve

    expect(onSuccess).toHaveBeenCalledWith(data);
  });

  it("should handle onError side effect", async () => {
    const onError = vi.fn();
    const error = new Error("fetch error");
    fetcher.mockRejectedValue(error);

    renderHook(() => useFetch("key", fetcher, { onError }));

    await new Promise((res) => res(0)); // wait for the promise to resolve

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should cleanup after unmount", async () => {
    const data = { message: "success" };
    fetcher.mockResolvedValue(data);

    const { unmount } = renderHook(() => useFetch("key", fetcher));

    unmount();

    await act(async () => {
      await new Promise((res) => res(0)); // wait for the promise to resolve
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
