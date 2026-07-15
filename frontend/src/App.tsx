import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home } from './pages/Home';
import { Syllabus } from './pages/Syllabus';
import { ItemDetail } from './pages/ItemDetail';
import { ItemCreate } from './pages/ItemCreate';
import { TimetablePage } from './pages/TimetablePage';
import { MyPage } from './pages/MyPage';
import type { User } from './types';
import { GraduationCap, Calendar, PlusCircle, BookOpen, Bell } from 'lucide-react';

// ページ遷移アニメーションラッパー
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes: React.FC<{
  currentUser: User | null;
  onLogout: () => void;
  onProfileUpdate: (updatedUser: User) => void;
}> = ({ currentUser, onLogout, onProfileUpdate }) => {
  const location = useLocation();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!currentUser) {
      return <Navigate to="/" replace />;
    }
    return <PageWrapper>{children}</PageWrapper>;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/syllabus"
          element={
            <ProtectedRoute>
              <Syllabus />
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
                onLogout={onLogout}
                onProfileUpdate={onProfileUpdate}
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = async () => {
    const DEMO_MODE = true;

    if (DEMO_MODE) {
      setCurrentUser({
        id: 'demo-user',
        email: 'demo@keio.jp',
        nickname: 'Demo User',
        role: 'USER',
        faculty: '理工学部',
        department: '情報工学科',
        grade: 3,
        average_rating: 4.9,
        review_count: 8,
        transaction_count: 14
      });
      setAuthLoading(false);
      return;
    }

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-keio-navy"></div>
        <p className="mt-4 text-xs text-text-sub">KeioNote を読み込み中...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between bg-background text-text-main font-sans selection:bg-keio-navy/10 selection:text-keio-navy">
        {/* 固定ナビゲーションヘッダー */}
        <header className="sticky top-0 z-50 w-full glass-header backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* 左: ロゴ */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-keio-navy group">
                <div className="p-1.5 bg-keio-navy text-white rounded-lg group-hover:scale-105 transition-transform duration-300">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="hidden sm:inline">KeioNote</span>
              </Link>

              {/* 中央: メインメニュー */}
              {currentUser && (
                <nav className="hidden md:flex items-center gap-1">
                  <Link
                    to="/"
                    className="px-3.5 py-2 rounded-xl text-text-sub hover:text-keio-navy hover:bg-keio-navy/5 transition-all text-sm font-medium"
                  >
                    ホーム
                  </Link>
                  <Link
                    to="/syllabus"
                    className="px-3.5 py-2 rounded-xl text-text-sub hover:text-keio-navy hover:bg-keio-navy/5 transition-all text-sm font-medium"
                  >
                    シラバス検索
                  </Link>
                  <Link
                    to="/timetable"
                    className="px-3.5 py-2 rounded-xl text-text-sub hover:text-keio-navy hover:bg-keio-navy/5 transition-all text-sm font-medium"
                  >
                    時間割
                  </Link>
                  <Link
                    to="/items/new"
                    className="px-3.5 py-2 rounded-xl text-text-sub hover:text-keio-navy hover:bg-keio-navy/5 transition-all text-sm font-medium"
                  >
                    出品する
                  </Link>
                </nav>
              )}
            </div>

            {/* 右: 通知＆プロフィール */}
            {currentUser && (
              <div className="flex items-center gap-3">
                {/* モバイル用ナビゲーションリンク */}
                <div className="md:hidden flex items-center gap-0.5">
                  <Link to="/" className="p-2 text-text-sub hover:text-keio-navy rounded-xl">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </Link>
                  <Link to="/syllabus" className="p-2 text-text-sub hover:text-keio-navy rounded-xl">
                    <BookOpen className="h-4.5 w-4.5" />
                  </Link>
                  <Link to="/timetable" className="p-2 text-text-sub hover:text-keio-navy rounded-xl">
                    <Calendar className="h-4.5 w-4.5" />
                  </Link>
                  <Link to="/items/new" className="p-2 text-text-sub hover:text-keio-navy rounded-xl">
                    <PlusCircle className="h-4.5 w-4.5" />
                  </Link>
                </div>

                {/* 通知ベル (ダミー) */}
                <button className="p-2.5 text-text-sub hover:text-keio-navy hover:bg-keio-navy/5 rounded-xl transition relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-keio-red rounded-full"></span>
                </button>

                {/* プロフィールアイコン */}
                <Link
                  to="/mypage"
                  className="flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-xl border border-border-main bg-surface hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <div className="h-6 w-6 rounded-full bg-keio-navy text-white flex items-center justify-center text-xs font-semibold">
                    D
                  </div>
                  <span className="text-xs font-semibold text-text-main hidden sm:inline">
                    {currentUser.nickname}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow">
          <AnimatedRoutes
            currentUser={currentUser}
            onLogout={handleLogout}
            onProfileUpdate={handleProfileUpdate}
          />
        </main>

        {/* 落ち着いたNotion風のフッター */}
        <footer className="w-full py-8 text-center border-t border-border-main text-xs text-text-sub bg-surface">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 KeioNote. 慶應義塾大学内限定コミュニティ（デモ版公開中）</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-keio-navy transition">利用規約</a>
              <a href="#" className="hover:text-keio-navy transition">プライバシーポリシー</a>
              <a href="#" className="hover:text-keio-navy transition">お問い合わせ</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
