import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { AuthResponse } from './types';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post()
	async login(
		@Body() loginDto: any,
		@Req() request: Request,
	): Promise<AuthResponse> {
		const ip = request.ip;

		const xForwardedFor = request.headers['x-forwarded-for'];
		const clientIp = Array.isArray(xForwardedFor)
			? xForwardedFor[0]
			: xForwardedFor?.split(',')[0].trim();

		return this.authService.login(loginDto, clientIp || ip);
	}
}
