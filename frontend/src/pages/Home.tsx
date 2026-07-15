import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Lecture } from '../types';
import { BookOpen, Calendar, Flame, Sparkles, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const [popularLectures, setPopularLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lecturesRes = await fetch('/api/lectures');
        if (lecturesRes.ok) {
          const lecturesData = await lecturesRes.json();
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

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-6">
      {/* 慶應×大学公式システム風 プレミアムグラスモルフィズム中央カード */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="card-premium p-10 md:p-14 text-center bg-gradient-to-b from-[#001E62]/5 to-[#001E62]/0 relative overflow-hidden rounded-3xl"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-r from-blue-600/5 via-red-600/5 to-yellow-600/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-keio-navy/5 text-keio-navy text-xs font-bold border border-keio-navy/10">
            <Sparkles className="h-3.5 w-3.5 text-keio-gold fill-keio-gold" />
            慶應義塾大学内限定 コミュニティ
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-keio-navy">
            KeioNote
          </h1>
          
          <p className="text-sm font-semibold tracking-wider text-text-sub uppercase">
            教科書・授業ノート売買アプリ
          </p>

          <div className="max-w-md mx-auto pt-2 pb-6">
            <p className="text-xs text-text-sub leading-relaxed">
              キャンパス内での直接手渡しだから、送料・手数料ゼロ。<br />
              シラバス指定の教科書や先輩の授業ノートを即座に見つけて取引。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate('/syllabus')}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-keio-navy hover:bg-keio-navy/95 text-white font-bold text-sm shadow-md shadow-keio-navy/10 transition duration-300"
            >
              <BookOpen className="h-4.5 w-4.5" />
              シラバス講義検索
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/timetable')}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-surface border border-border-main text-text-main hover:bg-slate-50 font-bold text-sm shadow-sm transition duration-300"
            >
              <Calendar className="h-4.5 w-4.5 text-keio-navy" />
              時間割を開く
            </button>
          </div>
        </div>
      </motion.div>

      {/* 注目の人気講義紹介 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border-main pb-2">
          <Flame className="h-4.5 w-4.5 text-keio-red" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-sub">注目のシラバス講義</h3>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-premium h-28 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularLectures.map((lec) => (
              <Link
                key={lec.id}
                to={`/syllabus?keywords=${encodeURIComponent(lec.name)}`}
                className="card-premium p-5 flex flex-col justify-between hover:border-keio-navy/30 group bg-surface"
              >
                <div>
                  <span className="text-[9px] font-bold text-keio-navy bg-keio-navy/5 px-2 py-0.5 rounded border border-keio-navy/10">
                    {lec.faculty}
                  </span>
                  <h4 className="font-bold text-text-main text-xs mt-2 line-clamp-1 group-hover:text-keio-navy transition-colors">
                    {lec.name}
                  </h4>
                  <p className="text-[10px] text-text-sub mt-0.5">{lec.teacher}</p>
                </div>
                <div className="flex items-center justify-between text-[9px] text-text-sub mt-4 pt-2.5 border-t border-border-main/50">
                  <span>教科書 {lec.textbooks?.length || 0} 冊</span>
                  <span className="font-bold text-keio-navy group-hover:underline flex items-center gap-0.5">
                    シラバスへ <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Home;
