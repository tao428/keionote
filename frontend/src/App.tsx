import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ItemDetail } from './pages/ItemDetail';
import { ItemCreate } from './pages/ItemCreate';
import { TimetablePage } from './pages/TimetablePage';
import { MyPage } from './pages/MyPage';
import type { User } from './types';
import { GraduationCap, Calendar, PlusCircle, User as UserIcon, BookOpen, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ログイン状態（セッション）のチェック
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-xs text-slate-500">読み込み中...</p>
      </div>
    );
  }

  // 認証保護ルート（未ログインならLoginに強制遷移）
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between bg-radial-gradient">
        {/* ナビゲーションヘッダー */}
        <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* ロゴ */}
            <Link to="/" className="flex items-center gap-2 text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent group">
              <GraduationCap className="h-6 w-6 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              <span>KeioNote</span>
            </Link>

            {/* ナビゲーションメニュー */}
            {currentUser && (
              <nav className="flex items-center gap-1 md:gap-4">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all text-xs font-semibold"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">教材を探す</span>
                </Link>
                
                <Link
                  to="/timetable"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all text-xs font-semibold"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">時間割</span>
                </Link>

                <Link
                  to="/items/new"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all text-xs font-semibold"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">出品する</span>
                </Link>

                <Link
                  to="/mypage"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all text-xs font-semibold border border-white/5 bg-slate-900/20"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>{currentUser.nickname}</span>
                </Link>
              </nav>
            )}
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-grow">
          {currentUser && currentUser.faculty === '未設定' && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                まだ学部・学科情報が設定されていません。
                <Link to="/mypage" className="underline font-bold hover:text-amber-100">マイページからプロフィールの更新</Link>
                を行ってください。
              </span>
            </div>
          )}

          <Routes>
            <Route
              path="/login"
              element={currentUser ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/items/:id"
              element={
                <ProtectedRoute>
                  <ItemDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/items/new"
              element={
                <ProtectedRoute>
                  <ItemCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <TimetablePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mypage"
              element={
                <ProtectedRoute>
                  <MyPage
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onProfileUpdate={handleProfileUpdate}
                  />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* フッター */}
        <footer className="w-full py-6 text-center border-t border-white/5 text-[11px] text-slate-600 glass-panel">
          <p>© 2026 KeioNote. All rights reserved. 慶應義塾大学内限定コミュニティ</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
