import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secretKey = process.env.JWT_SECRET || 'mysecret';

  // Sign a token
  async sign(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, this.secretKey, { expiresIn: '1d' });
  }

  // Verify a token
  async verify(token: string): Promise<JwtPayload> {
    try {
      return jwt.verify(token, this.secretKey) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
