import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { UniqueUserEmail } from '../validators/unique-user-email.validator';

export class RegisterUserDto {
  @IsEmail()
  @UniqueUserEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  displayName: string;

  @IsNotEmpty()
  username: string;

  @IsEnum(['user', 'admin'], { message: 'Role must be either user or admin' })
  role: string = 'user';
}
