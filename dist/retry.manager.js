export function handleRetry(phone, attempts, maxRetries, retryDelayMs, clock, onRetry, onFail, incrementPending, decrementPending, getState, trigger) {
    if (attempts < maxRetries) {
        incrementPending();
        clock.setTimeout(() => {
            onRetry(phone, attempts + 1);
            decrementPending();
            if (getState() === "running") {
                trigger();
            }
        }, retryDelayMs);
    }
    else {
        onFail();
    }
}
