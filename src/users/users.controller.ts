import { Controller, Post, Body } from '@nestjs/common';

import { UsersService } from './users.service';
import { VerifyUserDto } from './dto/verify-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Post('create')
	async create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Post('verify')
	async verifyUser(@Body() verificationDto: VerifyUserDto) {
		return this.usersService.verifyUser(verificationDto);
	}
}
