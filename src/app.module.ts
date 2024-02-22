import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { RateLimiterService } from './auth/rate-limiter/rate-limiter.service';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET_KEY,
			signOptions: { expiresIn: '60m' },
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: true, // Be cautious with this in a production environment
		}),

		UsersModule,
		EmailModule,
		AuthModule,
	],
	providers: [RateLimiterService],
})
export class AppModule {}
