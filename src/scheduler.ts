import { isWithinWorkingHours, getDelayUntilNextStart } from "./time.utils";

export function runScheduler(ctx: any) {
  if (ctx.state !== "running") return;

  ctx.checkAndResetDailyUsage();

  if (
    !isWithinWorkingHours(
      ctx.clock.now(),
      ctx.config.startTime,
      ctx.config.endTime,
    )
  ) {
    const delay = getDelayUntilNextStart(
      ctx.clock.now(),
      ctx.config.startTime,
      ctx.config.endTime,
    );

    ctx.clock.setTimeout(() => {
      if (ctx.state === "running") {
        runScheduler(ctx);
      }
    }, delay);
    return;
  }

  while (
    ctx.activeCalls < ctx.config.maxConcurrentCalls &&
    (ctx.queue.length > 0 || ctx.retryQueue.length > 0) &&
    ctx.dailyMinutesUsed < ctx.config.maxDailyMinutes
  ) {
    const item = ctx.retryQueue.shift() || ctx.queue.shift();
    if (!item) return;

    const { phone, attempts } = item;

    ctx.activeCalls++;

    ctx
      .callHandler(phone)
      .then((result: any) => {
        if (result.answered) {
          ctx.totalProcessed++;
        } else {
          ctx.handleRetry(phone, attempts);
        }

        ctx.dailyMinutesUsed += result.durationMs / 60000;
      })
      .finally(() => {
        ctx.activeCalls--;

        ctx.checkCompletion();

        if (ctx.state === "running") {
          runScheduler(ctx);
        }
      });
  }
}
