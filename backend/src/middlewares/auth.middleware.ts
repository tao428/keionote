import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import prisma from '../prisma';

// ExpressのRequestインターフェースを拡張
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// デモモードフラグ (将来OTPに戻す場合はここを false に設定します)
const DEMO_MODE = true;

// デモユーザーがDBに存在することを確認・作成する関数
async function ensureDemoUser() {
  try {
    await prisma.user.upsert({
      where: { id: 'demo-user' },
      update: {},
      create: {
        id: 'demo-user',
        email: 'demo@keio.jp',
        nickname: 'Demo User',
        role: 'USER',
        faculty: '理工学部',
        department: '情報工学科',
        grade: 3,
      }
    });
  } catch (err) {
    console.error('Failed to ensure demo user in DB:', err);
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  if (DEMO_MODE) {
    await ensureDemoUser();
    req.user = {
      userId: 'demo-user',
      email: 'demo@keio.jp',
      role: 'USER'
    };
    return next();
  }

  /* --- 将来戻せるよう、元のOTP認証ロジックを保持 --- */
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (DEMO_MODE) {
    // デモモード時は管理者権限を一時的に許可、または制限なしにする
    return next();
  }
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
