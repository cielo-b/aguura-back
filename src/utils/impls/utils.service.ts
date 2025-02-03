import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilsAbstractService } from '../utils.abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ECreationAction } from 'src/common/enums/creation-actions.enum';
import { TransactionService } from 'src/transaction/transaction.service';
import * as nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';

@Injectable()
export class UtilsService implements UtilsAbstractService {
  private readonly smtpTransport: nodemailer.Transporter<
    SMTPPool.SentMessageInfo,
    SMTPPool.Options
  >;
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly transactionService: TransactionService,
  ) {
    this.smtpTransport = nodemailer.createTransport({
      service: 'smtp.zoho.com',
      auth: { user: process.env.SMTP_EMAIL, pass: "process.env.SMTP_PASSWORD" },
      host: 'smtp.zoho.com',
      secure: true,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      tls: { rejectUnauthorized: true },
    });
  }

  isEmailUnique = async (email: string): Promise<boolean> => {
    const transaction = await this.transactionService.startTransaction();
    const user: User = await transaction.userRepository.findOne({
      where: { email },
    });
    if (user) return false;
    return true;
  };

  isPhoneNumberUnique = async (phone: string): Promise<boolean> => {
    const transaction = await this.transactionService.startTransaction();
    const user: User = await transaction.userRepository.findOne({
      where: { phoneNumber: phone },
    });

    if (user) return false;
    return true;
  };

  async validatePasswordWithConfirmPassword(
    password: string,
    confirmPassword: string,
  ): Promise<boolean> {
    return password === confirmPassword;
  }

  validateKey = async (
    key: string,
    action: ECreationAction,
  ): Promise<boolean> => {
    let res: boolean;
    switch (action) {
      case ECreationAction.CREATE_ADMIN: {
        res = String(process.env.CREATE_ADMIN_KEY) === String(key);
        break;
      }

      case ECreationAction.CREATE_DISTRIBUTOR: {
        res = String(process.env.CREATE_DISTRIBUTOR_KEY) === String(key);
        break;
      }

      case ECreationAction.CREATE_PRODUCER: {
        res = String(process.env.CREATE_PRODUCER_KEY) === String(key);
        break;
      }

      case ECreationAction.CREATE_SUPER_ADMIN: {
        res = String(process.env.CREATE_SUPER_ADMIN_KEY) === String(key);
        break;
      }

      default:
        throw new BadRequestException(`Key action provided ${action} invalid.`);
    }

    return res;
  };

  async findOneByEmailOrPhone(
    email?: string,
    phone?: string,
    transaction?: any,
  ): Promise<User | null> {
    const user = await transaction.userRepository.findOne({
      where: [{ email }, { phoneNumber: phone }],
      relations: ['role', 'otps'],
    });
    return user;
  }

  async isPasswordValid(
    password: string,
    dbPassword: string,
  ): Promise<boolean> {
    console.log(await bcrypt.compare(password, dbPassword));
    return await bcrypt.compare(password, dbPassword);
  }

  async generateOtp(): Promise<string> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
  }

  async verifyOtp(otp: string, dbOtp: string): Promise<boolean> {
    return await bcrypt.compare(otp, dbOtp);
  }

  sendEmail = async (
    email: string,
    html: any,
    subject: string,
  ): Promise<void> => {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject,
      html,
    };
    await this.smtpTransport.sendMail(mailOptions);
  };

  VerifyAccountTemplate = async (
    email: string,
    otp: string,
    subject: string,
  ): Promise<void> => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              color: #333;
            }
            .otp {
              font-size: 24px;
              font-weight: bold;
              color: #ff5733;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #888;
            }
            a {
              color: #1a73e8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Verification</h1>
              <p>We received a request to verify your email address. Please use the OTP below to verify your account.</p>
            </div>
  
            <div class="otp">
              OTP: <strong>${otp}</strong>
            </div>
  
            <p>If you did not request this verification, please ignore this email.</p>
  
            <div class="footer">
              <p>Thank you for using our service!</p>
              <p>&copy; 2025 Your Company Name</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject,
      html,
    };

    // Send the email
    await this.smtpTransport.sendMail(mailOptions);
  };
}
