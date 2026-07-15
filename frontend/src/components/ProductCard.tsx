import React from 'react';
import { Link } from 'react-router-dom';
import type { Item } from '../types';
import { BookOpen, User, Tag } from 'lucide-react';

interface ProductCardProps {
  item: Item;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  // コンディションの日本語変換
  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'NEW': return '新品同様';
      case 'LIKE_NEW': return '未使用に近い';
      case 'GOOD': return '目立った傷なし';
      case 'USED': return 'やや傷あり';
      default: return cond;
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'NEW':
      case 'LIKE_NEW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'GOOD':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const coverImage = item.images && item.images.length > 0
    ? item.images[0].imageUrl
    : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600';

  return (
    <Link to={`/items/${item.id}`} className="block group">
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* 画像エリア */}
        <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
          <img
            src={coverImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getConditionColor(item.condition)}`}>
              {getConditionLabel(item.condition)}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold text-blue-400 border border-white/5">
            ¥{item.price.toLocaleString()}
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-100 line-clamp-1 group-hover:text-blue-400 transition">
              {item.title}
            </h3>
            
            <div className="mt-3 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                <span className="truncate">{item.textbook?.lecture?.name || '一般講義'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-500" />
                <span className="truncate">{item.textbook?.title}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{item.seller?.nickname}</span>
            </div>
            {item.seller?.average_rating > 0 && (
              <span className="text-amber-400 font-semibold">
                ★ {item.seller.average_rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
