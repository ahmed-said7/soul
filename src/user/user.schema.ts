import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender, User_Role } from 'src/common/enum';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    trim: true,
  })
  name: string;

  @Prop({ type: String })
  passwordResetCode: string;

  @Prop({ type: String, trim: true })
  provider: string;

  @Prop({ type: String, trim: true })
  uid: string;

  @Prop({ type: Date })
  passwordResetCodeExpiresIn: Date;

  @Prop({ type: Date })
  passwordChangedAt: Date;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: User_Role.User, enum: User_Role })
  role: string;

  @Prop({ type: String })
  icon: string;

  @Prop({
    type: String,
    trim: true,
  })
  fcm: string;

  @Prop({ type: String, enum: Gender })
  gender?: string;

  @Prop({ type: Date })
  birthdate?: string;

  @Prop({ type: String })
  country?: string;

  @Prop({ type: String })
  mobile?: string;
}
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
