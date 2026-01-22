
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
import type { Restaurant, User, District, Village } from '../types';
import { MENOFIA_DATA } from '../config/constants';

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
  ArrowRight, Store, Plus, X, Trash2, Edit3, 
  Camera, FileText, Loader2, Save, Utensils,
  PlusCircle, Building2, Search, MapPin, ChevronDown,
  ArrowDown, ArrowUp, Star, Layout, Image as ImageIcon, SortAsc,
  CheckCircle2, Eye, EyeOff, Sparkles, ImagePlus
} from 'lucide-react';

const AdminRestaurantManager: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

  const initialRestState = { 
    name: '', 
    category: 'مشويات', 
    photoURL: '', 
    menuImageURL: '', 
    address: '',
    isFeatured: false,
    displayOrder: 0,
    isOpen: true
  };

  const [restData, setRestData] = useState(initialRestState);
  const [newItem, setNewItem] = useState({ name: '', price: 0, photoURL: '' });
  const [activeRestId, setActiveRestId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const menuImgRef = useRef<HTMLInputElement>(null);
  const itemFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // تم إلغاء orderBy من الاستعلام المباشر لضمان ظهور المطاعم التي لا تملك حقل displayOrder
    return onSnapshot(collection(db, "restaurants"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Restaurant[];
      // الترتيب برمجياً (0 يظهر أولاً)
      setRestaurants(list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'PHOTO' | 'MENU' | 'ITEM') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const originalBase64 = reader.result as string;
      const compressed = await compressImage(originalBase64);
      
      if (target === 'PHOTO') setRestData(prev => ({ ...prev, photoURL: compressed }));
      if (target === 'MENU') setRestData(prev => ({ ...prev, menuImageURL: compressed }));
      if (target === 'ITEM') setNewItem(prev => ({ ...prev, photoURL: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (rest: Restaurant) => {
    setEditingId(rest.id);
    setRestData({
      name: rest.name, 
      category: rest.category, 
      photoURL: rest.photoURL || '',
      menuImageURL: rest.menuImageURL || '', 
      address: rest.address,
      isFeatured: rest.isFeatured || false,
      displayOrder: rest.displayOrder || 0,
      isOpen: rest.isOpen ?? true
    });
    
    const foundDistrict = MENOFIA_DATA.find(d => d.villages.some(v => v.name === rest.address));
    if (foundDistrict) {
      setSelectedDistrict(foundDistrict);
      const foundVillage = foundDistrict.villages.find(v => v.name === rest.address);
      if (foundVillage) setSelectedVillage(foundVillage);
    }

    setIsAdding(true);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveRestaurant = async () => {
    if (!restData.name || !selectedVillage) return alert('يرجى كتابة الاسم واختيار القرية');
    setLoading(true);
    try {
      const id = editingId || `rest_${Date.now()}`;
      const existingRest = restaurants.find(r => r.id === id);
      
      const finalData = stripFirestore({
        ...restData,
        id,
        address: selectedVillage.name,
        lat: selectedVillage.center.lat,
        lng: selectedVillage.center.lng,
        menu: existingRest?.menu || [],
        displayOrder: Number(restData.displayOrder) || 0
      });

      await setDoc(doc(db, "restaurants", id), finalData);
      
      setIsAdding(false);
      setEditingId(null);
      setRestData(initialRestState);
      alert(editingId ? 'تم تحديث بيانات المطعم' : 'تم إضافة المطعم بنجاح');
    } catch (e) { 
      alert('خطأ في الحفظ'); 
    } finally { 
      setLoading(false); 
    }
  };

  const addMenuItem = async (rid: string) => {
    if (!newItem.name || newItem.price <= 0) return;
    const rest = restaurants.find(r => r.id === rid);
    if (!rest) return;
    try {
      const menu = [...(rest.menu || []), { ...newItem, id: `item_${Date.now()}` }];
      await updateDoc(doc(db, "restaurants", rid), { menu: stripFirestore(menu) });
      setNewItem({ name: '', price: 0, photoURL: '' });
    } catch (e) { alert('فشل إضافة الوجبة'); }
  };

  const toggleRestaurantStatus = async (rest: Restaurant) => {
    try {
      await updateDoc(doc(db, "restaurants", rest.id), { isOpen: !rest.isOpen });
    } catch (e) { alert('فشل تغيير الحالة'); }
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-[#f8fafc] text-right" dir="rtl">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 pb-40">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
             <div className="bg-emerald-600 p-4 rounded-3xl text-white shadow-xl shadow-emerald-900/10">
                <Store className="h-8 w-8" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">إدارة المطاعم</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">المطاعم المسجلة: {restaurants.length}</p>
             </div>
          </div>
          <button onClick={() => navigate('/')} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-emerald-600 flex items-center gap-2 transition-all">
            <span className="font-black text-xs">رجوع</span>
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-[100] backdrop-blur-xl bg-white/90">
           <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="بحث بالاسم..." className="w-full bg-slate-50 rounded-[1.8rem] py-4 pr-14 pl-6 font-black text-xs outline-none focus:bg-white transition-all shadow-inner" />
           </div>
           {!isAdding && (
             <button onClick={() => setIsAdding(true)} className="bg-slate-950 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs flex items-center gap-3 active:scale-95 transition-all shadow-lg">
               <PlusCircle className="h-4 w-4" /> إضافة مطعم جديد
             </button>
           )}
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-white p-8 md:p-12 rounded-[4rem] shadow-2xl space-y-10 animate-in zoom-in border-4 border-emerald-50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl"></div>
             
             <div className="flex justify-between items-center relative z-10">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                   {editingId ? <Edit3 className="text-emerald-600" /> : <Sparkles className="text-emerald-600" />}
                   {editingId ? 'تعديل بيانات المطعم' : 'إدراج مطعم جديد'}
                </h3>
                <button onClick={() => { setIsAdding(false); setEditingId(null); setRestData(initialRestState); }} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"><X /></button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Images */}
                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => fileRef.current?.click()} className="aspect-video bg-slate-50 rounded-[2rem] border-4 border-dashed border-emerald-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
                         {restData.photoURL ? (
                            <>
                              <img src={restData.photoURL} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-[10px]">تغيير البانر</div>
                            </>
                         ) : (
                            <>
                              <Camera className="h-8 w-8 text-emerald-200 mb-2" />
                              <p className="text-[9px] font-black text-emerald-300 uppercase">صورة البانر</p>
                            </>
                         )}
                         <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'PHOTO')} />
                      </div>

                      <div onClick={() => menuImgRef.current?.click()} className="aspect-video bg-slate-50 rounded-[2rem] border-4 border-dashed border-amber-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
                         {restData.menuImageURL ? (
                            <>
                              <img src={restData.menuImageURL} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-[10px]">تغيير المنيو</div>
                            </>
                         ) : (
                            <>
                              <FileText className="h-8 w-8 text-amber-200 mb-2" />
                              <p className="text-[9px] font-black text-amber-300 uppercase">المنيو الورقي</p>
                            </>
                         )}
                         <input type="file" ref={menuImgRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'MENU')} />
                      </div>
                   </div>
                   
                   <div className="flex gap-4">
                      <div className="flex-1 bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                         <div className="text-right">
                            <h5 className="font-black text-xs text-emerald-800 uppercase">تمييز المطعم؟</h5>
                            <p className="text-[8px] font-bold text-emerald-600 mt-1">سيظهر في مقدمة صفحة الطعام</p>
                         </div>
                         <button 
                            type="button"
                            onClick={() => setRestData({...restData, isFeatured: !restData.isFeatured})}
                            className={`w-14 h-7 rounded-full transition-all relative ${restData.isFeatured ? 'bg-emerald-500' : 'bg-slate-200'}`}
                         >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${restData.isFeatured ? 'right-1' : 'right-8'}`}></div>
                         </button>
                      </div>
                   </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 mr-4 uppercase">اسم المطعم</label>
                        <input value={restData.name} onChange={e => setRestData({...restData, name: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-emerald-500 transition-all shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 mr-4 uppercase">التصنيف</label>
                        <input value={restData.category} onChange={e => setRestData({...restData, category: e.target.value})} placeholder="بيتزا، كريب.." className="w-full bg-slate-50 p-5 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-emerald-500 transition-all shadow-inner" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 mr-4 uppercase">المركز</label>
                        <select value={selectedDistrict?.id || ''} onChange={e => setSelectedDistrict(MENOFIA_DATA.find(d => d.id === e.target.value) || null)} className="w-full bg-slate-50 p-5 rounded-2xl font-black text-sm outline-none appearance-none border-2 border-transparent focus:border-emerald-500">
                           <option value="">اختر المركز...</option>
                           {MENOFIA_DATA.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 mr-4 uppercase">القرية</label>
                        <select value={selectedVillage?.id || ''} disabled={!selectedDistrict} onChange={e => setSelectedVillage(selectedDistrict?.villages.find(v => v.id === e.target.value) || null)} className="w-full bg-slate-50 p-5 rounded-2xl font-black text-sm outline-none appearance-none border-2 border-transparent focus:border-emerald-500 disabled:opacity-50">
                           <option value="">اختر القرية...</option>
                           {selectedDistrict?.villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 mr-4 uppercase flex items-center gap-2">
                         <SortAsc className="h-3 w-3" /> أولوية الظهور (0 = الأعلى)
                      </label>
                      <input type="number" value={restData.displayOrder} onChange={e => setRestData({...restData, displayOrder: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 p-5 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-emerald-500 transition-all" />
                   </div>

                   <button onClick={saveRestaurant} disabled={loading} className="w-full bg-emerald-600 text-white py-7 rounded-[2rem] font-black text-xl active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl">
                      {loading ? <Loader2 className="animate-spin h-7 w-7" /> : <><Save /> {editingId ? 'حفظ التعديلات' : 'إضافة المطعم'}</>}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {restaurants.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map(rest => (
             <div key={rest.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden group hover:border-emerald-500 transition-all animate-reveal flex flex-col">
                <div className="relative h-56 overflow-hidden shrink-0">
                   {rest.photoURL ? (
                      <img src={rest.photoURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-emerald-900/20"><Building2 className="h-16 w-16" /></div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                   
                   <div className="absolute top-6 left-6 flex gap-2">
                      <button onClick={() => startEdit(rest)} className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-emerald-500 transition-all shadow-lg"><Edit3 className="h-5 w-5" /></button>
                      <button onClick={async () => { if(confirm(`حذف مطعم ${rest.name}؟`)) await deleteDoc(doc(db, "restaurants", rest.id)); }} className="bg-rose-500/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-rose-500 transition-all shadow-lg"><Trash2 className="h-5 w-5" /></button>
                   </div>

                   <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                      {rest.isFeatured && <div className="bg-amber-400 text-white px-3 py-1 rounded-full text-[8px] font-black shadow-lg flex items-center gap-1 uppercase tracking-widest"><Star className="h-3 w-3 fill-white" /> مميز</div>}
                      <button 
                        onClick={() => toggleRestaurantStatus(rest)}
                        className={`px-3 py-1 rounded-full text-[8px] font-black shadow-lg uppercase tracking-widest transition-all ${rest.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
                      >
                         {rest.isOpen ? 'مفتوح' : 'مغلق'}
                      </button>
                   </div>

                   <div className="absolute bottom-8 right-8 text-right text-white">
                      <h4 className="font-black text-2xl tracking-tighter">{rest.name}</h4>
                      <p className="text-[10px] font-bold opacity-70 flex items-center gap-1 justify-end mt-1"><MapPin className="h-3 w-3" /> {rest.address}</p>
                   </div>
                </div>

                <div className="p-8 space-y-8 flex-1">
                   <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-[9px] font-black text-slate-400">
                         <SortAsc className="h-3 w-3" /> الترتيب: {rest.displayOrder || 0}
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black">{rest.category}</span>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الوجبات الرقمية ({rest.menu?.length || 0})</h5>
                         {rest.menuImageURL && <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-lg"><FileText className="h-3 w-3" /> منيو ورقي متاح</div>}
                      </div>
                      
                      <div className="grid gap-3 max-h-64 overflow-y-auto no-scrollbar border-r-4 border-slate-50 pr-2">
                         {rest.menu?.map(item => (
                           <div key={item.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center flex-row-reverse group/item">
                              <div className="flex items-center gap-4 flex-row-reverse text-right">
                                 <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                                    {item.photoURL ? <img src={item.photoURL} className="w-full h-full object-cover" /> : <Utensils className="p-3 text-slate-200" />}
                                 </div>
                                 <div>
                                    <p className="font-black text-xs text-slate-800">{item.name}</p>
                                    <p className="text-[10px] font-bold text-emerald-600">{item.price} ج.م</p>
                                 </div>
                              </div>
                              <button onClick={async () => { const menu = rest.menu.filter(i => i.id !== item.id); await updateDoc(doc(db, "restaurants", rest.id), { menu: stripFirestore(menu) }); }} className="p-2 text-rose-200 hover:text-rose-500 transition-all"><X className="h-4 w-4" /></button>
                           </div>
                         ))}
                      </div>

                      <div className="bg-slate-950 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
                         <div className="flex gap-3 flex-row-reverse">
                            <div onClick={() => { setActiveRestId(rest.id); itemFileRef.current?.click(); }} className="w-14 h-14 bg-white/5 rounded-2xl border-2 border-dashed border-emerald-400/20 flex items-center justify-center cursor-pointer shrink-0 overflow-hidden group/it">
                               {activeRestId === rest.id && newItem.photoURL ? (
                                  <img src={newItem.photoURL} className="w-full h-full object-cover" />
                               ) : (
                                  <Camera className="h-6 w-6 text-white/20 group-hover/it:text-emerald-400" />
                               )}
                            </div>
                            <div className="flex-1 space-y-2">
                               <input value={activeRestId === rest.id ? newItem.name : ''} onChange={e => { setActiveRestId(rest.id); setNewItem({...newItem, name: e.target.value}); }} placeholder="اسم الوجبة" className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-xs font-bold text-white outline-none text-right focus:border-emerald-500" />
                               <div className="flex gap-2">
                                  <input type="number" value={activeRestId === rest.id ? (newItem.price || '') : ''} onChange={e => { setActiveRestId(rest.id); setNewItem({...newItem, price: Number(e.target.value)}); }} placeholder="السعر" className="flex-1 bg-white/5 border border-white/10 p-3.5 rounded-xl text-xs font-bold text-white outline-none text-right focus:border-emerald-500" />
                                  <button onClick={() => addMenuItem(rest.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-xl font-black text-[10px] transition-all">إضافة</button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           ))}
           <input type="file" ref={itemFileRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'ITEM')} />
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantManager;
