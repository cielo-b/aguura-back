import { JwtPayload } from './interfaces/jwt-payload.interface';

export abstract class JwtAbstractService {
  abstract sign(payload: JwtPayload): Promise<string>;
  abstract verify(token: string): Promise<JwtPayload>;
}
