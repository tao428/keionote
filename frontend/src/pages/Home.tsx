import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import type { Item } from '../types';
import { Search, GraduationCap, PlusCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const faculties = [
    { name: '全て', value: '' },
    { name: '理工学部', value: '理工学部' },
    { name: '経済学部', value: '経済学部' },
    { name: '法学部', value: '法学部' },
    { name: '商学部', value: '商学部' },
    { name: '文学部', value: '文学部' },
    { name: 'SFC', value: 'SFC' },
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedFaculty && selectedFaculty !== 'SFC') {
        queryParams.append('faculty', selectedFaculty);
      } else if (selectedFaculty === 'SFC') {
        // SFCの場合は環境情報・総合政策・SFC全体などをカバー
        queryParams.append('faculty', 'SFC'); // API側またはシード側でSFCをキーワードとして処理
      }

      const res = await fetch(`/api/items?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error('Failed to fetch items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // フィルタや検索が変更されたらフェッチ
    const debounce = setTimeout(fetchItems, 300);
    return () => clearTimeout(debounce);
  }, [selectedFaculty, search]);

  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <div className="relative rounded-3xl overflow-hidden py-16 px-8 text-center glass-panel border border-white/5 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

        <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent md:text-5xl relative z-10">
          慶應生のための、安全な教材売買
        </h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm md:text-base relative z-10">
          キャンパス内手渡しだから、送料ゼロ・即時受け取り可能。時間割と連携して、必要な教科書や講義ノートに最短アクセス。
        </p>

        {/* 検索バー */}
        <div className="mt-8 max-w-lg mx-auto relative z-10">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="授業名、教員名、教科書名で検索..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-100 placeholder-slate-500 transition shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* クイックリンク */}
        <div className="mt-8 flex justify-center gap-4 relative z-10">
          <Link
            to="/timetable"
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <BookOpen className="h-4 w-4" />
            時間割から探す
          </Link>
          <Link
            to="/items/new"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-500/20"
          >
            <PlusCircle className="h-4 w-4" />
            教科書を出品する
          </Link>
        </div>
      </div>

      {/* 学部別フィルタ */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          学部別クイックアクセス
        </h3>
        <div className="flex flex-wrap gap-2">
          {faculties.map((fac) => (
            <button
              key={fac.name}
              onClick={() => setSelectedFaculty(fac.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                selectedFaculty === fac.value
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {fac.name}
            </button>
          ))}
        </div>
      </div>

      {/* 商品グリッド */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-slate-100">新着・おすすめ教材</h3>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl aspect-[4/5] animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border border-white/5">
            <p className="text-slate-500 text-sm">該当する商品が見つかりませんでした。</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
