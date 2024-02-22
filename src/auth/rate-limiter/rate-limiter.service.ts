import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RateLimiterService {
	private redisClient: Redis;

	constructor() {
		this.redisClient = new Redis({
			host: process.env.REDIS_HOST,
			port: 6379, // Default Redis port
		});
	}

	async incrementLoginAttempts(ip: string): Promise<void> {
		const key = `login_attempts:${ip}`;
		const currentAttempts = await this.redisClient.incr(key);
		if (currentAttempts === 1) {
			await this.redisClient.expire(key, 3600); // Set expiry to 1 hour
		}
	}

	async checkRateLimit(ip: string): Promise<boolean> {
		const key = `login_attempts:${ip}`;
		const attempts = await this.redisClient.get(key);
		return attempts === null || parseInt(attempts, 10) < 5;
	}

	async resetLoginAttempts(ip: string): Promise<void> {
		const key = `login_attempts:${ip}`;
		await this.redisClient.del(key); // Deletes the key, effectively resetting the attempt count
	}
}
