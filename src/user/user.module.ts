import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from 'src/nodemailer/nodemailer.module';
import { User, UserSchema } from 'src/user/user.schema';
import { UploadModule } from 'src/upload/upload.module';
import { ApiModule } from 'src/common/Api/api.module';
import { Query } from 'mongoose';
import { UserController } from './user.controller';
import { UserLoggedController } from './logged.controller';
import { UserService } from './user.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [UserController, UserLoggedController],
  providers: [UserService],
  imports: [
    UploadModule,
    MailerModule,
    FirebaseModule,
    ApiModule,
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: async () => {
          const schema = UserSchema;
          schema.pre<Query<any, any>>(/^find/, function () {
            if (!this.getOptions().skipFilter) {
              this.find({
                isDeleted: false,
              });
            }
          });
          return schema;
        },
      },
    ]),
  ],
  exports: [UserService],
})
export class UserModule {}
