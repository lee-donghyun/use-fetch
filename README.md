# use-fetch-2

`use-fetch-2` is a lightweight React library that provides custom hooks for fetching data with support for single requests and infinite scrolling. It includes two main hooks: `useFetch` for basic data fetching and `useFetchInfinite` for fetching data with pagination.Inspired by the interface of `SWR`, this library is designed to simplify data fetching in your React components, providing a clean and efficient way to manage data state and handle loading and error states.

## Installation

To install `use-fetch-2`, you can use npm:

```bash
npm install use-fetch-2
```

## Hooks

### `useFetch`

The `useFetch` hook is used to fetch data based on a key. It supports options for keeping previous data, handling success, and handling errors.

#### Usage

```typescript
import { useFetch } from "use-fetch-2";

const { data, error, refresh } = useFetch<DataType, ErrorType>(
  key,
  fetcher,
  options,
);
```

#### Parameters

- `key: string | null` - The key used to fetch data. If `null`, no data will be fetched.
- `fetcher: (key: string) => Promise<Data>` - The function that fetches data based on the key.
- `options: Option<Data, Error>` (optional) - Configuration options:
  - `keepPreviousData: boolean` (default: `true`) - Whether to keep the previous data while fetching new data.
  - `onSuccess?: (data: Data) => void` - Callback for handling successful data fetching.
  - `onError?: (error: Error) => void` - Callback for handling errors.

#### Returns

- `data: Data | null` - The fetched data or `null` if not available.
- `error: Error | null` - The error object or `null` if no error occurred.
- `refresh: () => void` - Function to manually refresh the data.

### Example

```typescript
import React from 'react';
import { useFetch } from 'use-fetch-2';

const fetchData = async (key: string) => {
  const response = await fetch(`https://api.example.com/data/${key}`);
  return response.json();
};

const MyComponent = () => {
  const { data, error, refresh } = useFetch<string, Error>(
    'my-key',
    fetchData
  );

  return (
    <div>
      {error && <p>Error: {error.message}</p>}
      {data ? <p>Data: {data}</p> : <p>Loading...</p>}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
};
```

### `useFetchInfinite`

The `useFetchInfinite` hook is used for fetching data with pagination, supporting infinite scrolling scenarios.

#### Usage

```typescript
import { useFetchInfinite } from "use-fetch-2";

const { data, error, reload, size, setSize } = useFetchInfinite<
  DataType,
  ErrorType
>(key, fetcher, options);
```

#### Parameters

- `key: Key` - The key used to fetch data. Can be a string or a function returning a string.
- `fetcher: (key: string, page: number, data: Data[]) => Promise<Data>` - The function that fetches data based on the key and page number.
- `options: Option<Data[], Error> & { defaultSize?: number }` (optional) - Configuration options:
  - `keepPreviousData: boolean` (default: `false`) - Whether to keep the previous data while fetching new data.
  - `onSuccess?: (data: Data[]) => void` - Callback for handling successful data fetching.
  - `onError?: (error: Error) => void` - Callback for handling errors.
  - `defaultSize?: number` (default: `0`) - The initial number of pages to fetch.

#### Returns

- `data: Data[]` - The fetched data.
- `error: Error | null` - The error object or `null` if no error occurred.
- `reload: (page?: number) => void` - Function to manually reload data. If `page` is provided, only that page will be reloaded.
- `size: number` - The current number of pages being fetched.
- `setSize: (size: number) => void` - Function to set the number of pages to fetch.

### Example

```typescript
import React from 'react';
import { useFetchInfinite } from 'use-fetch-2';

const fetchPageData = async (key: string, page: number) => {
  const response = await fetch(`https://api.example.com/data/${key}?page=${page}`);
  return response.json();
};

const InfiniteScrollComponent = () => {
  const { data, error, reload, size, setSize } = useFetchInfinite<string, Error>(
    'my-key',
    fetchPageData,
    { defaultSize: 1 }
  );

  const loadMore = () => setSize(size + 1);

  return (
    <div>
      {error && <p>Error: {error.message}</p>}
      {data.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
      <button onClick={loadMore}>Load More</button>
    </div>
  );
};
```

## Types

The `use-fetch-2` library uses the following types:

```typescript
export type Option<Data, Error> = {
  keepPreviousData?: boolean;
  onSuccess?: (data: Data) => void;
  onError?: (error: Error) => void;
};

export type Key = string | (() => string);
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
