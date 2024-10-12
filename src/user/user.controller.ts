import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ValidateOtpCode } from './dto/otp-code.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { Request } from 'express';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.user.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.userService.login(body);
  }
  @Post('signup')
  @UseInterceptors(FileInterceptor('icon'))
  createUser(
    @Body() body: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.createUser(body, file);
  }
  @Post('firebase')
  @UseInterceptors(FileInterceptor('icon'))
  register(@Req() req: Request) {
    return this.userService.register(req);
  }
  @Post('forget-password')
  sendChangingPasswordCode(@Body() body: ForgetPasswordDto) {
    return this.userService.sendChangingPasswordCode(body.email);
  }
  @Post('validate-code')
  validatePasswordCode(@Body() body: ValidateOtpCode) {
    return this.userService.validateCode(body.code, body.password);
  }
}
