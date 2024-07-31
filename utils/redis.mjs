import { createClient } from "redis";

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on("error", (err) => {
      console.error("Redis client error:", err);
    });

    this.client.connect().catch(console.error);
  }

  async isAlive() {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error("Redis connection error:", error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.set(key, value, {
        EX: duration,
      });
    } catch (error) {
      console.error(`Error setting key ${key} with value ${value}:`, error);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
