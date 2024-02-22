import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RateLimiterService } from './rate-limiter/rate-limiter.service';
import { User } from '../users/user.entity';
import { AuthResponse, UserPayload } from './types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private jwtService: JwtService,
		private rateLimiterService: RateLimiterService,
	) {}

	private generateJwtToken(user: UserPayload): string {
		const payload = { email: user.email, sub: user.id };
		return this.jwtService.sign(payload);
	}

	async login(
		{ email, password }: LoginDto,
		ip: string,
	): Promise<AuthResponse> {
		const canAttemptLogin = await this.rateLimiterService.checkRateLimit(ip);
		if (!canAttemptLogin) {
			throw new UnauthorizedException(
				'Too many login attempts. Please try again later.',
			);
		}

		const user = await this.usersRepository.findOne({ where: { email } });
		if (!user) {
			await this.rateLimiterService.incrementLoginAttempts(ip);
			throw new UnauthorizedException('Invalid credentials.');
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			await this.rateLimiterService.incrementLoginAttempts(ip);
			throw new UnauthorizedException('Invalid credentials.');
		}

		const token = this.generateJwtToken(user);

		// Reset rate limiter for successful login
		await this.rateLimiterService.resetLoginAttempts(ip);

		return { ok: true, token };
	}
}
