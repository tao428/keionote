import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lecture, TimetableSlot, Item } from '../types';
import { Plus, X, BookOpen, Trash2, CalendarRange, MapPin, User, ChevronRight, AlertCircle } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  // 右側Drawerの表示管理
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  // 登録ダイアログ（モーダル）管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<{ weekday: string; period: number } | null>(null);
  const [selectedLectureId, setSelectedLectureId] = useState('');

  const weekdays = [
    { label: '月', value: 'MON' },
    { label: '火', value: 'TUE' },
    { label: '水', value: 'WED' },
    { label: '木', value: 'THU' },
    { label: '金', value: 'FRI' },
    { label: '土', value: 'SAT' }
  ];

  const periods = [1, 2, 3, 4, 5, 6, 7]; // 7限まで拡張

  const fetchData = async () => {
    try {
      const ttRes = await fetch('/api/lectures/timetable');
      const lecRes = await fetch('/api/lectures');

      if (ttRes.ok && lecRes.ok) {
        const ttData = await ttRes.json();
        const lecData = await lecRes.json();
        setTimetable(ttData.timetable || []);
        setLectures(lecData.lectures || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSlot = (weekday: string, period: number) => {
    return timetable.find(
      (slot) => slot.lecture.weekday === weekday && slot.lecture.period === period
    );
  };

  // セルのタップ処理
  const handleCellClick = (weekday: string, period: number, slot?: TimetableSlot) => {
    if (slot) {
      // 登録済みの授業なら、右側Drawerで詳細表示
      setSelectedSlot(slot);
    } else {
      // 未登録なら、登録モーダルを開く
      setActiveCell({ weekday, period });
      setSelectedLectureId('');
      setIsModalOpen(true);
    }
  };

  // 講義登録・更新
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCell || !selectedLectureId) return;

    try {
      const res = await fetch('/api/lectures/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: selectedLectureId,
          weekday: activeCell.weekday,
          period: activeCell.period,
          semester: 'SPRING'
        })
      });

      if (res.ok) {
        await fetchData();
        setIsModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || '登録に失敗しました。');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // コマの削除 (Drawer内から削除)
  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('この講義を時間割から登録解除しますか？')) return;

    try {
      const res = await fetch(`/api/lectures/timetable/${slotId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSelectedSlot(null);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getWeekdayLabel = (val: string) => {
    return weekdays.find(w => w.value === val)?.label || val;
  };

  const getCampusLabel = (val: string) => {
    return { HIYOSHI: '日吉', MITA: '三田', YAGAMI: '矢上', SFC: 'SFC', SHINANOMACHI: '信濃町', SHIBA: '芝共立' }[val] || val;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-keio-navy"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[75vh]">
      <div className="space-y-6 pr-0 lg:pr-[380px] transition-all duration-300">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-keio-navy flex items-center gap-2">
            <CalendarRange className="h-6 w-6" />
            マイ時間割
          </h2>
          <p className="text-xs text-text-sub mt-1">
            登録された講義をタップすると、その授業で使われる教科書と、現在出品されている中古本が右側のパネルに表示されます。
          </p>
        </div>

        {/* 時間割グリッド */}
        <div className="overflow-x-auto rounded-2xl border border-border-main bg-surface shadow-sm">
          <table className="w-full min-w-[750px] border-collapse table-fixed text-xs text-text-main">
            <thead>
              <tr className="bg-slate-50/70 border-b border-border-main">
                <th className="w-14 p-3 text-text-sub font-bold border-r border-border-main text-center">時限</th>
                {weekdays.map((w) => (
                  <th key={w.value} className="p-3 text-text-main font-bold border-r border-border-main text-center">
                    {w.label}曜
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period} className="border-b border-border-main hover:bg-slate-50/20 transition-colors">
                  <td className="p-4 text-center font-bold text-text-sub border-r border-border-main bg-slate-50/30">
                    {period}
                  </td>
                  {weekdays.map((w) => {
                    const slot = getSlot(w.value, period);
                    const isDrawerOpen = selectedSlot?.id === slot?.id;
                    return (
                      <td
                        key={w.value}
                        onClick={() => handleCellClick(w.value, period, slot)}
                        className="p-1 border-r border-border-main relative h-[88px] cursor-pointer"
                      >
                        {slot ? (
                          <div
                            className={`h-full flex flex-col justify-between p-2.5 rounded-xl transition-all duration-200 border ${
                              isDrawerOpen
                                ? 'bg-keio-navy text-white border-keio-navy shadow-sm'
                                : 'bg-[#001E62]/5 border-[#001E62]/10 hover:bg-[#001E62]/10 text-keio-navy'
                            }`}
                          >
                            <div className="font-bold text-[11px] leading-tight line-clamp-2">
                              {slot.lecture.name}
                            </div>
                            <div className="flex justify-between items-center text-[9px] mt-2">
                              <span className={isDrawerOpen ? 'text-white/80' : 'text-text-sub truncate'}>
                                {slot.lecture.teacher.split(' ')[0]}
                              </span>
                              <span className={`px-1 rounded text-[8px] ${
                                isDrawerOpen ? 'bg-white/20 text-white' : 'bg-[#001E62]/10 text-keio-navy'
                              }`}>
                                {getCampusLabel(slot.lecture.campus)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition">
                            <Plus className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 右側詳細 Drawer (Slide-in) */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-16 right-0 bottom-0 w-full lg:w-[360px] bg-surface border-l border-border-main z-40 drawer-shadow flex flex-col justify-between"
          >
            {/* Drawer ヘッダー */}
            <div className="p-5 border-b border-border-main flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-bold text-keio-navy bg-keio-navy/5 px-2 py-0.5 rounded border border-keio-navy/10">
                  {selectedSlot.lecture.faculty}
                </span>
                <h3 className="font-bold text-base text-text-main mt-2 leading-tight">
                  {selectedSlot.lecture.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-sub mt-2">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {selectedSlot.lecture.teacher}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {getCampusLabel(selectedSlot.lecture.campus)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-text-sub transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer スクリューコンテンツ (教科書 & 出品一覧) */}
            <div className="p-5 flex-grow overflow-y-auto space-y-5">
              <h4 className="text-xs font-bold text-text-sub uppercase tracking-wider">
                📖 指定教材 & 中古出品
              </h4>

              {(!selectedSlot.lecture.textbooks || selectedSlot.lecture.textbooks.length === 0) ? (
                <div className="text-center py-6 text-xs text-text-sub bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  指定された教科書はありません。
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSlot.lecture.textbooks.map((tb) => (
                    <div key={tb.id} className="p-4 bg-slate-50/50 border border-border-main rounded-xl space-y-3">
                      <div>
                        <h5 className="font-bold text-xs text-text-main line-clamp-1">{tb.title}</h5>
                        <p className="text-[10px] text-text-sub mt-0.5">
                          著者: {tb.author || '不明'} | 出版: {tb.publisher || '不明'}
                        </p>
                      </div>

                      {/* 出品中 */}
                      <div className="space-y-1.5 pt-2 border-t border-border-main/50">
                        <div className="text-[9px] font-bold text-text-sub">出品中の中古本 ({tb.items?.length || 0}件)</div>
                        {(!tb.items || tb.items.length === 0) ? (
                          <div className="text-[10px] text-text-sub italic">現在、出品はありません。</div>
                        ) : (
                          <div className="space-y-2">
                            {tb.items.slice(0, 3).map((item: Item) => (
                              <Link
                                key={item.id}
                                to={`/items/${item.id}`}
                                className="p-2 bg-surface border border-border-main rounded-lg flex items-center justify-between gap-2 hover:border-keio-navy/30 transition text-[11px]"
                              >
                                <span className="text-text-main font-medium truncate">{item.title}</span>
                                <span className="font-bold text-keio-red shrink-0 flex items-center gap-0.5">
                                  ¥{item.price.toLocaleString()}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </Link>
                            ))}
                            {tb.items.length > 3 && (
                              <Link
                                to={`/syllabus?keywords=${encodeURIComponent(selectedSlot.lecture.name)}`}
                                className="block text-center text-[10px] text-keio-navy font-bold hover:underline pt-1"
                              >
                                全て表示する
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer フッター (削除) */}
            <div className="p-5 border-t border-border-main bg-slate-50 flex items-center gap-3">
              <Link
                to={`/syllabus?keywords=${encodeURIComponent(selectedSlot.lecture.name)}`}
                className="flex-grow py-2 px-3 text-center bg-keio-navy hover:bg-keio-navy/90 text-white rounded-lg text-xs font-semibold transition"
              >
                シラバス詳細を開く
              </Link>
              <button
                onClick={() => handleDeleteSlot(selectedSlot.id)}
                className="p-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-lg transition"
                title="時間割から削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 登録用モーダル */}
      {isModalOpen && activeCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface p-6 rounded-2xl border border-border-main shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-text-sub transition"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-text-main mb-4 flex items-center gap-1.5">
              <BookOpen className="h-5 w-5 text-keio-navy" />
              {getWeekdayLabel(activeCell.weekday)}曜 {activeCell.period}限の授業を登録
            </h3>

            {/* この時限に一致する開講講義のみに絞り込んでリストを表示 */}
            {(() => {
              const matchedLectures = lectures.filter(
                (lec) => lec.weekday === activeCell.weekday && lec.period === activeCell.period
              );

              if (matchedLectures.length === 0) {
                return (
                  <div className="text-center py-6 text-xs text-text-sub space-y-3">
                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
                    <p>この時間帯（{getWeekdayLabel(activeCell.weekday)}曜{activeCell.period}限）に開講されるシラバス講義データが登録されていません。</p>
                    <Link
                      to="/syllabus"
                      className="inline-block text-keio-navy font-bold hover:underline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      シラバスを検索して作成する
                    </Link>
                  </div>
                );
              }

              return (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-sub uppercase tracking-wider mb-2">講義を選択</label>
                    <select
                      required
                      className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy text-xs"
                      value={selectedLectureId}
                      onChange={(e) => setSelectedLectureId(e.target.value)}
                    >
                      <option value="">講義を選択してください</option>
                      {matchedLectures.map((lec) => (
                        <option key={lec.id} value={lec.id}>
                          {lec.name} ({lec.teacher.split(' ')[0]}) - {lec.faculty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-keio-navy hover:bg-keio-navy/95 text-white font-bold rounded-lg text-xs transition"
                  >
                    時間割に登録する
                  </button>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
export default TimetablePage;
