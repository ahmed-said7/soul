import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.user.dto';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
// import { ChangePasswordDto } from './dto/change-password.user.dto';
// import { IAuthUser } from 'src/common/types';
import { Request } from 'express';
// import { ApiService } from 'src/common/Api/api.service';
import { User, UserDocument } from './user.schema';
// import { QueryUserDto } from './dto/query.user.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { MailerService } from '../nodemailer/nodemailer.service';
import { UploadService } from '../upload/upload.service';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
    // private readonly apiService: ApiService<UserDocument, QueryUserDto>,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
  ) {}
  async createUser(body: CreateUserDto, file?: Express.Multer.File) {
    await this.validateUniqueEmail(body.email);
    if (file) {
      body.icon = await this.uploadService.uploadFile(file);
    }
    body.password = await bcrypt.hash(body.password, 10);
    const user = await this.userModel.create(body);
    const accessToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      this.configService.get('access_secret'),
      { expiresIn: '2d' },
    );
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      this.configService.get('refresh_secret'),
      { expiresIn: '7d' },
    );
    // consol
    // user.password = undefined;
    return { accessToken, user, refreshToken };
  }
  async getFcmToken(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return null;
    }
    return user.fcm;
  }
  async validateUniqueEmail(email: string) {
    const userExist = await this.userModel.findOne({ email });
    if (userExist) {
      throw new HttpException('email already exists', 400);
    }
  }
  // async changeLoggedUserPassword(body: ChangePasswordDto, IUser: IAuthUser) {
  //   const user = await this.userModel.findById(IUser._id);
  //   const valid = await bcrypt.compare(body.currentPassword, user.password);
  //   if (!valid) {
  //     throw new HttpException('current password is not valid', 400);
  //   }
  //   user.password = await bcrypt.hash(body.password, 10);
  //   user.passwordChangedAt = new Date();
  //   await user.save();
  //   return { user };
  // }
  async login(body: LoginDto) {
    const user = await this.userModel.findOne({ email: body.email });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      throw new BadRequestException('email or password is not correct');
    }
    const accessToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      this.configService.get('access_secret'),
      { expiresIn: '2d' },
    );
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      this.configService.get('refresh_secret'),
      { expiresIn: '7d' },
    );
    user.password = undefined;
    return { accessToken, user, refreshToken };
  }
  createHash(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }
  async sendChangingPasswordCode(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const code = this.mailerService.resetCode();
    const hash = this.createHash(code);
    user.passwordResetCode = hash;
    user.passwordResetCodeExpiresIn = new Date(Date.now() + 5 * 60 * 1000);
    try {
      await this.mailerService.sendChangingPasswordCode({
        code,
        mail: user.email,
        name: user.name || 'user',
      });
    } catch (e) {
      user.passwordResetCodeExpiresIn = undefined;
      user.passwordResetCode = undefined;
      await user.save();
      throw new BadRequestException('Failed to send code');
    }
    await user.save();
    return { message: 'code sent successfully' };
  }
  async validateCode(code: string, password: string) {
    const hash = this.createHash(code);
    const user = await this.userModel.findOne({
      passwordResetCode: hash,
      passwordResetCodeExpiresIn: {
        $gte: new Date(),
      },
    });
    if (!user) {
      throw new BadRequestException('code is invalid');
    }
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiresIn = undefined;
    user.password = await bcrypt.hash(password, 10);
    user.passwordChangedAt = new Date();
    await user.save();
    return { user };
  }
  async register(request: Request) {
    const firebaseUser = await this.firebaseService.checkFirebaseToken(request);
    if (!firebaseUser) {
      throw new HttpException('Invalid Firebase token', 401);
    }
    let user = await this.userModel.findOne({ uid: firebaseUser.uid });
    if (!user) {
      user = await this.userModel.create({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        provider: firebaseUser.provider,
      });
    }
    const accessToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      this.configService.get('access_secret'),
      { expiresIn: '2d' },
    );
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      this.configService.get('refresh_secret'),
      { expiresIn: '7d' },
    );
    user.password = undefined;
    return { accessToken, refreshToken, user };
  }
  // async getOneUser(userId: string) {
  //   const user = await this.userModel.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException('user not found');
  //   }
  //   return { user };
  // }
  // async getAllUsers(obj: QueryUserDto) {
  //   const { query, paginationObj } = await this.apiService.getAllDocs(
  //     this.userModel.find(),
  //     obj,
  //   );
  //   const users = await query;
  //   return { users, pagination: paginationObj };
  // }
  // async deleteUser(userId: string) {
  //   const user = await this.userModel.findByIdAndUpdate(userId, {
  //     isDeleted: true,
  //   });
  //   if (!user) {
  //     throw new NotFoundException('user not found');
  //   }
  //   return { status: 'user deleted' };
  // }
  async updateUser(
    userId: string,
    body: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    if (body.email) {
      await this.validateUniqueEmail(body.email);
    }
    if (file) {
      body.icon = await this.uploadService.uploadFile(file);
    }
    const user = await this.userModel.findByIdAndUpdate(userId, body, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return { user };
  }
}
