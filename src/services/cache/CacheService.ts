import { createClient, RedisClientType } from "redis";

export default class CacheService {
  private readonly _client: RedisClientType;

  constructor() {
    this._client = createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on("error", (error) => {
      console.error(error);
    });

    this._client.connect();
  }

  set(key: string, value: string | number, expirationInSecond = 1800) {
    return this._client.set(key, value, { EX: expirationInSecond });
  }

  get(key: string): Promise<string | null> {
    return this._client.get(key);
  }

  delete(key: string): Promise<number> {
    return this._client.del(key);
  }
}
