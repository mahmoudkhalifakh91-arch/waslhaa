
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
import type { Ad, User } from '../types';

// Utils
import { stripFirestore, compressImage } from '../utils';

// Services
import { db } from '../services/firebase';
import { 
  collection, doc, onSnapshot, 
  setDoc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Icons
import { 
  ArrowRight, Megaphone, Plus, X, Trash2, 
  Camera, Loader2, Save, CheckCircle2, 
  PlusCircle, Eye, MousePointer2, Image as ImageIcon, Edit3, Type,
  EyeOff, SortAsc, Smartphone
} from 'lucide-react';

const AdminAdsManager: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const initialAdState: Partial<Ad> = {
    title: '', 
    description: '', 
    imageUrl: '', 
    type: 'special_offer', 
    isActive: true, 
    displayOrder: 0, 
    whatsappNumber: '',
    ctaText: 'استفد من العرض الآن'
  };

  const [adData, setAdData] = useState<Partial<Ad>>(initialAdState);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "ads"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Ad[];
      setAds(list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      setAdData(prev => ({ ...prev, imageUrl: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (ad: Ad) => {
    setAdData(stripFirestore(ad));
    setEditingId(ad.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAdStatus = async (ad: Ad) => {
    try {
      await updateDoc(doc(db, "ads", ad.id), { isActive: !ad.isActive });
    } catch (e) { alert('خطأ في تغيير حالة الإعلان'); }
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setAdData(initialAdState);
  };

  const saveAd = async () => {
    if (!adData.title || !adData.imageUrl) {
      alert('يرجى كتابة العنوان ورفع صورة العرض');
      return;
    }
    setLoading(true);
    try {
      const id = editingId || `ad_${Date.now()}`;
      const finalData = { 
        ...adData, 
        id, 
        createdAt: adData.createdAt || Date.now(), 
        views: adData.views || 0, 
        clicks: adData.clicks || 0,
        whatsappNumber: adData.whatsappNumber?.replace(/\s/g, '') || '',
        ctaText: adData.ctaText || 'استفد من العرض الآن',
        displayOrder: Number(adData.displayOrder) || 0,
        isActive: adData.isActive ?? true
      };
      
      await setDoc(doc(db, "ads", id), stripFirestore(finalData));
      
      cancelForm();
      alert(editingId ? 'تم تحديث العرض' : 'تم نشر العرض بنجاح');
    } catch (e) { 
      alert('خطأ في الحفظ'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-700 text-right pb-32" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex items-center gap-5">
           <div className="bg-amber-500 p-4 rounded-3xl text-white shadow-xl">
              <Megaphone className="h-8 w-8" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">إدارة الإعلانات</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">تحكم في ظهور العروض الترويجية</p>
           </div>
        </div>
        <button onClick={() => navigate('/')} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-amber-600 flex items-center gap-2 transition-all">
          <span className="font-black text-xs">رجوع</span>
          <ArrowRight className="h-5 w-5 rotate-180" />
        </button>
      </div>

      {!isAdding ? (
        <button onClick={() => setIsAdding(true)} className="w-full bg-slate-950 text-white p-10 rounded-[3.5rem] font-black text-xl flex items-center justify-center gap-5 shadow-2xl active:scale-95 transition-all group relative overflow-hidden">
           <PlusCircle className="h-8 w-8 text-white" /> 
           <span className="relative z-10">إضافة إعلان جديد للسلايدر</span>
        </button>
      ) : (
        <div className="bg-white p-8 md:p-12 rounded-[4rem] shadow-2xl space-y-10 animate-in zoom-in border-4 border-amber-50 relative overflow-hidden">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">
                 {editingId ? 'تعديل الإعلان' : 'تصميم إعلان جديد'}
              </h3>
              <button onClick={cancelForm} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><X /></button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div onClick={() => fileRef.current?.click()} className="w-full aspect-[21/9] bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-amber-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group shadow-inner">
                    {adData.imageUrl ? (
                       <>
                         <img src={adData.imageUrl} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-xs">تغيير الصورة</div>
                       </>
                    ) : (
                       <>
                         <Camera className="h-12 w-12 text-amber-200 mb-2" />
                         <p className="text-[9px] font-black text-amber-300 uppercase">صورة العرض (21:9)</p>
                       </>
                    )}
                    <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>

                 <div className="space-y-4">
                    <input value={adData.title} onChange={e => setAdData({...adData, title: e.target.value})} placeholder="العنوان" className="w-full bg-slate-50 rounded-2xl p-5 font-black text-sm outline-none border-2 border-transparent focus:border-amber-500 transition-all shadow-inner" />
                    <textarea value={adData.description} onChange={e => setAdData({...adData, description: e.target.value})} placeholder="وصف العرض.." className="w-full bg-slate-50 rounded-[2rem] p-7 font-bold text-sm outline-none border-2 border-transparent focus:border-amber-500 min-h-[160px] shadow-inner" />
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <input value={adData.ctaText} onChange={e => setAdData({...adData, ctaText: e.target.value})} placeholder="نص الزر (اطلب الآن)" className="w-full bg-slate-50 rounded-2xl p-5 font-black text-xs outline-none border border-slate-100 shadow-sm" />
                    <input value={adData.whatsappNumber} onChange={e => setAdData({...adData, whatsappNumber: e.target.value})} placeholder="واتساب (2010...)" className="w-full bg-slate-50 rounded-2xl p-5 font-black text-xs outline-none text-left border border-slate-100 shadow-sm" dir="ltr" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={adData.displayOrder} onChange={e => setAdData({...adData, displayOrder: parseInt(e.target.value) || 0})} placeholder="الترتيب" className="w-full bg-slate-50 rounded-2xl p-5 font-black text-xs outline-none border border-slate-100 shadow-sm" />
                    <button 
                      type="button"
                      onClick={() => setAdData({...adData, isActive: !adData.isActive})}
                      className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-3 transition-all shadow-md ${adData.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}
                    >
                       {adData.isActive ? 'نشط' : 'مخفي'}
                    </button>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button onClick={cancelForm} className="flex-1 bg-slate-50 text-slate-400 py-6 rounded-3xl font-black text-sm">إلغاء</button>
                    <button onClick={saveAd} disabled={loading} className="flex-[2] bg-amber-500 text-white py-6 rounded-3xl font-black text-sm shadow-xl shadow-amber-900/10 active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : (editingId ? 'حفظ التغييرات' : 'نشر الإعلان')}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {ads.map(ad => (
           <div key={ad.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden group hover:border-amber-500 transition-all flex flex-col animate-reveal">
              <div className="relative aspect-[21/9] overflow-hidden shrink-0">
                 <img src={ad.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute top-5 left-5 flex gap-2">
                    <button onClick={() => startEdit(ad)} className="bg-white/30 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/50 transition-all shadow-lg"><Edit3 className="h-5 w-5" /></button>
                    <button onClick={async () => { if(confirm('حذف الإعلان؟')) await deleteDoc(doc(db, "ads", ad.id)); }} className="bg-rose-500/30 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-rose-500 transition-all shadow-lg"><Trash2 className="h-5 w-5" /></button>
                 </div>
                 {!ad.isActive && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center text-white p-6">
                       <span className="font-black text-[10px] uppercase">الإعلان مخفي حالياً</span>
                    </div>
                 )}
              </div>
              <div className="p-8 space-y-6 flex-1 flex flex-col">
                 <div className="flex justify-between items-center text-[9px] font-black text-slate-300">
                    <div className="flex items-center gap-2"><SortAsc className="h-3 w-3" /> الترتيب: {ad.displayOrder || 0}</div>
                    <span>{new Date(ad.createdAt).toLocaleDateString('ar-EG')}</span>
                 </div>
                 <h4 className="font-black text-xl text-slate-900 line-clamp-1">{ad.title}</h4>
                 <div className="pt-5 border-t border-slate-50 flex justify-around items-center mt-auto">
                    <div className="text-center"><p className="text-lg font-black text-slate-800">{ad.views || 0}</p><span className="text-[8px] font-bold text-slate-400 uppercase">مشاهدة</span></div>
                    <div className="w-[1px] h-8 bg-slate-100"></div>
                    <div className="text-center"><p className="text-lg font-black text-slate-800">{ad.clicks || 0}</p><span className="text-[8px] font-bold text-slate-400 uppercase">نقرة</span></div>
                    <div className="w-[1px] h-8 bg-slate-100"></div>
                    <button onClick={() => toggleAdStatus(ad)} className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase transition-all shadow-sm ${ad.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                       {ad.isActive ? 'إخفاء' : 'إظهار'}
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default AdminAdsManager;
