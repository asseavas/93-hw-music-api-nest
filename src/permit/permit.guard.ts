import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserDocument } from '../schemas/user.schema';
import { Request } from 'express';

@Injectable()
export class PermitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserDocument;

    if (!user || !user.role) {
      return false;
    }

    const roles = ['admin'];
    return roles.includes(user.role);
  }
}
