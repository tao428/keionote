import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lecture, Textbook } from '../types';
import { ArrowLeft, Upload, X, CheckCircle, BookOpen, User, Calendar, SlidersHorizontal } from 'lucide-react';

export const ItemCreate: React.FC = () => {
  // 出品ステップ管理: 'LECTURE_SEARCH' | 'TEXTBOOK_SELECT' | 'ITEM_FORM'
  const [step, setStep] = useState<'LECTURE_SEARCH' | 'TEXTBOOK_SELECT' | 'ITEM_FORM'>('LECTURE_SEARCH');

  // シラバス講義検索関連
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // 検索クエリ条件
  const [year, setYear] = useState('2026');
  const [semester] = useState('ALL');
  const [campus, setCampus] = useState('ALL');
  const [faculty, setFaculty] = useState('ALL');
  const [department] = useState('');
  const [grade, setGrade] = useState('');
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [keywords] = useState('');
  const [weekday, setWeekday] = useState('');
  const [period, setPeriod] = useState('');
  const [language] = useState('');
  const [field] = useState('');
  const [deliveryMethod] = useState('');
  const [activeLearning] = useState('');

  // 選択された講義 & 教科書
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null);

  // 商品詳細入力関連
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // シラバス講義検索の実行
  const handleLectureSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoadingLectures(true);
    try {
      const query = new URLSearchParams();
      if (year) query.append('year', year);
      if (semester && semester !== 'ALL') query.append('semester', semester);
      if (campus && campus !== 'ALL') query.append('campus', campus);
      if (faculty && faculty !== 'ALL') query.append('faculty', faculty);
      if (department) query.append('department', department);
      if (grade) query.append('grade', grade);
      if (name) query.append('name', name);
      if (teacher) query.append('teacher', teacher);
      if (keywords) query.append('keywords', keywords);
      if (weekday) query.append('weekday', weekday);
      if (period) query.append('period', period);
      if (language) query.append('language', language);
      if (field) query.append('field', field);
      if (deliveryMethod) query.append('deliveryMethod', deliveryMethod);
      if (activeLearning) query.append('activeLearning', activeLearning);

      const res = await fetch(`/api/lectures?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLectures(data.lectures || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLectures(false);
    }
  };

  // 初期読み込み時に検索を実行
  useEffect(() => {
    handleLectureSearch();
  }, []);

  // 講義の選択
  const handleSelectLecture = (lec: Lecture) => {
    setSelectedLecture(lec);
    setStep('TEXTBOOK_SELECT');
  };

  // 教科書の選択
  const handleSelectTextbook = (tb: Textbook) => {
    setSelectedTextbook(tb);
    // 出品タイトルのデフォルト設定
    setTitle(`『${tb.title}』中古本 - ${selectedLecture?.name || ''}`);
    setStep('ITEM_FORM');
  };

  // 画像選択処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 10) {
        setError('画像は最大10枚までアップロード可能です。');
        return;
      }
      setError('');
      setImages([...images, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  // 画像削除
  const removePreview = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  // 出品リクエストの送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTextbook) return;
    setError('');
    setLoading(true);

    if (images.length === 0) {
      setError('少なくとも1枚以上の商品写真をアップロードしてください。');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('condition', condition);
    formData.append('textbookId', selectedTextbook.id);
    
    images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '出品に失敗しました。');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeekdayPeriodLabel = (day: string, per: number) => {
    const dayLabel = { MON: '月', TUE: '火', WED: '水', THU: '木', FRI: '金', SAT: '土' }[day] || day;
    return `${dayLabel}${per}`;
  };

  const getCampusLabel = (val: string) => {
    return { HIYOSHI: '日吉', MITA: '三田', YAGAMI: '矢上', SFC: 'SFC', SHINANOMACHI: '信濃町', SHIBA: '芝共立' }[val] || val;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 戻る */}
      <button
        onClick={() => {
          if (step === 'ITEM_FORM') setStep('TEXTBOOK_SELECT');
          else if (step === 'TEXTBOOK_SELECT') setStep('LECTURE_SEARCH');
          else navigate('/');
        }}
        className="inline-flex items-center gap-1.5 text-text-sub hover:text-keio-navy transition text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> 
        {step === 'LECTURE_SEARCH' ? 'ホームへ戻る' : '前のステップへ戻る'}
      </button>

      {/* プログレスバー表示 */}
      <div className="flex items-center justify-between text-[11px] font-bold text-text-sub bg-surface border border-border-main p-4 rounded-2xl shadow-sm">
        <span className={step === 'LECTURE_SEARCH' ? 'text-keio-navy' : ''}>1. 講義検索</span>
        <span className="text-slate-300">➡</span>
        <span className={step === 'TEXTBOOK_SELECT' ? 'text-keio-navy' : ''}>2. 教科書選択</span>
        <span className="text-slate-300">➡</span>
        <span className={step === 'ITEM_FORM' ? 'text-keio-navy' : ''}>3. 商品情報入力</span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 text-xs">
          {error}
        </div>
      )}

      {/* ステップ1: 講義検索 */}
      {step === 'LECTURE_SEARCH' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
            <div>
              <h2 className="text-xl font-bold text-keio-navy flex items-center gap-2">
                <BookOpen className="h-5.5 w-5.5" />
                シラバスから開講講義を検索
              </h2>
              <p className="text-[11px] text-text-sub mt-0.5">
                出品したい教科書が指定されている授業を検索して選択してください。
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                showFilters ? 'bg-keio-navy text-white' : 'bg-surface text-keio-navy border-border-main'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              条件フィルター
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* 検索パネル */}
            {showFilters && (
              <form onSubmit={handleLectureSearch} className="w-full lg:w-[280px] shrink-0 card-premium p-5 space-y-4 bg-surface text-[11px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-text-sub mb-1">年度</label>
                    <select
                      className="w-full px-2 py-1.5 bg-background border border-border-main rounded-md text-text-main"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-text-sub mb-1">配当学年</label>
                    <select
                      className="w-full px-2 py-1.5 bg-background border border-border-main rounded-md text-text-main"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    >
                      <option value="">全て</option>
                      {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}年</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-text-sub mb-1">科目名</label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 bg-background border border-border-main rounded-md text-text-main"
                    placeholder="例: 微分積分"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-text-sub mb-1">担当教員</label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 bg-background border border-border-main rounded-md text-text-main"
                    placeholder="例: 福澤"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-text-sub mb-1">学部</label>
                    <select
                      className="w-full px-2 py-1.5 bg-background border border-border-main rounded-md text-text-main"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                    >
                      <option value="ALL">全学部</option>
                      <option value="理工学部">理工学部</option>
                      <option value="経済学部">経済学部</option>
                      <option value="商学部">商学部</option>
                      <option value="法学部">法学部</option>
                      <option value="文学部">文学部</option>
                      <option value="環境情報学部">環境情報学部</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-text-sub mb-1">キャンパス</label>
                    <select
                      className="w-full px-2 py-1.5 bg-background border border-border-main rounded-md text-text-main"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                    >
                      <option value="ALL">全て</option>
                      <option value="HIYOSHI">日吉</option>
                      <option value="MITA">三田</option>
                      <option value="YAGAMI">矢上</option>
                      <option value="SFC">SFC</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-text-sub mb-1">曜日</label>
                    <select
                      className="w-full px-2 py-1.5 bg-background border border-border-main rounded-md text-text-main"
                      value={weekday}
                      onChange={(e) => setWeekday(e.target.value)}
                    >
                      <option value="">全て</option>
                      <option value="MON">月曜</option>
                      <option value="TUE">火曜</option>
                      <option value="WED">水曜</option>
                      <option value="THU">木曜</option>
                      <option value="FRI">金曜</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-text-sub mb-1">時限</label>
                    <select
                      className="w-full px-2 py-1.5 bg-background border border-border-main rounded-md text-text-main"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                    >
                      <option value="">全て</option>
                      {[1,2,3,4,5,6,7].map(p => <option key={p} value={p}>{p}限</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-keio-navy hover:bg-keio-red text-white font-bold rounded-lg transition"
                >
                  検索する
                </button>
              </form>
            )}

            {/* 結果リスト */}
            <div className="flex-grow w-full space-y-4">
              {loadingLectures ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="card-premium h-20 animate-pulse bg-surface"></div>)}
                </div>
              ) : lectures.length === 0 ? (
                <div className="card-premium p-8 text-center text-text-sub text-xs bg-surface">
                  講義が見つかりませんでした。条件を変更してください。
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {lectures.map((lec) => (
                    <div key={lec.id} className="card-premium p-5 bg-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-bold text-keio-navy bg-keio-navy/5 px-2 py-0.5 rounded border border-keio-navy/10">
                            {lec.faculty}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {getCampusLabel(lec.campus)}
                          </span>
                        </div>
                        <h4 className="font-bold text-text-main text-sm leading-snug">{lec.name}</h4>
                        <div className="flex items-center gap-4 text-[10px] text-text-sub">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{lec.teacher}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{getWeekdayPeriodLabel(lec.weekday, lec.period)}限</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectLecture(lec)}
                        className="px-4 py-2 rounded-xl bg-keio-navy hover:bg-keio-red text-white text-xs font-bold shadow-sm transition shrink-0"
                      >
                        この講義を選択
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ステップ2: 教科書選択 */}
      {step === 'TEXTBOOK_SELECT' && selectedLecture && (
        <div className="space-y-6">
          <div className="border-b border-border-main pb-4">
            <h2 className="text-xl font-bold text-keio-navy flex items-center gap-2">
              <BookOpen className="h-5.5 w-5.5" />
              対象の指定教科書を選択
            </h2>
            <p className="text-[11px] text-text-sub mt-0.5">
              選択中: <span className="font-bold text-text-main">{selectedLecture.name}</span>
            </p>
          </div>

          {(!selectedLecture.textbooks || selectedLecture.textbooks.length === 0) ? (
            <div className="card-premium p-12 text-center text-text-sub text-xs bg-surface space-y-3">
              <p>この講義にはシラバス指定教科書が登録されていません。</p>
              <button
                onClick={() => setStep('LECTURE_SEARCH')}
                className="text-keio-navy font-bold hover:underline"
              >
                別の講義を検索する
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedLecture.textbooks.map((tb) => (
                <div key={tb.id} className="card-premium p-5 bg-surface flex flex-col justify-between h-40">
                  <div>
                    <h4 className="font-bold text-text-main text-xs sm:text-sm line-clamp-2">{tb.title}</h4>
                    <p className="text-[10px] text-text-sub mt-1.5">
                      著者: {tb.author || '不明'} | 出版: {tb.publisher || '不明'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectTextbook(tb)}
                    className="w-full py-2 rounded-xl bg-keio-navy hover:bg-keio-red text-white text-xs font-bold transition shadow-sm"
                  >
                    この教材を出品する
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ステップ3: 商品情報入力 */}
      {step === 'ITEM_FORM' && selectedTextbook && (
        <div className="card-premium p-8 bg-surface space-y-6 relative border border-border-main/60 rounded-3xl shadow-xl">
          <div className="border-b border-border-main pb-4">
            <h2 className="text-xl font-bold text-keio-navy">商品情報の入力</h2>
            <div className="text-[11px] text-text-sub mt-1 space-y-0.5">
              <div>講義: <span className="font-bold text-text-main">{selectedLecture?.name}</span></div>
              <div>教材: <span className="font-bold text-text-main">{selectedTextbook.title}</span></div>
            </div>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
              <h3 className="text-base font-bold text-text-main">出品が完了しました！</h3>
              <p className="text-xs text-text-sub">まもなくホーム画面へリダイレクトされます...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs text-text-main">
              {/* 出品タイトル */}
              <div>
                <label className="block font-bold text-text-sub mb-2">出品タイトル</label>
                <input
                  type="text"
                  required
                  placeholder="例: 【理工学部】プログラミング基礎 教科書（美品）"
                  className="w-full px-4 py-3 bg-white border border-border-main rounded-xl focus:outline-none focus:border-keio-navy text-text-main text-xs shadow-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* 状態 ＆ 価格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-text-sub mb-2">商品の状態</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-white border border-border-main rounded-xl focus:outline-none focus:border-keio-navy text-text-main text-xs shadow-sm"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="NEW">新品同様 (ほぼ未使用)</option>
                    <option value="LIKE_NEW">未使用に近い (非常にきれい)</option>
                    <option value="GOOD">目立った傷や汚れなし (並品)</option>
                    <option value="USED">やや傷や汚れあり (書き込み等)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-text-sub mb-2">販売価格 (¥)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="例: 1500"
                    className="w-full px-4 py-3 bg-white border border-border-main rounded-xl focus:outline-none focus:border-keio-navy text-text-main text-xs shadow-sm"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* 説明 */}
              <div>
                <label className="block font-bold text-text-sub mb-2">商品説明</label>
                <textarea
                  required
                  rows={5}
                  placeholder="書き込みの有無、日焼けの状態、受け渡し可能な曜日や時間帯などを記載すると取引がスムーズになります。"
                  className="w-full px-4 py-3 bg-white border border-border-main rounded-xl focus:outline-none focus:border-keio-navy text-text-main text-xs resize-none shadow-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* 画像 */}
              <div>
                <label className="block font-bold text-text-sub mb-2">商品画像 (最大10枚、複数選択可能)</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-border-main group shadow-sm">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePreview(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white opacity-90 hover:opacity-100 transition shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {previews.length < 10 && (
                    <label className="flex flex-col items-center justify-center aspect-square bg-slate-50 border border-dashed border-border-main rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-100/50 transition">
                      <Upload className="h-5 w-5 text-text-sub" />
                      <span className="text-[10px] text-text-sub font-bold mt-1.5">追加 ({previews.length}/10)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 出品実行ボタン (ホバー時に赤アクセント) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-keio-navy hover:bg-keio-red text-white font-bold transition shadow-md disabled:opacity-50 text-xs"
              >
                {loading ? '出品処理中...' : 'この内容で出品する'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCreate;
