import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lecture, TimetableSlot } from '../types';
import { Plus, X, BookOpen, Trash2, CalendarRange } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  
  // モーダル管理用
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<{ weekday: string; period: number } | null>(null);
  const [selectedLectureId, setSelectedLectureId] = useState('');
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const weekdays = [
    { label: '月', value: 'MON' },
    { label: '火', value: 'TUE' },
    { label: '水', value: 'WED' },
    { label: '木', value: 'THU' },
    { label: '金', value: 'FRI' },
    { label: '土', value: 'SAT' }
  ];

  const periods = [1, 2, 3, 4, 5, 6];

  const fetchData = async () => {
    try {
      // 時間割データの取得
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

  // 特定の曜日と時限に該当するスロットを検索
  const getSlot = (weekday: string, period: number) => {
    return timetable.find(
      (slot) => slot.weekday === weekday && slot.period === period
    );
  };

  // セルがクリックされたとき
  const handleCellClick = (weekday: string, period: number, slot?: TimetableSlot) => {
    setActiveCell({ weekday, period });
    if (slot) {
      setSelectedLectureId(slot.lectureId);
      setActiveSlotId(slot.id);
    } else {
      setSelectedLectureId('');
      setActiveSlotId(null);
    }
    setIsModalOpen(true);
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
          semester: 'SPRING' // 春学期をデフォルトとする
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

  // コマの削除
  const handleDelete = async () => {
    if (!activeSlotId) return;
    if (!confirm('この授業を時間割から削除しますか？')) return;

    try {
      const res = await fetch(`/api/lectures/timetable/${activeSlotId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchData();
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 授業詳細（教材検索）へ遷移
  const handleSearchTextbooks = (slot: TimetableSlot) => {
    // ホーム画面にlectureIdを渡して、該当講義の教科書出品をフィルタリングして表示する
    navigate(`/?lectureId=${slot.lectureId}`);
  };

  const getWeekdayLabel = (val: string) => {
    return weekdays.find(w => w.value === val)?.label || val;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-blue-400" />
            マイ時間割
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            授業を登録すると、時間割からワンタップで必要な教科書を検索できます。
          </p>
        </div>
      </div>

      {/* 時間割グリッド */}
      <div className="overflow-x-auto rounded-2xl border border-white/5 shadow-2xl glass-panel">
        <table className="w-full min-w-[700px] border-collapse table-fixed text-sm text-slate-200">
          <thead>
            <tr className="bg-slate-950/60 border-b border-white/5">
              <th className="w-16 p-3 text-slate-400 font-bold border-r border-white/5">時限</th>
              {weekdays.map((w) => (
                <th key={w.value} className="p-3 text-slate-300 font-bold border-r border-white/5">
                  {w.label}曜日
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period} className="border-b border-white/5 hover:bg-slate-900/10 transition-colors">
                <td className="p-4 text-center font-bold text-slate-400 border-r border-white/5 bg-slate-950/20">
                  {period}
                </td>
                {weekdays.map((w) => {
                  const slot = getSlot(w.value, period);
                  return (
                    <td
                      key={w.value}
                      className="p-2 border-r border-white/5 relative aspect-video"
                    >
                      {slot ? (
                        <div className="h-full flex flex-col justify-between p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-600/20 transition-all duration-300 group">
                          <button
                            onClick={() => handleSearchTextbooks(slot)}
                            className="text-left font-bold text-slate-100 hover:text-blue-300 transition text-xs line-clamp-2"
                          >
                            {slot.lecture.name}
                          </button>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-slate-400 truncate">
                              {slot.lecture.teacher}
                            </span>
                            <button
                              onClick={() => handleCellClick(w.value, period, slot)}
                              className="opacity-0 group-hover:opacity-100 p-1 bg-slate-800/80 hover:bg-slate-700/80 rounded transition text-[10px] text-slate-300"
                            >
                              編集
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCellClick(w.value, period)}
                          className="w-full h-full min-h-[70px] flex items-center justify-center border border-dashed border-slate-800 rounded-xl hover:border-slate-600 hover:bg-slate-900/10 transition"
                        >
                          <Plus className="h-4 w-4 text-slate-600 hover:text-slate-400" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 登録・編集用ダイアログ (Native Dialog Tag + Animate Overlay) */}
      {isModalOpen && activeCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-950/40 hover:bg-slate-950/60 rounded-full text-slate-400 hover:text-slate-200 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              {getWeekdayLabel(activeCell.weekday)}曜日 {activeCell.period}限の授業
            </h3>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">講義を選択</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm"
                  value={selectedLectureId}
                  onChange={(e) => setSelectedLectureId(e.target.value)}
                >
                  <option value="" className="bg-slate-900">講義を選択してください</option>
                  {lectures.map((lec) => (
                    <option key={lec.id} value={lec.id} className="bg-slate-900">
                      {lec.name} ({lec.teacher}) - {lec.faculty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition"
                >
                  {activeSlotId ? '更新する' : '登録する'}
                </button>

                {activeSlotId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
