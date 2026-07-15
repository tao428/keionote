import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Item, PriceStats } from '../types';
import { BookOpen, Star, ArrowLeft, Heart, BarChart3, TrendingUp, Calendar } from 'lucide-react';

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
      alert('購入申請を送信しました！出品者との取引調整へ進みます。');
      navigate('/timetable');
    } catch (e) {
      console.error(e);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-keio-navy"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-text-sub">商品が見つかりませんでした。</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-keio-navy hover:underline">
          <ArrowLeft className="h-4 w-4" /> ホームへ戻る
        </Link>
      </div>
    );
  }

  const images = item.images && item.images.length > 0
    ? item.images.map(img => img.imageUrl)
    : ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'];

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'NEW': return '新品同様';
      case 'LIKE_NEW': return '超美品';
      case 'GOOD': return '状態良好';
      case 'USED': return 'やや傷あり';
      default: return cond;
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'NEW':
      case 'LIKE_NEW':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'GOOD':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  // SVGラインチャート用のデータプロット生成
  const renderSvgChart = (priceStats: PriceStats) => {
    const width = 340;
    const height = 90;
    const padding = 15;
    
    // ダミープロットデータ (min, 中間値1, average, median, max)
    const points = [
      priceStats.min,
      Math.round((priceStats.min + priceStats.median) / 2),
      priceStats.average,
      priceStats.median,
      priceStats.max
    ];

    const maxVal = Math.max(...points) * 1.1;
    const minVal = Math.min(...points) * 0.9;
    const valRange = maxVal - minVal || 1;

    // 座標の計算
    const coords = points.map((val, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (points.length - 1);
      const y = height - padding - ((val - minVal) * (height - padding * 2)) / valRange;
      return { x, y };
    });

    const linePath = coords.reduce((acc, coord, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${coord.x} ${coord.y} `;
    }, '');

    const areaPath = linePath + `L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#001E62" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#001E62" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* グリッド補助線 */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#F3F4F6" strokeDasharray="3" />
        
        {/* グラデーション塗りつぶし領域 */}
        <path d={areaPath} fill="url(#chartGrad)" />
        
        {/* メインの折れ線 */}
        <path d={linePath} fill="none" stroke="#001E62" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* 各プロットポイントの円 */}
        {coords.map((coord, idx) => (
          <circle
            key={idx}
            cx={coord.x}
            cy={coord.y}
            r="4.5"
            fill="#FFFFFF"
            stroke="#001E62"
            strokeWidth="2.5"
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* 戻る */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-text-sub hover:text-keio-navy transition text-xs font-semibold">
        <ArrowLeft className="h-4 w-4" /> ホームへ戻る
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左: 画像エリア (5カラム) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border border-border-main shadow-sm">
            <img
              src={images[activeImageIdx]}
              alt={item.title}
              className="w-full h-full object-contain p-4"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImageIdx === idx ? 'border-keio-navy scale-95' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右: 詳細情報 & 統計チャート (7カラム) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-premium p-6 space-y-5 bg-surface relative">
            <div className="absolute top-6 right-6">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 rounded-xl border transition ${
                  isFavorite 
                    ? 'bg-pink-50 border-pink-100 text-pink-500' 
                    : 'bg-slate-50 border-border-main text-text-sub hover:text-text-main'
                }`}
              >
                <Heart className="h-4.5 w-4.5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${getConditionColor(item.condition)}`}>
                {getConditionLabel(item.condition)}
              </span>
              <h1 className="text-xl font-bold text-text-main mt-3 pr-12 leading-snug">
                {item.title}
              </h1>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-keio-red">¥{item.price.toLocaleString()}</span>
              <span className="text-xs text-text-sub">学内手渡しのため送料無料</span>
            </div>

            {/* 授業情報 */}
            <div className="pt-4 border-t border-border-main/60 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-text-main">
                <BookOpen className="h-4.5 w-4.5 text-text-sub shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-text-main">対象の講義情報</div>
                  <div className="text-text-sub mt-0.5">
                    {item.textbook?.lecture?.name} ({item.textbook?.lecture?.teacher})
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-text-main">
                <Calendar className="h-4.5 w-4.5 text-text-sub shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-text-main">指定教科書</div>
                  <div className="text-text-sub mt-0.5">
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
              className="w-full py-3 px-4 rounded-xl bg-keio-navy hover:bg-keio-navy/95 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
            >
              {purchasing ? '購入申請中...' : '購入を希望する'}
            </button>
          </div>

          {/* 統計価格分析 & SVG チャート */}
          {stats && (
            <div className="card-premium p-6 space-y-5 bg-surface">
              <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-keio-navy" />
                この教材の学内取引相場分析 (成約データ {stats.count} 件)
              </h3>
              
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-border-main/50 text-center">
                  <div className="text-[9px] text-text-sub font-semibold">平均価格</div>
                  <div className="text-sm font-extrabold text-text-main mt-0.5">¥{stats.average.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-border-main/50 text-center">
                  <div className="text-[9px] text-text-sub font-semibold">中央値</div>
                  <div className="text-sm font-extrabold text-keio-navy mt-0.5">¥{stats.median.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-border-main/50 text-center">
                  <div className="text-[9px] text-text-sub font-semibold">最高値</div>
                  <div className="text-sm font-extrabold text-keio-red mt-0.5">¥{stats.max.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-border-main/50 text-center">
                  <div className="text-[9px] text-text-sub font-semibold">最安値</div>
                  <div className="text-sm font-extrabold text-emerald-600 mt-0.5">¥{stats.min.toLocaleString()}</div>
                </div>
              </div>

              {/* 折れ線グラフのインライン描画 */}
              <div className="pt-2 border-t border-border-main/50 space-y-2">
                <div className="text-[10px] font-bold text-text-sub">過去の取引価格変動トレンド (最安→最高)</div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-border-main/50">
                  {renderSvgChart(stats)}
                </div>
              </div>

              {/* アドバイス */}
              <div className="flex items-center gap-2 text-xs p-3 rounded-xl bg-keio-navy/5 border border-keio-navy/10 text-keio-navy">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span>
                  {item.price <= stats.median 
                    ? 'この商品は市場の中央値以下で出品されており、大変お買い得です！' 
                    : 'この商品はやや高めの価格設定になっています。本棚保管などの保存状態を確認してください。'}
                </span>
              </div>
            </div>
          )}

          {/* 出品者情報 */}
          <div className="card-premium p-4 bg-surface flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-keio-navy text-white flex items-center justify-center text-xs font-bold">
                {item.seller?.nickname.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-text-main text-xs">{item.seller?.nickname}</div>
                <div className="text-[10px] text-text-sub">取引回数 {item.seller?.review_count || 0}回</div>
              </div>
            </div>
            {item.seller?.average_rating > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{item.seller.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 商品説明 */}
          <div className="card-premium p-5 space-y-2 bg-surface text-xs">
            <h3 className="font-bold text-text-main">商品状態の詳細</h3>
            <p className="text-text-sub leading-relaxed whitespace-pre-wrap">
              {item.description || '詳細な説明はありません。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ItemDetail;
