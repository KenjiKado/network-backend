// src/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
	@IsEmail({}, { message: 'Invalid email address' })
	email: string;

	@IsString({ message: 'Password must be a string' })
	@MinLength(10, { message: 'Password must be at least 10 characters long' })
	password: string;
}
