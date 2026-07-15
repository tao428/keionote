import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { accessCookieOptions, refreshCookieOptions, verifyRefreshToken, generateAccessToken, TokenPayload } from '../utils/jwt';
import prisma from '../prisma';

export class AuthController {
  static async requestOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const result = await AuthService.requestOTP(email);
      return res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
      }
      const { user, accessToken, refreshToken } = await AuthService.login(email, otp);

      // httpOnly Cookie にセット
      res.cookie('accessToken', accessToken, accessCookieOptions);
      res.cookie('refreshToken', refreshToken, refreshCookieOptions);

      return res.status(200).json({
        message: 'Login successful',
        user
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const payload = verifyRefreshToken(refreshToken);
      const newPayload: TokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };

      const accessToken = generateAccessToken(newPayload);
      res.cookie('accessToken', accessToken, accessCookieOptions);

      return res.status(200).json({ message: 'Token refreshed' });
    } catch (error: any) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('accessToken', accessCookieOptions);
      res.clearCookie('refreshToken', refreshCookieOptions);
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // データベースから最新のユーザー情報を取得して返す
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });
      
      return res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { nickname, faculty, department, grade } = req.body;
      if (!nickname || !faculty || !department || !grade) {
        return res.status(400).json({ error: 'Missing required profile fields' });
      }

      const user = await AuthService.updateProfile(userId, {
        nickname,
        faculty,
        department,
        grade: Number(grade)
      });

      return res.status(200).json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  // デバッグ用: 現在のアクティブなOTPコードを取得
  static async getDebugOTPs(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }
    const otps = AuthService.getActiveOTPs();
    return res.status(200).json({ otps });
  }
}
