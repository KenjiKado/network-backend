import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
	private transporter;

	constructor(private configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get<string>('SMTP_HOST'),
			port: 587,
			secure: false,
			auth: {
				user: this.configService.get<string>('SMTP_USER'), // Your username
				pass: this.configService.get<string>('SMTP_PASS'), // Your password
			},
		});
	}

	async sendVerificationEmail(to: string, code: string) {
		const message = {
			from: '"YOU, your social network" <you_social_network@you.com>', // Sender address
			to: to, // Recipient address
			subject: 'Verify Your Email Address', // Subject line
			text: `Please use the following code to complete your registration: ${code}`, // Plain text body
			html: `<b>Please use the following code to complete your registration:</b> ${code}`, // HTML body
		};

		// Send the email
		const info = await this.transporter.sendMail(message);
		console.log('Message sent: %s', info.messageId);
		// Preview only available when sending through an Ethereal account
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	}
}
