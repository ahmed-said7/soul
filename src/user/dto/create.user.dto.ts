import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender } from '../../common/enum';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
  icon: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fcm?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Gender)
  gender?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthdate?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;
}
