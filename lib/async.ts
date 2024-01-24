export type AsyncNotStarted = { status: 'NOT_STARTED' };
export type AsyncLoading = { status: 'LOADING' };
export type AsyncLoaded<V> = { status: 'LOADED'; value: V };
export type AsyncFailedLoading = { status: 'FAILED_LOADING'; error: Error };

export type AsyncValue<V> =
  | AsyncNotStarted
  | AsyncLoading
  | AsyncLoaded<V>
  | AsyncFailedLoading;

export function asyncNotStarted(): AsyncNotStarted {
  return { status: 'NOT_STARTED' };
}

export function asyncLoading(): AsyncLoading {
  return { status: 'LOADING' };
}

export function asyncLoaded<V>(value: V): AsyncLoaded<V> {
  return { status: 'LOADED', value };
}

export function asyncFailedLoading(error: Error): AsyncFailedLoading {
  return { status: 'FAILED_LOADING', error };
}

export function isNotStarted(value: AsyncValue<any>): value is AsyncNotStarted {
  return value.status === 'NOT_STARTED';
}

export function isLoading(value: AsyncValue<any>): value is AsyncLoading {
  return value.status === 'LOADING';
}

export function isLoaded<V>(value: AsyncValue<any>): value is AsyncLoaded<V> {
  return value.status === 'LOADED';
}

export function isFailedLoading(
  value: AsyncValue<any>
): value is AsyncFailedLoading {
  return value.status === 'FAILED_LOADING';
}

export function getAsyncLoadedValue<V>(value: AsyncValue<V>): V | undefined {
  return isLoaded(value) ? value.value : undefined;
}
