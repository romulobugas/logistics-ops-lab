import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto/login.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const result = await this.authService.login(loginDto, ip, userAgent);

    // Set HTTP-only cookie for better security
    res.cookie('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return result;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    res.clearCookie('auth-token');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    return {
      user: req.user,
      message: 'Current user profile',
    };
  }

  @Get('permissions')
  @UseGuards(AuthGuard)
  async getPermissions(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    const permissions = await this.authService.getUserPermissions(user.id);
    
    return {
      permissions,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}
