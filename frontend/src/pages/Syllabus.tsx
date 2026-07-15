import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lecture } from '../types';
import { ChevronDown, ChevronUp, BookOpen, User, Calendar, ArrowRight, SlidersHorizontal, X } from 'lucide-react';

export const Syllabus: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  // 検索サイドパネルの開閉状態 (初期状態は閉じた状態)
  const [showFilters, setShowFilters] = useState(false);

  // 詳細検索条件の折りたたみ状態
  const [showAdvanced, setShowAdvanced] = useState(false);

  // アコーディオンで展開されている講義ID
  const [expandedLectureId, setExpandedLectureId] = useState<string | null>(null);

  // 検索条件のState (クエリパラメータから同期)
  const [year] = useState('2026');
  const [semester, setSemester] = useState(searchParams.get('semester') || 'ALL');
  const [campus, setCampus] = useState(searchParams.get('campus') || 'ALL');
  const [faculty, setFaculty] = useState(searchParams.get('faculty') || 'ALL');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [grade, setGrade] = useState(searchParams.get('grade') || '');
  const [weekday, setWeekday] = useState(searchParams.get('weekday') || '');
  const [period, setPeriod] = useState(searchParams.get('period') || '');
  const [name, setName] = useState(searchParams.get('name') || '');
  const [teacher, setTeacher] = useState(searchParams.get('teacher') || '');
  const [keywords, setKeywords] = useState(searchParams.get('keywords') || '');

  // 詳細検索
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [classStyle, setClassStyle] = useState(searchParams.get('classStyle') || '');
  const [deliveryMethod, setDeliveryMethod] = useState(searchParams.get('deliveryMethod') || '');
  const [activeLearning, setActiveLearning] = useState(searchParams.get('activeLearning') || '');

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (year) query.append('year', year);
      if (semester && semester !== 'ALL') query.append('semester', semester);
      if (campus && campus !== 'ALL') query.append('campus', campus);
      if (faculty && faculty !== 'ALL') query.append('faculty', faculty);
      if (department) query.append('department', department);
      if (grade) query.append('grade', grade);
      if (weekday) query.append('weekday', weekday);
      if (period) query.append('period', period);
      if (name) query.append('name', name);
      if (teacher) query.append('teacher', teacher);
      if (keywords) query.append('keywords', keywords);
      if (language) query.append('language', language);
      if (classStyle) query.append('classStyle', classStyle);
      if (deliveryMethod) query.append('deliveryMethod', deliveryMethod);
      if (activeLearning) query.append('activeLearning', activeLearning);

      const lectureIdParam = searchParams.get('lectureId');
      if (lectureIdParam) {
        query.append('lectureId', lectureIdParam);
      }

      const res = await fetch(`/api/lectures?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLectures(data.lectures || []);
        
        if (data.lectures && data.lectures.length === 1) {
          setExpandedLectureId(data.lectures[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (semester !== 'ALL') params.semester = semester;
    if (campus !== 'ALL') params.campus = campus;
    if (faculty !== 'ALL') params.faculty = faculty;
    if (department) params.department = department;
    if (grade) params.grade = grade;
    if (weekday) params.weekday = weekday;
    if (period) params.period = period;
    if (name) params.name = name;
    if (teacher) params.teacher = teacher;
    if (keywords) params.keywords = keywords;
    if (language) params.language = language;
    if (classStyle) params.classStyle = classStyle;
    if (deliveryMethod) params.deliveryMethod = deliveryMethod;
    if (activeLearning) params.activeLearning = activeLearning;

    setSearchParams(params);
    setShowFilters(false); // 検索実行時にモバイルドロワーなどを自動で閉じる
  };

  const resetFilters = () => {
    setSemester('ALL');
    setCampus('ALL');
    setFaculty('ALL');
    setDepartment('');
    setGrade('');
    setWeekday('');
    setPeriod('');
    setName('');
    setTeacher('');
    setKeywords('');
    setLanguage('');
    setClassStyle('');
    setDeliveryMethod('');
    setActiveLearning('');
    setSearchParams({});
  };

  const getWeekdayPeriodLabel = (day: string, per: number) => {
    const dayLabel = { MON: '月', TUE: '火', WED: '水', THU: '木', FRI: '金', SAT: '土' }[day] || day;
    return `${dayLabel}${per}`;
  };

  const getCampusLabel = (val: string) => {
    return { HIYOSHI: '日吉', MITA: '三田', YAGAMI: '矢上', SFC: 'SFC', SHINANOMACHI: '信濃町', SHIBA: '芝共立' }[val] || val;
  };

  return (
    <div className="space-y-6">
      {/* 上部ヘッダー行 (タイトル + フィルター開閉トグル) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-keio-navy flex items-center gap-2">
            <BookOpen className="h-5.5 w-5.5" />
            シラバス講義検索
          </h2>
          <p className="text-[11px] text-text-sub mt-0.5">
            慶應の開講シラバスから授業を選択し、指定の教科書や出品中のフリマ本を即座に探せます。
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-center border ${
            showFilters
              ? 'bg-keio-navy text-white border-keio-navy'
              : 'bg-surface text-keio-navy border-border-main hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showFilters ? '検索条件を閉じる' : '検索条件を変更'}
        </button>
      </div>

      <div className="relative flex items-start gap-8 min-h-[60vh]">
        {/* スライドイン検索条件パネル (デスクトップ時は横レイアウト、モバイル時はオーバーレイドロワー) */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* モバイル用背景オーバーレイマスク */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
              />

              {/* 検索パネル本体 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="fixed lg:sticky top-20 left-0 bottom-0 lg:bottom-auto w-[290px] lg:w-[320px] h-[calc(100vh-80px)] lg:h-auto overflow-y-auto lg:overflow-visible bg-surface border-r lg:border border-border-main lg:rounded-2xl p-6 space-y-5 z-40 lg:z-10 shadow-2xl lg:shadow-sm shrink-0"
              >
                <div className="flex justify-between items-center border-b border-border-main pb-3">
                  <h3 className="font-bold text-xs text-text-main flex items-center gap-1.5">
                    <SlidersHorizontal className="h-4 w-4 text-keio-navy" />
                    検索条件フィルター
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[10px] text-text-sub hover:text-keio-navy transition font-bold"
                    >
                      リセット
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-slate-100 rounded text-text-sub lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="space-y-4 text-[11px] pb-10 lg:pb-0">
                  {/* キーワード・授業名 */}
                  <div>
                    <label className="block font-bold text-text-sub mb-1.5">キーワード / 授業名</label>
                    <input
                      type="text"
                      placeholder="授業名、教員名、キーワード..."
                      className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>

                  {/* キャンパス & 学期 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-text-sub mb-1.5">開講キャンパス</label>
                      <select
                        className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                      >
                        <option value="ALL">全て</option>
                        <option value="HIYOSHI">日吉</option>
                        <option value="MITA">三田</option>
                        <option value="YAGAMI">矢上</option>
                        <option value="SFC">SFC (湘南藤沢)</option>
                        <option value="SHINANOMACHI">信濃町</option>
                        <option value="SHIBA">芝共立</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-text-sub mb-1.5">学期</label>
                      <select
                        className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                      >
                        <option value="ALL">全学期</option>
                        <option value="SPRING">春学期</option>
                        <option value="AUTUMN">秋学期</option>
                        <option value="FULL_YEAR">通年</option>
                      </select>
                    </div>
                  </div>

                  {/* 学部・研究科 */}
                  <div>
                    <label className="block font-bold text-text-sub mb-1.5">対象学部</label>
                    <select
                      className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                    >
                      <option value="ALL">全ての学部</option>
                      <option value="理工学部">理工学部</option>
                      <option value="経済学部">経済学部</option>
                      <option value="商学部">商学部</option>
                      <option value="法学部">法学部</option>
                      <option value="文学部">文学部</option>
                      <option value="医学部">医学部</option>
                      <option value="薬学部">薬学部</option>
                      <option value="看護医療学部">看護医療学部</option>
                      <option value="環境情報学部">環境情報学部</option>
                      <option value="総合政策学部">総合政策学部</option>
                    </select>
                  </div>

                  {/* 曜日 & 時限 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-text-sub mb-1.5">曜日</label>
                      <select
                        className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                        value={weekday}
                        onChange={(e) => setWeekday(e.target.value)}
                      >
                        <option value="">全ての曜日</option>
                        <option value="MON">月曜</option>
                        <option value="TUE">火曜</option>
                        <option value="WED">水曜</option>
                        <option value="THU">木曜</option>
                        <option value="FRI">金曜</option>
                        <option value="SAT">土曜</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-text-sub mb-1.5">時限</label>
                      <select
                        className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                      >
                        <option value="">全ての時限</option>
                        {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                          <option key={p} value={p}>{p}限</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 詳細検索トグル */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-1 text-[10px] font-bold text-keio-navy hover:underline transition"
                    >
                      {showAdvanced ? (
                        <>詳細検索条件を閉じる <ChevronUp className="h-3.5 w-3.5" /></>
                      ) : (
                        <>詳細検索条件を表示 <ChevronDown className="h-3.5 w-3.5" /></>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 overflow-hidden pt-2 border-t border-border-main/50"
                      >
                        {/* 授業形態 */}
                        <div>
                          <label className="block font-bold text-text-sub mb-1.5">授業形態</label>
                          <select
                            className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                            value={deliveryMethod}
                            onChange={(e) => setDeliveryMethod(e.target.value)}
                          >
                            <option value="">全て</option>
                            <option value="FACE_TO_FACE">対面</option>
                            <option value="ONLINE_REALTIME">オンライン (リアルタイム)</option>
                            <option value="ONLINE_ONDEMAND">オンライン (オンデマンド)</option>
                          </select>
                        </div>

                        {/* 授業言語 */}
                        <div>
                          <label className="block font-bold text-text-sub mb-1.5">授業言語</label>
                          <select
                            className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                          >
                            <option value="">全て</option>
                            <option value="JAPANESE">日本語</option>
                            <option value="ENGLISH">英語</option>
                          </select>
                        </div>

                        {/* 能動的学習 */}
                        <div>
                          <label className="block font-bold text-text-sub mb-1.5">能動的学修形式</label>
                          <select
                            className="w-full px-3 py-2 bg-background border border-border-main rounded-lg text-text-main focus:outline-none focus:border-keio-navy"
                            value={activeLearning}
                            onChange={(e) => setActiveLearning(e.target.value)}
                          >
                            <option value="">全て</option>
                            <option value="GROUP_WORK">グループワーク</option>
                            <option value="PRESENTATION">プレゼンテーション</option>
                            <option value="DISCUSSION">ディスカッション</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-keio-navy hover:bg-keio-navy/95 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    条件で検索する
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 右ペイン: 検索結果一覧 (フィルター非表示のときは全幅化) */}
        <div className="flex-grow space-y-4 w-full">
          <div className="flex justify-between items-center text-xs text-text-sub">
            <span>開講講義一覧: {lectures.length} 件</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-premium h-24 animate-pulse"></div>
              ))}
            </div>
          ) : lectures.length === 0 ? (
            <div className="card-premium p-16 text-center text-text-sub text-xs space-y-3">
              <p>該当する講義が見つかりませんでした。</p>
              <button
                onClick={() => setShowFilters(true)}
                className="text-keio-navy font-bold hover:underline"
              >
                検索条件を変更して探す
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {lectures.map((lec) => {
                const isExpanded = expandedLectureId === lec.id;
                const totalListings = lec.textbooks?.reduce((acc, tb) => acc + (tb.items?.length || 0), 0) || 0;

                return (
                  <div
                    key={lec.id}
                    className={`card-premium overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'ring-1 ring-keio-navy/30 border-keio-navy/30' : ''
                    }`}
                  >
                    {/* 講義ヘッダー行 */}
                    <div
                      onClick={() => setExpandedLectureId(isExpanded ? null : lec.id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-keio-navy bg-keio-navy/5 px-2 py-0.5 rounded border border-keio-navy/10">
                            {lec.faculty}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {getCampusLabel(lec.campus)}
                          </span>
                        </div>
                        <h4 className="font-bold text-text-main text-base leading-snug">{lec.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-text-sub">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-text-sub" />
                            {lec.teacher}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-text-sub" />
                            {getWeekdayPeriodLabel(lec.weekday, lec.period)}限
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs">
                        <div className="text-right">
                          <div className="font-bold text-text-main">教科書 {lec.textbooks?.length || 0} 冊</div>
                          <div className="text-[10px] text-keio-red font-semibold mt-0.5">出品中の中古 {totalListings} 件</div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-text-sub transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-keio-navy' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* アコーディオン展開部 (指定教科書 ➡ フリマ出品リスト) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border-main bg-slate-50/40 p-5 space-y-4"
                        >
                          <h5 className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                            📖 シラバス指定教科書・教材一覧
                          </h5>

                          {(!lec.textbooks || lec.textbooks.length === 0) ? (
                            <p className="text-xs text-text-sub italic">指定された教科書はありません。</p>
                          ) : (
                            <div className="space-y-4">
                              {lec.textbooks.map((tb) => (
                                <div key={tb.id} className="p-4 bg-surface border border-border-main rounded-xl space-y-3 shadow-sm">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <h6 className="font-bold text-sm text-text-main">{tb.title}</h6>
                                      <p className="text-xs text-text-sub mt-1">
                                        著者: {tb.author || '不明'} | 出版: {tb.publisher || '不明'} {tb.edition && `(${tb.edition})`}
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-mono text-text-sub bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                      ISBN: {tb.isbn || '未登録'}
                                    </span>
                                  </div>

                                  {/* 出品中アイテムリスト */}
                                  <div className="pt-3 border-t border-border-main/50 space-y-2">
                                    <div className="text-[10px] font-bold text-text-sub">出品中の中古本 ({tb.items?.length || 0}件)</div>
                                    
                                    {(!tb.items || tb.items.length === 0) ? (
                                      <p className="text-[11px] text-text-sub italic">現在、この教科書の出品はありません。</p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {tb.items.map((item: any) => (
                                          <Link
                                            key={item.id}
                                            to={`/items/${item.id}`}
                                            className="p-3 border border-border-main/60 hover:border-keio-navy/30 rounded-lg flex items-center justify-between gap-3 bg-slate-50/40 hover:bg-slate-50 transition"
                                          >
                                            <div className="min-w-0 text-xs">
                                              <div className="font-semibold text-text-main truncate">{item.title}</div>
                                              <div className="text-[10px] text-text-sub mt-1">状態: {
                                                item.condition === 'NEW' ? '新品同様' : item.condition === 'LIKE_NEW' ? '超美品' : '普通'
                                              }</div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span className="font-bold text-keio-red text-sm">¥{item.price.toLocaleString()}</span>
                                              <ArrowRight className="h-3.5 w-3.5 text-text-sub" />
                                            </div>
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Syllabus;
