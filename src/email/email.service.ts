import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
	private transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: 587, // Ensure this is the correct port for your configuration
			secure: false, // True if port is 465, false for other ports like 587
			auth: {
				user: process.env.SMTP_USER, // Your username
				pass: process.env.SMTP_PASS, // Your password
			},
		});
	}

	async sendVerificationEmail(to: string, code: string) {
		const verificationUrl = `https://yourapplication.com/verify?token=${code}`; // Replace with your actual verification URL

		const message = {
			from: '"YOU, your social network" <you_social_network@you.com>', // Sender address
			to: to, // Recipient address
			subject: 'Verify Your Email Address', // Subject line
			text: `Hi,
		
		Thank you for registering with Your Social Network. To complete your registration, please verify your email address by clicking the link below:
		
		${verificationUrl}
		
		This link will expire in 60 minutes. Verifying your email address helps us ensure the security of your account.
		
		If you did not request this email, please ignore it or contact support if you believe this is an error.
		
		Thank you,
		The Your Social Network Team`, // Plain text body
			html: `<p>Hi,</p>
		<p>Thank you for registering with <b>Your Social Network</b>. To complete your registration, please verify your email address by clicking the link below:</p>
		<p><a href="${verificationUrl}" target="_blank">Verify Email Address</a></p>
		<p>This link will expire in 60 minutes. Verifying your email address helps us ensure the security of your account.</p>
		<p>If you did not request this email, please ignore it or contact support if you believe this is an error.</p>
		<p>Thank you,<br>
		The Your Social Network Team</p>`, // HTML body
		};

		// Send the email
		const info = await this.transporter.sendMail(message);
		console.log('Message sent: %s', info.messageId);
		// Preview only available when sending through an Ethereal account
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	}
}
