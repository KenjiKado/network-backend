import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { RateLimiterService } from './rate-limiter/rate-limiter.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [AuthService, RateLimiterService],
	controllers: [AuthController],
})
export class AuthModule {}
