import React, { useState, useEffect } from 'react';
import type { User, Item } from '../types';
import { BookOpen, Trash2, CheckCircle2, Bookmark, Heart } from 'lucide-react';

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
    return <div className="text-center py-12 text-text-sub">ログインしてください。</div>;
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

  // ダッシュボード用集計
  const totalListings = myItems.length;
  const soldListings = myItems.filter(item => item.status === 'SOLD').length;
  const totalFavorites = myItems.reduce((acc, item) => acc + (item.favoriteCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* ユーザープロフィール概要 */}
      <div className="card-premium p-8 bg-surface relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-keio-navy/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="h-16 w-16 rounded-full bg-keio-navy text-white flex items-center justify-center text-xl font-bold shadow-sm">
              {currentUser.nickname.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-xl font-bold text-text-main">{currentUser.nickname}</h2>
                <span className="text-[10px] font-bold text-keio-navy bg-keio-navy/5 px-2 py-0.5 rounded border border-keio-navy/10">
                  慶應生認証済
                </span>
              </div>
              <p className="text-text-sub text-xs mt-1">{currentUser.email}</p>
              <p className="text-text-main text-xs mt-1.5 font-semibold">
                {currentUser.faculty} {currentUser.department} ({currentUser.grade}年)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-surface border border-border-main text-text-main text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              プロフィール編集
            </button>
            {currentUser.id !== 'demo-user' && (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-red-600/5 border border-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-600/10 transition"
              >
                ログアウト
              </button>
            )}
          </div>
        </div>

        {/* プロフィール編集フォーム */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-8 pt-6 border-t border-border-main/50 space-y-4 max-w-md relative z-10 text-xs">
            <h3 className="font-bold text-text-main">プロフィールの編集</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-text-sub mb-2">ニックネーム</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-text-sub mb-2">学年</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>{g}年</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-text-sub mb-2">所属学部</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-text-sub mb-2">学科</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={updating}
                className="py-2 px-4 rounded-lg bg-keio-navy text-white font-bold transition disabled:opacity-50"
              >
                {updating ? '保存中...' : '変更を保存'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 rounded-lg bg-slate-100 text-text-sub hover:bg-slate-200 transition"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ダッシュボードカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-premium p-5 bg-surface text-center">
          <BookOpen className="h-5 w-5 text-keio-navy mx-auto" />
          <div className="text-[10px] text-text-sub font-bold mt-2 uppercase tracking-wide">総出品数</div>
          <div className="text-xl font-extrabold text-text-main mt-1">{totalListings}</div>
        </div>
        <div className="card-premium p-5 bg-surface text-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
          <div className="text-[10px] text-text-sub font-bold mt-2 uppercase tracking-wide">売却済</div>
          <div className="text-xl font-extrabold text-text-main mt-1">{soldListings}</div>
        </div>
        <div className="card-premium p-5 bg-surface text-center">
          <Heart className="h-5 w-5 text-pink-500 mx-auto" />
          <div className="text-[10px] text-text-sub font-bold mt-2 uppercase tracking-wide">獲得お気に入り</div>
          <div className="text-xl font-extrabold text-text-main mt-1">{totalFavorites}</div>
        </div>
        <div className="card-premium p-5 bg-surface text-center">
          <Bookmark className="h-5 w-5 text-keio-gold mx-auto" />
          <div className="text-[10px] text-text-sub font-bold mt-2 uppercase tracking-wide">平均評価</div>
          <div className="text-xl font-extrabold text-text-main mt-1">
            {currentUser.average_rating > 0 ? `★${currentUser.average_rating.toFixed(1)}` : 'なし'}
          </div>
        </div>
      </div>

      {/* 出品した商品管理リスト */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-main flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-keio-navy" />
          出品した教材のステータス管理
        </h3>

        {loadingItems ? (
          <div className="space-y-4">
            <div className="card-premium h-20 animate-pulse"></div>
            <div className="card-premium h-20 animate-pulse"></div>
          </div>
        ) : myItems.length === 0 ? (
          <div className="card-premium p-8 text-center text-text-sub text-xs">
            まだ出品している教科書はありません。
          </div>
        ) : (
          <div className="space-y-3">
            {myItems.map((item) => (
              <div
                key={item.id}
                className="card-premium p-4 flex items-center justify-between gap-4 bg-surface"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-border-main/50">
                    <img
                      src={item.images && item.images.length > 0 ? item.images[0].imageUrl : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 text-xs">
                    <h4 className="font-bold text-text-main truncate">{item.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-text-sub mt-1">
                      <span className="font-bold text-keio-red">¥{item.price.toLocaleString()}</span>
                      <span>•</span>
                      <span>ステータス: {getStatusLabel(item.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    className="px-2.5 py-1.5 bg-background border border-border-main rounded-lg text-[10px] font-semibold text-text-main"
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  >
                    <option value="AVAILABLE">出品中</option>
                    <option value="RESERVED">取り置き中</option>
                    <option value="SOLD">売却済</option>
                  </select>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg border border-transparent hover:border-red-100 transition"
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
export default MyPage;
