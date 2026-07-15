import React from 'react';
import { Link } from 'react-router-dom';
import type { Item } from '../types';
import { Eye, Heart } from 'lucide-react';

interface ProductCardProps {
  item: Item;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  // コンディション日本語
  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'NEW': return '新品同様';
      case 'LIKE_NEW': return '超美品';
      case 'GOOD': return '状態良好';
      case 'USED': return 'やや傷あり';
      default: return cond;
    }
  };

  const getConditionStyle = (cond: string) => {
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

  const coverImage = item.images && item.images.length > 0
    ? item.images[0].imageUrl
    : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

  return (
    <Link to={`/items/${item.id}`} className="block group">
      <div className="card-premium overflow-hidden h-full flex flex-col justify-between">
        {/* 画像エリア */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-border-main/50">
          <img
            src={coverImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getConditionStyle(item.condition)}`}>
              {getConditionLabel(item.condition)}
            </span>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-text-main text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-keio-navy transition-colors">
              {item.title}
            </h4>
            <p className="text-[10px] text-text-sub mt-1 truncate">{item.textbook?.title}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-border-main/40 flex items-center justify-between">
            <span className="font-extrabold text-keio-red text-sm">
              ¥{item.price.toLocaleString()}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-text-sub">
              <span className="flex items-center gap-0.5" title="閲覧数">
                <Eye className="h-3 w-3" />
                {item.viewCount}
              </span>
              <span className="flex items-center gap-0.5" title="お気に入り">
                <Heart className="h-3 w-3" />
                {item.favoriteCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default ProductCard;
