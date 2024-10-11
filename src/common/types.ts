import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export interface Payload {
  userId?: string;
  role?: string;
  iat?: number;
}
export interface IAuthUser {
  _id: string;
  role: string;
  fcm?: string;
  passwordChangedAt?: Date;
}
export class FindQuery {
  @ApiPropertyOptional({
    description: 'The page number for pagination',
    example: '1',
  })
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({
    description: 'The number of items to return per page',
    example: '10',
  })
  @IsOptional()
  limit?: string = '10';
}
