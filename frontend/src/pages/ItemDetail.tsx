import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Item, PriceStats } from '../types';
import { BookOpen, User, Star, ArrowLeft, Heart, BarChart3, TrendingUp, Calendar } from 'lucide-react';

export const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const navigate = useNavigate();

  const fetchItemDetail = async () => {
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data.item);
        setStats(data.stats);
      } else {
        console.error('Failed to get item details');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetail();
  }, [id]);

  const handlePurchaseRequest = async () => {
    if (!item) return;
    setPurchasing(true);
    try {
      // 本来はPOST /api/transactions
      // Phase 2 用のモックとして一時的にメッセージを表示し、チャット（ダミーID）にリダイレクト
      alert('購入申請を送信しました！取引チャットへ移動します（日程調整と受け渡し場所の決定を行ってください）。');
      navigate('/timetable'); // またはチャットへ
    } catch (e) {
      console.error(e);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">商品が見つかりませんでした。</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> ホームへ戻る
        </Link>
      </div>
    );
  }

  const images = item.images && item.images.length > 0
    ? item.images.map(img => img.imageUrl)
    : ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'];

  // コンディションの日本語
  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'NEW': return '新品同様';
      case 'LIKE_NEW': return '未使用に近い';
      case 'GOOD': return '目立った傷や汚れなし';
      case 'USED': return 'やや傷や汚れあり';
      default: return cond;
    }
  };

  return (
    <div className="space-y-8">
      {/* 戻るボタン */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition text-sm">
        <ArrowLeft className="h-4 w-4" /> 商品一覧に戻る
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左カラム: 画像ギャラリー (5カラム) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-white/5 shadow-lg">
            <img
              src={images[activeImageIdx]}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition ${
                    activeImageIdx === idx ? 'border-blue-500 scale-95' : 'border-transparent hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右カラム: 詳細情報 (6カラム) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 relative">
            <div className="absolute top-6 right-6">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 rounded-xl border transition ${
                  isFavorite 
                    ? 'bg-pink-500/10 border-pink-500/20 text-pink-500' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {getConditionLabel(item.condition)}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-100 mt-3 pr-12 leading-snug">
                {item.title}
              </h1>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-400">¥{item.price.toLocaleString()}</span>
              <span className="text-xs text-slate-500">学内手渡しのため送料無料</span>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-start gap-2.5 text-sm text-slate-300">
                <BookOpen className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">授業・教員情報</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {item.textbook?.lecture?.name} ({item.textbook?.lecture?.teacher})
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-sm text-slate-300">
                <Calendar className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">対応教科書</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    『{item.textbook?.title}』
                    {item.textbook?.author && ` / ${item.textbook.author}`}
                    {item.textbook?.publisher && ` (${item.textbook.publisher})`}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePurchaseRequest}
              disabled={purchasing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {purchasing ? '処理中...' : '購入を希望する'}
            </button>
          </div>

          {/* 統計価格分析パネル */}
          {stats && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                この教材の取引相場分析 (過去の成約データ {stats.count} 件)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold">平均価格</div>
                  <div className="text-lg font-black text-slate-200 mt-1">¥{stats.average.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold">中央値</div>
                  <div className="text-lg font-black text-purple-400 mt-1">¥{stats.median.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold">最高価格</div>
                  <div className="text-lg font-black text-pink-400 mt-1">¥{stats.max.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold">最安価格</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">¥{stats.min.toLocaleString()}</div>
                </div>
              </div>

              {/* 簡単な価格評価アドバイス */}
              <div className="flex items-center gap-2 text-xs p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span>
                  {item.price <= stats.median 
                    ? 'この商品は市場の中央値以下で出品されており、お買い得です！' 
                    : 'この商品はやや高めの価格設定になっています。状態を確認してください。'}
                </span>
              </div>
            </div>
          )}

          {/* 出品者情報 */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-slate-300">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-slate-200 text-sm">{item.seller?.nickname}</div>
                <div className="text-xs text-slate-500">取引実績 {item.seller?.review_count || 0} 件</div>
              </div>
            </div>
            {item.seller?.average_rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{item.seller.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 商品説明 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm">商品説明</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {item.description || '説明はありません。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
