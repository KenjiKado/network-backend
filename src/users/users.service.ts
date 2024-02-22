import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { User } from './user.entity';
import { VerifyUserDto } from './dto/verify-user.dto';
import { CreationUserResponse, VerificationUserResponse } from './types';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private emailService: EmailService,
		private jwtService: JwtService,
	) {}

	async create({
		email,
		password,
	}: CreateUserDto): Promise<CreationUserResponse> {
		try {
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = this.usersRepository.create({
				email,
				password: hashedPassword,
			});
			const verificationToken = this.jwtService.sign(
				{ email: newUser.email, id: newUser.id },
				{ expiresIn: '1h' }, // Token expires in 1 hour
			);

			await this.usersRepository.save(newUser);

			// Send verification email
			await this.emailService.sendVerificationEmail(email, verificationToken);

			return { ok: true }; // User created successfully
		} catch (error) {
			if (error.code === '23505') {
				// '23505' is the PostgreSQL error code for unique violation
				throw new BadRequestException({
					statusCode: 400,
					message: 'Email already exists',
				});
			}
			throw new InternalServerErrorException('Failed to create user', error);
		}
	}

	async verifyUser({
		email,
		token,
	}: VerifyUserDto): Promise<VerificationUserResponse> {
		try {
			const decoded = this.jwtService.verify(token, {
				secret: process.env.JWT_SECRET_KEY,
			});

			if (decoded.email !== email) {
				return {
					ok: false,
					message: 'Verification failed. Email does not match.',
				};
			}

			const user = await this.usersRepository.findOne({ where: { email } });

			if (!user) throw new NotFoundException('User not found.');
			if (user.isVerified)
				return { ok: false, message: 'User is already verified.' };

			user.isVerified = true;
			await this.usersRepository.save(user);

			return { ok: true, message: 'User verified successfully.' };
		} catch (error) {
			switch (error.name) {
				case 'TokenExpiredError':
					return { ok: false, message: 'Verification link has expired.' };
				case 'JsonWebTokenError':
				case 'NotBeforeError':
					return { ok: false, message: 'Invalid verification link.' };
				default:
					return { ok: false, message: 'Verification failed.' };
			}
		}
	}

	async login({ email, password }: CreateUserDto) {
		try {
			const user = await this.usersRepository.findOne({ where: { email } });

			// If user does not exist, return an error message
			if (!user) {
				return { ok: false, message: 'Invalid email or password.' };
			}

			// Compare the provided password with the hashed password in the database
			const isMatch = await bcrypt.compare(password, user.password);

			// If the passwords do not match, return an error message
			if (!isMatch) {
				return { ok: false, message: 'Invalid password.' };
			}

			// If passwords match, generate a JWT token for the user
			const token = this.jwtService.sign({ id: user.id, email: user.email });

			// Return success response with the token
			return { ok: true, message: 'Login successful.', token };
		} catch (error) {
			return {
				ok: false,
				message: 'An error occurred during the login process.',
			};
		}
	}
}
