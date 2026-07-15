import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { User, Lecture, TimetableSlot } from '../types';
import { BookOpen, Calendar, Sparkles, ArrowRight, GraduationCap } from 'lucide-react';

interface HomeProps {
  currentUser: User | null;
}

export const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const [facultyLectures, setFacultyLectures] = useState<Lecture[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        // 全講義をフェッチし、ユーザーの学部に一致するもののみフィルタ
        const lecturesRes = await fetch('/api/lectures');
        // ユーザーの時間割をフェッチ
        const timetableRes = await fetch('/api/lectures/timetable');

        if (lecturesRes.ok && timetableRes.ok) {
          const lecturesData = await lecturesRes.json();
          const timetableData = await timetableRes.json();

          // ユーザーの学部（例: 理工学部）に合致する講義を抽出
          const matched = (lecturesData.lectures || []).filter(
            (lec: Lecture) => lec.faculty === currentUser.faculty
          );
          setFacultyLectures(matched.slice(0, 3));
          setTimetable(timetableData.timetable || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const getWeekdayLabel = (day: string) => {
    return { MON: '月', TUE: '火', WED: '水', THU: '木', FRI: '金', SAT: '土' }[day] || day;
  };

  const getCampusLabel = (val: string) => {
    return { HIYOSHI: '日吉', MITA: '三田', YAGAMI: '矢上', SFC: 'SFC', SHINANOMACHI: '信濃町', SHIBA: '芝共立' }[val] || val;
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4">
      {/* 慶應×大学公式システム風 中央カード */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="card-premium p-10 md:p-12 text-center bg-gradient-to-b from-[#001E62]/5 to-[#001E62]/0 relative overflow-hidden rounded-3xl"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-blue-600/5 via-red-600/5 to-yellow-600/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-keio-navy/5 text-keio-navy text-xs font-bold border border-keio-navy/10">
            <Sparkles className="h-3.5 w-3.5 text-keio-gold fill-keio-gold" />
            慶應生専用 教材手渡し取引ポータル
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-keio-navy">
            KeioNote
          </h1>
          
          <p className="text-xs font-bold tracking-wider text-text-sub uppercase">
            教科書・授業ノート売買アプリ
          </p>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => navigate('/syllabus')}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-keio-navy hover:bg-keio-red text-white font-bold text-xs shadow-md transition duration-300"
            >
              <BookOpen className="h-4 w-4" />
              シラバス講義検索
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2カラムレイアウト: 左「時間割ベースのおすすめ」、右「あなたの学部からおすすめ」 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* A. 時間割ベースのおすすめ */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-sub flex items-center gap-1.5 border-b border-border-main pb-2">
            <Calendar className="h-4 w-4 text-keio-navy" />
            あなたの履修科目 (時間割連携)
          </h3>

          {loading ? (
            <div className="card-premium h-32 animate-pulse bg-surface"></div>
          ) : timetable.length === 0 ? (
            <div className="card-premium p-8 text-center text-xs text-text-sub bg-surface space-y-3">
              <p>まだ時間割が登録されていません</p>
              <button
                onClick={() => navigate('/timetable')}
                className="inline-flex items-center gap-1 px-4 py-2 bg-keio-navy/5 text-keio-navy hover:bg-keio-navy/10 font-bold rounded-lg transition"
              >
                時間割から授業を登録する
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {timetable.map((slot) => {
                const totalListings = slot.lecture.textbooks?.reduce((acc, tb) => acc + (tb.items?.length || 0), 0) || 0;
                return (
                  <div key={slot.id} className="card-premium p-4 bg-surface flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-text-main line-clamp-1">{slot.lecture.name}</div>
                      <div className="text-[10px] text-text-sub mt-1">
                        {getWeekdayLabel(slot.lecture.weekday)}曜{slot.lecture.period}限 | 教科書: {slot.lecture.textbooks?.length || 0}冊 | 出品中: {totalListings}件
                      </div>
                    </div>
                    <Link
                      to={`/syllabus?keywords=${encodeURIComponent(slot.lecture.name)}&lectureId=${slot.lecture.id}`}
                      className="px-3 py-1.5 bg-keio-navy/5 hover:bg-keio-navy/10 text-keio-navy font-bold rounded-lg transition text-[10px] shrink-0"
                    >
                      教材を見る ➡
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* B. あなたの学部からおすすめ */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-sub flex items-center gap-1.5 border-b border-border-main pb-2">
            <GraduationCap className="h-4.5 w-4.5 text-keio-navy" />
            あなた向けおすすめ講義 ({currentUser?.faculty})
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <div key={i} className="card-premium h-20 animate-pulse bg-surface"></div>)}
            </div>
          ) : facultyLectures.length === 0 ? (
            <div className="card-premium p-8 text-center text-xs text-text-sub bg-surface">
              あなたの学部に該当するおすすめ講義データがありません。
            </div>
          ) : (
            <div className="space-y-3">
              {facultyLectures.map((lec) => {
                const totalListings = lec.textbooks?.reduce((acc, tb) => acc + (tb.items?.length || 0), 0) || 0;
                return (
                  <Link
                    key={lec.id}
                    to={`/syllabus?keywords=${encodeURIComponent(lec.name)}`}
                    className="block card-premium p-4 bg-surface hover:border-keio-navy/30 transition group text-xs"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="font-bold text-text-main group-hover:text-keio-navy transition-colors">{lec.name}</div>
                        <div className="text-[10px] text-text-sub mt-1">
                          {getWeekdayLabel(lec.weekday)}曜{lec.period}限 | {getCampusLabel(lec.campus)}
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-text-sub shrink-0">
                        <div>教科書 {lec.textbooks?.length || 0} 冊</div>
                        <div className="text-keio-red font-bold mt-0.5">出品中 {totalListings} 件</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
export default Home;
