// verify-user.dto.ts
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyUserDto {
	@IsEmail()
	email: string;

	@IsString()
	@Length(6, 6) // Code format is always 6 characters
	code: string;
}
