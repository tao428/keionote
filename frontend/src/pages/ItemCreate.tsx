import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Lecture, Textbook } from '../types';
import { ArrowLeft, Upload, X, CheckCircle } from 'lucide-react';

export const ItemCreate: React.FC = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState('');
  const [availableTextbooks, setAvailableTextbooks] = useState<Textbook[]>([]);
  const [selectedTextbookId, setSelectedTextbookId] = useState('');

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

  // 講義一覧のフェッチ
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await fetch('/api/lectures');
        if (res.ok) {
          const data = await res.json();
          setLectures(data.lectures || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLectures();
  }, []);

  // 選択された講義に応じて教科書リストをアップデート
  useEffect(() => {
    if (!selectedLectureId) {
      setAvailableTextbooks([]);
      setSelectedTextbookId('');
      return;
    }
    const lec = lectures.find(l => l.id === selectedLectureId);
    setAvailableTextbooks(lec?.textbooks || []);
    setSelectedTextbookId('');
  }, [selectedLectureId, lectures]);

  // 画像が選択されたとき
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (images.length + selectedFiles.length > 10) {
        setError('アップロードできる画像は最大10枚までです。');
        return;
      }

      setError('');
      const newImages = [...images, ...selectedFiles];
      setImages(newImages);

      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  // 画像プレビューの削除
  const removePreview = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedTextbookId) {
      setError('該当する教科書を選択してください。');
      setLoading(false);
      return;
    }

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
    formData.append('textbookId', selectedTextbookId);
    
    images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        body: formData // Content-Typeは自動的にmultipart/form-dataになる
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition text-sm">
        <ArrowLeft className="h-4 w-4" /> ホームへ戻る
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative">
        <h2 className="text-2xl font-black text-slate-100 mb-6">教科書・教材を出品する</h2>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-400 animate-bounce" />
            <h3 className="text-xl font-bold text-slate-100">出品が完了しました！</h3>
            <p className="text-sm text-slate-400">まもなくホーム画面へリダイレクトされます...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 授業＆教科書選択 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">講義名</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm"
                  value={selectedLectureId}
                  onChange={(e) => setSelectedLectureId(e.target.value)}
                >
                  <option value="" className="bg-slate-900">選択してください</option>
                  {lectures.map((lec) => (
                    <option key={lec.id} value={lec.id} className="bg-slate-900">
                      {lec.name} ({lec.teacher})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">対象教科書</label>
                <select
                  required
                  disabled={!selectedLectureId}
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm disabled:opacity-40"
                  value={selectedTextbookId}
                  onChange={(e) => setSelectedTextbookId(e.target.value)}
                >
                  <option value="" className="bg-slate-900">選択してください</option>
                  {availableTextbooks.map((tb) => (
                    <option key={tb.id} value={tb.id} className="bg-slate-900">
                      {tb.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 商品タイトル */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">出品タイトル</label>
              <input
                type="text"
                required
                placeholder="例: 【理工学部】プログラミング基礎 教科書（美品）"
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 商品の状態 ＆ 価格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">商品の状態</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="NEW" className="bg-slate-900">新品同様 (ほぼ未使用)</option>
                  <option value="LIKE_NEW" className="bg-slate-900">未使用に近い (非常にきれい)</option>
                  <option value="GOOD" className="bg-slate-900">目立った傷や汚れなし (並品)</option>
                  <option value="USED" className="bg-slate-900">やや傷や汚れあり (書き込み等)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">販売価格 (¥)</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="例: 1500"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {/* 商品説明 */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">商品説明</label>
              <textarea
                required
                rows={5}
                placeholder="書き込みの有無、日焼けの状態、受け渡し可能な曜日や時間帯などを記載すると取引がスムーズになります。"
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* 画像アップロード (最大10枚) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">商品画像 (最大10枚、複数選択可能)</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-white/5 group">
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
                  <label className="flex flex-col items-center justify-center aspect-square bg-slate-950/40 border border-dashed border-slate-800 rounded-xl cursor-pointer hover:border-slate-600 hover:bg-slate-900/20 transition">
                    <Upload className="h-6 w-6 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-bold mt-1.5">追加 ({previews.length}/10)</span>
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

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? '出品処理中...' : 'この内容で出品する'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
