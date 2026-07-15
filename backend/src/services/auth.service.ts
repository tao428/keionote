import prisma from '../prisma';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';

interface OTPStore {
  [email: string]: {
    otp: string;
    expires: number;
  };
}

// メモリ上のOTPストア (開発・デモ用としてはこれで十分)
const otpStorage: OTPStore = {};

export class AuthService {
  // OTPを要求する
  static async requestOTP(email: string): Promise<{ success: boolean; message: string }> {
    // @keio.jp 認証のバリデーション
    if (!email.endsWith('@keio.jp')) {
      throw new Error('Only @keio.jp email addresses are allowed');
    }

    // 6桁のOTP生成
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5分間有効

    otpStorage[email] = { otp, expires };

    // 開発用にコンソールに出力する
    console.log(`========================================`);
    console.log(`[OTP Request] Email: ${email}`);
    console.log(`[OTP Code]    ${otp} (Expires in 5 minutes)`);
    console.log(`========================================`);

    return {
      success: true,
      message: 'OTP has been sent to your email (For development, check console output)'
    };
  }

  // OTPを検証してログイン処理
  static async login(email: string, otp: string) {
    const record = otpStorage[email];

    if (!record) {
      throw new Error('No OTP requested for this email');
    }

    if (Date.now() > record.expires) {
      delete otpStorage[email];
      throw new Error('OTP has expired');
    }

    if (record.otp !== otp) {
      throw new Error('Invalid OTP code');
    }

    // 検証成功したためストアから削除
    delete otpStorage[email];

    // ユーザーが既に登録されているか確認、無ければ作成 (仮登録)
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // ニックネームの初期値をメールのローカルパートなどにする
      const nickname = email.split('@')[0];
      user = await prisma.user.create({
        data: {
          email,
          nickname: nickname || '慶應学生',
          faculty: '未設定',
          department: '未設定',
          grade: 1
        }
      });
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Refresh Tokenは本来DB等で管理するが、今回はシンプルにPrismaで更新
    // ユーザーモデル側を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  // トークンのリフレッシュ処理
  static async refresh(refreshToken: string) {
    const payload = generateAccessToken({ userId: '', email: '', role: 'USER' }); // 一時的なダミー
    // 実際の実装は、JWT検証関数を使用する
    return {
      accessToken: payload
    };
  }

  // プロフィール情報の更新
  static async updateProfile(userId: string, data: { nickname: string; faculty: string; department: string; grade: number }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        nickname: data.nickname,
        faculty: data.faculty,
        department: data.department,
        grade: Number(data.grade)
      }
    });
  }

  // デバッグ用: 現在の全有効OTPを取得 (フロントエンドのデバッグパネル用)
  static getActiveOTPs() {
    return Object.keys(otpStorage).reduce((acc, email) => {
      acc[email] = otpStorage[email].otp;
      return acc;
    }, {} as { [email: string]: string });
  }
}
