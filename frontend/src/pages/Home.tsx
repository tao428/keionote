import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import type { Item, Lecture } from '../types';
import { Search, Plus, Calendar, BookOpen, Flame, Sparkles, BookCheck } from 'lucide-react';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newArrivals, setNewArrivals] = useState<Item[]>([]);
  const [popularLectures, setPopularLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 新着出品商品の取得
        const itemsRes = await fetch('/api/items');
        // 全講義を取得し、シードで作成した大量データから「人気講義（適当にシャッフルまたは先頭数件）」を選出
        const lecturesRes = await fetch('/api/lectures');

        if (itemsRes.ok && lecturesRes.ok) {
          const itemsData = await itemsRes.json();
          const lecturesData = await lecturesRes.json();
          
          setNewArrivals(itemsData.items.slice(0, 4) || []);
          setPopularLectures(lecturesData.lectures.slice(0, 3) || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/syllabus?keywords=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/syllabus');
    }
  };

  return (
    <div className="space-y-12">
      {/* 慶應×Apple風プレミアムHeroセクション */}
      <section className="relative rounded-3xl overflow-hidden py-20 px-8 text-center bg-gradient-to-b from-[#001E62]/10 to-[#001E62]/0 border border-border-main/50 shadow-sm">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/5 via-red-600/5 to-yellow-600/5 rounded-full blur-3xl -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-keio-navy/5 text-keio-navy text-xs font-bold border border-keio-navy/10">
            <Sparkles className="h-3.5 w-3.5" />
            慶應生限定の教科書・ノート取引プラットフォーム
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-keio-navy sm:text-6xl md:leading-none">
            KeioNote
          </h1>
          <p className="text-lg font-medium text-text-sub max-w-xl mx-auto leading-relaxed">
            教科書も、授業ノートも、先輩の知見も。<br />
            キャンパス手渡しだから、送料ゼロで今すぐ手に入る。
          </p>
        </motion.div>

        {/* 検索バー */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 max-w-xl mx-auto"
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-sub">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="シラバス講義名、教員名、教科書名で検索..."
              className="w-full pl-11 pr-32 py-4 bg-surface border border-border-main rounded-2xl focus:outline-none focus:ring-2 focus:ring-keio-navy/20 focus:border-keio-navy text-sm text-text-main placeholder-text-sub shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-keio-navy hover:bg-keio-navy/90 text-white px-5 rounded-xl text-xs font-semibold tracking-wide transition shadow-sm"
            >
              シラバス検索
            </button>
          </form>
        </motion.div>

        {/* クイックリンク */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/timetable"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-surface border border-border-main text-text-main text-xs font-bold shadow-sm hover:bg-slate-50 transition"
          >
            <Calendar className="h-4 w-4 text-keio-navy" />
            時間割から探す
          </Link>
          <Link
            to="/items/new"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-keio-navy hover:bg-keio-navy/95 text-white text-xs font-bold shadow-md shadow-keio-navy/10 transition"
          >
            <Plus className="h-4 w-4" />
            教科書を出品する
          </Link>
        </div>
      </section>

      {/* 人気講義セクション */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-keio-red" />
          <h3 className="text-lg font-bold text-text-main">注目の人気講義・教科書</h3>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-premium h-32 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularLectures.map((lec) => (
              <Link
                key={lec.id}
                to={`/syllabus?keywords=${encodeURIComponent(lec.name)}`}
                className="card-premium p-5 flex flex-col justify-between hover:border-keio-navy/30 group"
              >
                <div>
                  <span className="text-[10px] font-bold text-keio-navy bg-keio-navy/5 px-2 py-0.5 rounded border border-keio-navy/10">
                    {lec.faculty}
                  </span>
                  <h4 className="font-bold text-text-main text-sm mt-2 line-clamp-1 group-hover:text-keio-navy transition-colors">
                    {lec.name}
                  </h4>
                  <p className="text-xs text-text-sub mt-1">{lec.teacher}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-sub mt-4 pt-3 border-t border-border-main/50">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    使用教科書 {lec.textbooks?.length || 0} 冊
                  </span>
                  <span className="font-semibold text-keio-navy group-hover:underline">
                    シラバスで開く →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 新着商品セクション */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookCheck className="h-5 w-5 text-keio-gold" />
          <h3 className="text-lg font-bold text-text-main">最近出品された新着教科書</h3>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-premium aspect-[4/5] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Home;
