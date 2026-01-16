import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto/login.dto';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(loginDto: LoginDto, ip?: string, userAgent?: string): Promise<AuthResponseDto> {
    console.log('AuthService.login called for:', loginDto.email);
    const { email, password } = loginDto;

    const user = await (this.prisma as any).user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      await this.logAccess(null, 'LOGIN_FAILED', '/auth/login', 'POST', ip, userAgent, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      await this.logAccess(user.id, 'LOGIN_FAILED', '/auth/login', 'POST', ip, userAgent, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    const roles = user.userRoles.map((ur: any) => ur.role.name);

    await this.logAccess(user.id, 'LOGIN_SUCCESS', '/auth/login', 'POST', ip, userAgent, true);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
      roles,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password, firstName, lastName } = registerDto;

    const existingUser = await (this.prisma as any).user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await (this.prisma as any).user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Assign default role
    const defaultRole = await (this.prisma as any).role.findFirst({
      where: { name: 'USER' },
    });

    if (defaultRole) {
      await (this.prisma as any).userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
        },
      });
    }

    const token = this.generateToken(user);
    const roles = ['USER'];

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
      roles,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      // Simple token validation - in production, use JWT
      const payload = this.decodeToken(token);
      if (!payload) {
        return null;
      }

      const user = await (this.prisma as any).user.findUnique({
        where: { id: payload.userId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await (this.prisma as any).userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissions = userRoles.flatMap((ur: any) =>
      ur.role.rolePermissions.map((rp: any) => `${rp.permission.resource}:${rp.permission.action}`)
    );

    return [...new Set(permissions)] as string[];
  }

  async hasRoutePermission(userId: string, route: string, method: string): Promise<boolean> {
    const userRoles = await (this.prisma as any).userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });

    const roleNames = userRoles.map((ur: any) => ur.role.name);

    for (const roleName of roleNames) {
      const routePermission = await (this.prisma as any).routePermission.findFirst({
        where: {
          role: roleName,
          route,
          method,
          isActive: true,
        },
      });

      if (routePermission) {
        return true;
      }
    }

    return false;
  }

  private generateToken(user: any): string {
    // Simple token generation - in production, use JWT
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private decodeToken(token: string): any {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async logAccess(
    userId: string | null,
    action: string,
    resource: string,
    method: string,
    ip?: string,
    userAgent?: string,
    success: boolean = true
  ): Promise<void> {
    try {
      await (this.prisma as any).accessLog.create({
        data: {
          userId,
          action,
          resource,
          method,
          ip,
          userAgent,
          success,
        },
      });
    } catch (error) {
      // Log errors without throwing to avoid breaking auth flow
      console.error('Failed to log access:', error);
    }
  }
}
