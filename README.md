# use-fetch

`use-fetch` is a custom React hook library designed to simplify data fetching in your React applications. It provides two hooks: `useFetch` for single data fetches and `useFetchInfinite` for handling paginated or infinite scrolling data.

## Installation

To install the library, run:

```bash
npm install use-fetch
```

## Usage

### `useFetch`

The `useFetch` hook is used to fetch data from an API. It accepts a key (which is used to make the API call) and an options object for customization.

#### Example

```tsx
import React from "react";
import { useFetch } from "use-fetch";

const MyComponent = () => {
  const { data, error, refresh } = useFetch<MyDataType, MyErrorType>(
    "my-api-key",
    {
      onSuccess: (data) => console.log("Data fetched successfully:", data),
      onError: (error) => console.error("Error fetching data:", error),
      keepPreviousData: false,
    }
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>Data: {JSON.stringify(data)}</div>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
};
```

#### Parameters

- `key: Key | null`: The key to be used for the API call. When `null`, no API call is made.
- `option: Option<Data, Error>`: An optional object containing:
  - `onSuccess?: (data: Data) => void`: A callback function to be called when data is successfully fetched.
  - `onError?: (error: Error) => void`: A callback function to be called when an error occurs during fetching.
  - `keepPreviousData?: boolean`: If `true`, the previous data is kept until new data is fetched. Default is `true`.

#### Return Value

- `data: Data | null`: The fetched data, or `null` if not yet fetched.
- `error: Error | null`: The error encountered during fetching, or `null` if no error occurred.
- `refresh: () => void`: A function to refresh the data by triggering a re-fetch.

### `useFetchInfinite`

The `useFetchInfinite` hook is used for fetching paginated or infinite scrolling data. It requires a name, a key generator function, and an options object for customization.

#### Example

```tsx
import React from "react";
import { useFetchInfinite } from "use-fetch";

const MyInfiniteComponent = () => {
  const { data, error, size, setSize, isLoading } = useFetchInfinite<
    MyDataType,
    MyErrorType
  >("my-infinite-api", (page, data) => `my-api-key?page=${page}`, {
    defaultSize: 1,
    onSuccess: (data) => console.log("Data fetched successfully:", data),
    onError: (error) => console.error("Error fetching data:", error),
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {data.map((item, index) => (
        <div key={index}>{JSON.stringify(item)}</div>
      ))}
      {isLoading && <div>Loading...</div>}
      <button onClick={() => setSize(size + 1)}>Load More</button>
    </div>
  );
};
```

#### Parameters

- `name: string`: A unique name for the fetch operation to prevent conflicts.
- `getKey: (page: number, data: Data[]) => Key`: A function to generate the key for each page based on the page number and current data.
- `option: Omit<Option<Data[], Error>, "keepPreviousData"> & { defaultSize?: number }`: An optional object containing:
  - `onSuccess?: (data: Data[]) => void`: A callback function to be called when data is successfully fetched.
  - `onError?: (error: Error) => void`: A callback function to be called when an error occurs during fetching.
  - `defaultSize?: number`: The default number of pages to fetch. Default is `0`.

#### Return Value

- `data: Data[]`: The fetched data array.
- `error: Error | null`: The error encountered during fetching, or `null` if no error occurred.
- `size: number`: The current number of pages being fetched.
- `setSize: (size: number) => void`: A function to set the number of pages to fetch.
- `isLoading: boolean`: A boolean indicating if data is currently being loaded.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/your-repo/use-fetch).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
