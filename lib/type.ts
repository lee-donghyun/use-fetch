export type Key = string;

export type Uri = [string];

export interface Option<Data, Error> {
  onSuccess?: (data: Data) => void;
  onError?: (error: Error) => void;
  keepPreviousData?: boolean;
}
