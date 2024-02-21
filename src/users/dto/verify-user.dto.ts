// verify-user.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class VerifyUserDto {
	@IsEmail({}, { message: 'Invalid email address' })
	email: string;

	@IsString()
	token: string;
}
