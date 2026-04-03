export function handleRetry(
  phone: string,
  attempts: number,
  maxRetries: number,
  retryDelayMs: number,
  clock: any,
  onRetry: (phone: string, attempts: number) => void,
  onFail: () => void,
  incrementPending: () => void,
  decrementPending: () => void,
  getState: () => string,
  trigger: () => void
) {
  if (attempts < maxRetries) {
    incrementPending();

    clock.setTimeout(() => {
      onRetry(phone, attempts + 1);
      decrementPending();

      if (getState() === "running") {
        trigger();
      }
    }, retryDelayMs);
  } else {
    onFail();
  }
}