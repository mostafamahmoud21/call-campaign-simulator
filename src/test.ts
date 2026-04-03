import { Campaign } from "./campaign";

class FakeClock {
  private currentTime = Date.now();

  now() {
    return this.currentTime;
  }

  setTimeout(callback: () => void, delay: number) {
    setTimeout(() => {
      this.currentTime += delay;
      callback();
    }, 0);
    return 0;
  }

  clearTimeout() {}
}

const fakeCallHandler = async (phone: string) => {
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

const interval = setInterval(() => {
  const status = campaign.getStatus();
  console.log("📊 Status:", status);

  if (status.state === "completed") {
    clearInterval(interval);
    console.log("🎉 Campaign Finished");
  }
}, 2000);