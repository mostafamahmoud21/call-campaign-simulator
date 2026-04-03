import { Campaign } from "./campaign.js";
class FakeClock {
    constructor() {
        this.currentTime = Date.now();
    }
    now() {
        return this.currentTime;
    }
    setTimeout(callback, delay) {
        setTimeout(() => {
            this.currentTime += delay;
            callback();
        }, 0);
        return 0;
    }
    clearTimeout() { }
}
const fakeCallHandler = async (phone) => {
    console.log("📞 Calling:", phone);
    const success = Math.random() > 0.4;
    return {
        answered: success,
        durationMs: 1000 + Math.random() * 2000,
    };
};
const config = {
    customerList: ["0101", "0102", "0103", "0104", "0105"],
    startTime: "00:00",
    endTime: "23:59",
    maxConcurrentCalls: 2,
    maxDailyMinutes: 10,
    maxRetries: 2,
    retryDelayMs: 2000,
};
const campaign = new Campaign(config, fakeCallHandler, new FakeClock());
campaign.start();
setInterval(() => {
    console.log("📊 Status:", campaign.getStatus());
}, 2000);
