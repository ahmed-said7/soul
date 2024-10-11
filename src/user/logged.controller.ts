import {
  Body,
  Controller,
  // Delete,
  // Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../common/decorator/roles';
import { All_Role } from '../common/enum';
import { IAuthUser } from '../common/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update.user.dto';
// import { ChangePasswordDto } from './dto/change-password.user.dto';
import { AuthUser } from '../common/decorator/user.decorator';
import { AuthenticationGuard } from '../common/guards/authentication.guard';
import { AuthorizationGuard } from '../common/guards/authorization.guard';

@Controller('user/profile')
export class UserLoggedController {
  constructor(private userService: UserService) {}
  // @Get()
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  // @Roles(All_Role.User)
  // getLoggedUser(@AuthUser() user: IAuthUser) {
  //   return this.userService.getOneUser(user._id);
  // }
  @Patch()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(All_Role.User)
  @UseInterceptors(FileInterceptor('icon'))
  updateLoggedUser(
    @AuthUser() user: IAuthUser,
    @Body() body: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateUser(user._id, body, file);
  }
  // @Delete()
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  // @Roles(All_Role.User)
  // deleteLoggedUser(@AuthUser() user: IAuthUser) {
  //   return this.userService.deleteUser(user._id);
  // }
  // @Patch('pass')
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  // @Roles(All_Role.User)
  // updateLoggedAdminPassword(
  //   @AuthUser() user: IAuthUser,
  //   @Body() body: ChangePasswordDto,
  // ) {
  //   return this.userService.changeLoggedUserPassword(body, user);
  // }
}
