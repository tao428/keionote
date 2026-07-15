import React, { useState, useEffect } from 'react';
import type { User, Item } from '../types';
import { User as UserIcon, BookOpen, Settings, LogOut, Trash2 } from 'lucide-react';

interface MyPageProps {
  currentUser: User | null;
  onLogout: () => void;
  onProfileUpdate: (updatedUser: User) => void;
}

export const MyPage: React.FC<MyPageProps> = ({ currentUser, onLogout, onProfileUpdate }) => {
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  
  // プロフィール編集モード用
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [faculty, setFaculty] = useState(currentUser?.faculty || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [grade, setGrade] = useState(currentUser?.grade || 1);
  const [updating, setUpdating] = useState(false);

  const fetchMyItems = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/items?sellerId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, faculty, department, grade })
      });
      if (res.ok) {
        const data = await res.json();
        onProfileUpdate(data.user);
        setIsEditing(false);
        alert('プロフィールを更新しました。');
      } else {
        const data = await res.json();
        alert(data.error || 'プロフィールの更新に失敗しました。');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  // 商品のステータス更新 (公開/取引中/売り切れ)
  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchMyItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 商品の削除
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('この出品を削除しますか？')) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMyItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) {
    return <div className="text-center py-12">ログインしてください。</div>;
  }

  // ステータス日本語
  const getStatusLabel = (stat: string) => {
    switch (stat) {
      case 'AVAILABLE': return '出品中';
      case 'RESERVED': return '取り置き中';
      case 'SOLD': return '売却済';
      default: return stat;
    }
  };

  return (
    <div className="space-y-8">
      {/* ユーザープロフィール概要 */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-slate-300">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-black text-slate-100">{currentUser.nickname}</h2>
                {currentUser.average_rating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    ★ {currentUser.average_rating.toFixed(1)} ({currentUser.review_count}評価)
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-1">{currentUser.email}</p>
              <p className="text-slate-300 text-xs mt-1.5 font-medium">
                {currentUser.faculty} {currentUser.department} ({currentUser.grade}年)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition"
            >
              <Settings className="h-4 w-4" />
              プロフィール編集
            </button>
            {currentUser.id !== 'demo-user' && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/15 px-4 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </button>
            )}
          </div>
        </div>

        {/* プロフィール編集フォーム */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-8 pt-6 border-t border-white/5 space-y-4 max-w-md relative z-10">
            <h3 className="font-bold text-sm text-slate-300">プロフィールの編集</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ニックネーム</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-100 text-xs"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">学年</label>
                <select
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-100 text-xs"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                >
                  {[1, 2, 3, 4].map(g => (
                    <option key={g} value={g} className="bg-slate-900">{g}年</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">所属学部</label>
                <input
                  type="text"
                  required
                  placeholder="例: 理工学部"
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-100 text-xs"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">学科</label>
                <input
                  type="text"
                  required
                  placeholder="例: 情報工学科"
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-100 text-xs"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updating}
                className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
              >
                {updating ? '保存中...' : '変更を保存'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 出品した商品一覧 */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          あなたの出品した教材 ({myItems.length})
        </h3>

        {loadingItems ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel h-24 rounded-2xl animate-pulse"></div>
            <div className="glass-panel h-24 rounded-2xl animate-pulse"></div>
          </div>
        ) : myItems.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-white/5">
            <p className="text-slate-500 text-sm">まだ商品を出品していません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-16 w-16 bg-slate-950 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={item.images && item.images.length > 0 ? item.images[0].imageUrl : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-100 text-sm truncate">{item.title}</h4>
                    <p className="text-blue-400 text-xs font-black mt-1">¥{item.price.toLocaleString()}</p>
                    <p className="text-slate-500 text-[10px] mt-1 truncate">
                      {item.textbook?.lecture?.name} • 状態: {getStatusLabel(item.status)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    className="px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300"
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  >
                    <option value="AVAILABLE" className="bg-slate-900">出品中</option>
                    <option value="RESERVED" className="bg-slate-900">取り置き中</option>
                    <option value="SOLD" className="bg-slate-900">売却済</option>
                  </select>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/15 text-red-400 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
