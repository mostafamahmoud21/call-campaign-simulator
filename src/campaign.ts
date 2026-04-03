import {
  ICampaign,
  CampaignConfig,
  CallHandler,
  IClock,
  CampaignStatus,
  CampaignState,
} from "./interfaces.js";

import { runScheduler } from "./scheduler";
import { handleRetry } from "./retry.manager";

export class Campaign implements ICampaign {
  private state: CampaignState = "idle";

  private queue: { phone: string; attempts: number }[] = [];
  private retryQueue: { phone: string; attempts: number }[] = [];

  private activeCalls = 0;
  private totalProcessed = 0;
  private totalFailed = 0;
  private pendingRetries = 0;
  private dailyMinutesUsed = 0;

  private lastResetDay: number = new Date().getDate();

  constructor(
    private config: CampaignConfig,
    private callHandler: CallHandler,
    public clock: IClock,
  ) {
    this.queue = config.customerList.map((phone) => ({
      phone,
      attempts: 0,
    }));
  }

  start(): void {
    this.state = "running";
    this.processQueue();
  }

  pause(): void {
    this.state = "paused";
  }

  resume(): void {
    if (this.state === "paused") {
      this.state = "running";
      this.processQueue();
    }
  }

  getStatus(): CampaignStatus {
    return {
      state: this.state,
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      activeCalls: this.activeCalls,
      pendingRetries: this.pendingRetries,
      dailyMinutesUsed: this.dailyMinutesUsed,
    };
  }

  private checkAndResetDailyUsage() {
    const now = new Date(this.clock.now());
    const currentDay = now.getDate();

    if (currentDay !== this.lastResetDay) {
      this.dailyMinutesUsed = 0;
      this.lastResetDay = currentDay;
    }
  }

  private handleRetry(phone: string, attempts: number) {
    handleRetry(
      phone,
      attempts,
      this.config.maxRetries,
      this.config.retryDelayMs,
      this.clock,
      (phone, attempts) => {
        this.retryQueue.push({ phone, attempts });
      },
      () => {
        this.totalFailed++;
      },
      () => this.pendingRetries++,
      () => this.pendingRetries--,
      () => this.state,
      () => this.processQueue(),
    );
  }

  private processQueue() {
    runScheduler(this);
  }
  private checkCompletion() {
    if (
      this.queue.length === 0 &&
      this.retryQueue.length === 0 &&
      this.activeCalls === 0 &&
      this.pendingRetries === 0
    ) {
      this.state = "completed";
    }
  }
}
