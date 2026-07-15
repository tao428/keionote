import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Copy, Check } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // デバッグ用OTP保持用
  const [debugOTPs, setDebugOTPs] = useState<{ [email: string]: string }>({});
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // 開発環境のみ有効なOTPデバッグデータを取得
  const fetchDebugOTPs = async () => {
    try {
      const res = await fetch('/api/auth/debug/otps');
      if (res.ok) {
        const data = await res.json();
        setDebugOTPs(data.otps || {});
      }
    } catch (e) {
      // 本番などでは無視
    }
  };

  useEffect(() => {
    if (step === 2) {
      fetchDebugOTPs();
      const interval = setInterval(fetchDebugOTPs, 3000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email.endsWith('@keio.jp')) {
      setError('慶應義塾大学のメールアドレス（@keio.jp）のみ登録可能です。');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'OTPの送信に失敗しました。');
      }

      setMessage('認証コード（OTP）を送信しました。コンソールまたはデバッグパネルを確認してください。');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'ログインに失敗しました。');
      }

      onLoginSuccess(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyOTP = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setOtp(code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* 背景の光彩 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            KeioNote
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            慶應義塾大学内限定の教科書・ノート売買プラットフォーム
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                慶應メールアドレス (@keio.jp)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="taro.keio@keio.jp"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-100 placeholder-slate-600 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? '送信中...' : '認証コード（OTP）を送信'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ワンタイムパスワード (6桁)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest text-xl font-bold text-slate-100 placeholder-slate-600 transition"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-200 transition"
                onClick={() => setStep(1)}
              >
                ← メールアドレス入力に戻る
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? '照合中...' : 'ログイン'}
            </button>
          </form>
        )}

        {/* 開発時用OTP確認パネル */}
        {step === 2 && Object.keys(debugOTPs).length > 0 && (
          <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
            <div className="font-bold border-b border-amber-500/20 pb-1">
              🛠️ 開発用デバッグパネル (送信されたOTP)
            </div>
            {Object.entries(debugOTPs).map(([mail, code]) => (
              <div key={mail} className="flex justify-between items-center">
                <span className="truncate max-w-[180px]">{mail}</span>
                <button
                  onClick={() => copyOTP(code)}
                  className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-1 rounded text-[10px] font-mono transition"
                >
                  {copied && otp === code ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      {code}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
