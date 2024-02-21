import { Controller, Post, Body } from '@nestjs/common';

import { UsersService } from './users.service';
import { VerifyUserDto } from './verify-user.dto';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Post()
	async create(@Body() createUserDto: { email: string; password: string }) {
		return this.usersService.create(
			createUserDto.email,
			createUserDto.password,
		);
	}

	@Post('verify')
	async verifyUser(@Body() verificationDto: VerifyUserDto): Promise<any> {
		return this.usersService.verifyUser(verificationDto);
	}
}
