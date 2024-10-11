import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payload } from '../types';
import { User, UserDocument } from '../../user/user.schema';
import { Request } from 'express';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<UserDocument>,
    protected config: ConfigService,
  ) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    return this.extractToken(request);
  }
  async extractToken(request: any) {
    let token: string = request.headers.authorization;
    if (!token || !token.startsWith('Bearer')) {
      throw new UnauthorizedException('Authorization header is missing');
    }
    token = token.split(' ')[1];
    const { userId, role } = await this.decode(
      token,
      this.config.get('access_secret'),
    );
    request.user = {
      _id: userId,
      role,
    };
    return true;
  }
  async decode(token: string, secret: string) {
    let payload: Payload;
    try {
      payload = jwt.verify(token, secret) as Payload;
    } catch (e) {
      throw new UnauthorizedException('invalid token');
    }
    return {
      userId: payload.userId,
      role: payload.role,
    };
  }
}
