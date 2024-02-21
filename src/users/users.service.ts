import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { VerifyUserDto } from './verify-user.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private emailService: EmailService,
	) {}

	private generateVerificationCode(): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 6; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return `${result.substring(0, 3)}-${result.substring(3, 6)}`;
	}

	async create(email: string, password: string): Promise<{ ok: boolean }> {
		try {
			const hashedPassword = await bcrypt.hash(password, 10);
			const verificationCode = this.generateVerificationCode();
			const newUser = this.usersRepository.create({
				email,
				password: hashedPassword,
				verificationCode,
			});
			await this.usersRepository.save(newUser);

			// Send verification email
			await this.emailService.sendVerificationEmail(email, verificationCode);

			return { ok: true }; // User created successfully
		} catch (error) {
			throw new InternalServerErrorException('Failed to create user', error);
		}
	}

	async verifyUser({ email, code }: VerifyUserDto): Promise<any> {
		const user = await this.usersRepository.findOne({ where: { email } });

		if (!user) throw new NotFoundException('User not found.');

		if (user.verificationCode === code) {
			user.isVerified = true;
			user.verificationCode = null; // Clear the code once verified
			await this.usersRepository.save(user);
			return { ok: true, message: 'User verified successfully.' };
		} else {
			return { ok: false, message: 'Verification code is incorrect.' };
		}
	}
}
