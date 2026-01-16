import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const route = request.route?.path || request.path;
    const method = request.method;

    // Check if user has permission for this route
    const hasPermission = await this.authService.hasRoutePermission(user.id, route, method);

    if (!hasPermission) {
      // Log access denied
      await this.logAccessDenied(user.id, route, method, request.ip, request.get('User-Agent'));
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private async logAccessDenied(
    userId: string,
    route: string,
    method: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // This would use the same logging method as AuthService
      console.log(`Access denied: User ${userId} attempted to ${method} ${route}`);
    } catch (error) {
      console.error('Failed to log access denied:', error);
    }
  }
}
