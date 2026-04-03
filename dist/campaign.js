import { runScheduler } from "./scheduler.js";
import { handleRetry } from "./retry.manager.js";
export class Campaign {
    constructor(config, callHandler, clock) {
        this.config = config;
        this.callHandler = callHandler;
        this.clock = clock;
        this.state = "idle";
        this.queue = [];
        this.retryQueue = [];
        this.activeCalls = 0;
        this.totalProcessed = 0;
        this.totalFailed = 0;
        this.pendingRetries = 0;
        this.dailyMinutesUsed = 0;
        this.lastResetDay = new Date().getDate();
        this.queue = config.customerList.map((phone) => ({
            phone,
            attempts: 0,
        }));
    }
    start() {
        this.state = "running";
        this.processQueue();
    }
    pause() {
        this.state = "paused";
    }
    resume() {
        if (this.state === "paused") {
            this.state = "running";
            this.processQueue();
        }
    }
    getStatus() {
        return {
            state: this.state,
            totalProcessed: this.totalProcessed,
            totalFailed: this.totalFailed,
            activeCalls: this.activeCalls,
            pendingRetries: this.pendingRetries,
            dailyMinutesUsed: this.dailyMinutesUsed,
        };
    }
    checkAndResetDailyUsage() {
        const now = new Date(this.clock.now());
        const currentDay = now.getDate();
        if (currentDay !== this.lastResetDay) {
            this.dailyMinutesUsed = 0;
            this.lastResetDay = currentDay;
        }
    }
    handleRetry(phone, attempts) {
        handleRetry(phone, attempts, this.config.maxRetries, this.config.retryDelayMs, this.clock, (phone, attempts) => {
            this.retryQueue.push({ phone, attempts });
        }, () => {
            this.totalFailed++;
        }, () => this.pendingRetries++, () => this.pendingRetries--, () => this.state, () => this.processQueue());
    }
    processQueue() {
        runScheduler(this);
    }
    checkCompletion() {
        if (this.queue.length === 0 &&
            this.retryQueue.length === 0 &&
            this.activeCalls === 0 &&
            this.pendingRetries === 0) {
            this.state = "completed";
        }
    }
}
