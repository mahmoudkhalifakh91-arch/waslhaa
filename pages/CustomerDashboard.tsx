
import React, { useState, useEffect, useRef } from 'react';

// Types
import type { User, Order, Village, Offer, OrderCategory, Restaurant, MenuItem, CartItem, District, Ad } from '../types';
import { OrderStatus, VehicleType } from '../types';
import { MENOFIA_DATA, DEFAULT_PRICING } from '../config/constants';

// React Leaflet
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Utils
import { stripFirestore, compressImage, getRoadDistance, getRouteGeometry } from '../utils';

// Services
import { db } from '../services/firebase';
import { 
  collection, addDoc, query, where, onSnapshot, 
  doc, updateDoc, increment, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Icons
import { 
  MapPin, Bike, Check, 
  ChevronDown, ChevronRight, Star,
  User as UserIcon, MessageCircle, Loader2,
  Bot, History, Navigation2, UtensilsCrossed, 
  ShoppingBag, ArrowRight, ArrowLeft, ThumbsUp, PartyPopper,
  Plus, Minus, PhoneCall, Pill,
  Zap, Car, X, Navigation, Map as MapIcon,
  Camera, FileText, Search, Edit2, CheckCircle2,
  Utensils, Store, Trash2, ZoomIn, Download, ChevronLeft,
  Timer, Milestone, AlertTriangle, Home, Megaphone, UploadCloud,
  Crosshair, Compass, Calculator, Radar, ClipboardList, Edit, PlusCircle,
  Stethoscope, Image as ImageIcon, Info, Sparkles, Send
} from 'lucide-react';

// Components
import ProfileView from './ProfileView';
import ActivityView from './ActivityView';
import WalletView from './WalletView';
import ChatView from '../components/ChatView';
import AIAssistant from '../config/AIAssistant';

// --- Custom Icons ---
const driverIcon = L.divIcon({
  html: `<div class="bg-white p-2 rounded-full shadow-2xl border-4 border-emerald-500 animate-bounce text-xl flex items-center justify-center">🛵</div>`,
  className: 'live-driver-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const MapAutoFit: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) { map.fitBounds(L.latLngBounds(points), { padding: [50, 50] }); }
  }, [points]);
  return null;
};

// --- Sub Components ---

const AdsSlider: React.FC<{ ads: Ad[], onAdClick: (ad: Ad) => void }> = ({ ads, onAdClick }) => {
  if (ads.length === 0) return null;
  return (
    <div className="w-full space-y-4">
       <div className="flex gap-4 overflow-x-auto no-scrollbar px-2 pb-2">
          {ads.map(ad => (
            <div key={ad.id} onClick={() => onAdClick(ad)} className="min-w-[85vw] md:min-w-[400px] aspect-[21/9] bg-slate-900 rounded-[2.5rem] relative overflow-hidden shadow-xl cursor-pointer group active:scale-95 transition-all">
               <img src={ad.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt={ad.title} />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end text-right">
                  <h4 className="text-white font-black text-lg">{ad.title}</h4>
                  <div className="mt-2 bg-emerald-500 text-white self-end px-5 py-1.5 rounded-full font-black text-[10px]">{ad.ctaText || 'اطلب الآن'}</div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const AdDetailsView: React.FC<{ ad: Ad, onClose: () => void }> = ({ ad, onClose }) => {
  return (
    <div className="fixed inset-0 z-[11000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" dir="rtl">
       <div className="bg-white w-full max-w-lg rounded-[3.5rem] flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in duration-500">
          <div className="relative aspect-[21/9] shrink-0">
             <img src={ad.imageUrl} className="w-full h-full object-cover" alt={ad.title} />
             <button onClick={onClose} className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all">
                <X className="h-6 w-6" />
             </button>
          </div>
          <div className="flex-1 overflow-auto p-8 md:p-10 space-y-6 no-scrollbar text-right">
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{ad.title}</h3>
                <div className="h-1.5 w-16 bg-emerald-500 rounded-full"></div>
             </div>
             <p className="text-slate-500 font-bold leading-relaxed whitespace-pre-wrap">{ad.description}</p>
             
             {ad.whatsappNumber && (
               <button 
                 onClick={() => {
                   updateDoc(doc(db, "ads", ad.id), { clicks: increment(1) });
                   window.open(`https://wa.me/${ad.whatsappNumber}`, '_blank');
                 }}
                 className="w-full bg-[#25D366] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/10 active:scale-95 transition-all flex items-center justify-center gap-4"
               >
                  <MessageCircle className="h-6 w-6" /> {ad.ctaText || 'اطلب عبر واتساب'}
               </button>
             )}
          </div>
          <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
             <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-3xl font-black text-xs active:scale-95 transition-all">
                إغلاق
             </button>
          </div>
       </div>
    </div>
  );
};

const LocationSelector: React.FC<{
  label: string, helper: string, icon: React.ReactNode, iconBg: string,
  selectedDistrict: District | null, selectedVillage: Village | null,
  onSelectDistrict: (d: District) => void, onSelectVillage: (v: Village) => void,
  addressNote?: string, onAddressChange?: (val: string) => void,
  minimal?: boolean
}> = ({ label, helper, icon, iconBg, selectedDistrict, selectedVillage, onSelectDistrict, onSelectVillage, addressNote, onAddressChange, minimal = false }) => {
  const [showDistricts, setShowDistricts] = useState(false);
  const [showVillages, setShowVillages] = useState(false);
  const [distSearch, setDistSearch] = useState('');
  const [villSearch, setVillSearch] = useState('');

  const filteredDistricts = MENOFIA_DATA.filter(d => d.name.includes(distSearch));
  const filteredVillages = selectedDistrict?.villages.filter(v => v.name.includes(villSearch)) || [];

  return (
    <div className={`bg-white rounded-[2.5rem] card-shadow space-y-4 border border-slate-50 ${minimal ? 'p-4' : 'p-6'}`}>
      {!minimal && (
        <div className="flex items-center gap-4 flex-row-reverse text-right">
          <div className={`${iconBg} p-3.5 rounded-2xl text-white shadow-lg`}>{icon}</div>
          <div className="flex-1">
            <h4 className="font-black text-slate-900 text-xl">{label}</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{helper}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3" dir="rtl">
        <div className="relative">
          <button onClick={() => { setShowDistricts(!showDistricts); setShowVillages(false); setDistSearch(''); }} className="w-full bg-[#F8FAFC] p-4 rounded-2xl text-right flex justify-between items-center text-xs border border-slate-100">
             <ChevronDown className={`h-4 w-4 text-slate-300 ${showDistricts ? 'rotate-180' : ''}`} />
             <span className="font-black text-slate-800 truncate">{selectedDistrict?.name || "اختر المركز"}</span>
          </button>
          {showDistricts && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[6000] max-h-64 overflow-hidden border border-slate-100 animate-in zoom-in flex flex-col">
               <div className="p-3 border-b border-slate-50 sticky top-0 bg-white z-10">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    <input 
                      autoFocus
                      value={distSearch}
                      onChange={e => setDistSearch(e.target.value)}
                      placeholder="بحث عن مركز..." 
                      className="w-full bg-slate-50 p-2.5 pr-9 rounded-xl text-[10px] font-black outline-none border border-slate-100 focus:border-emerald-500 transition-all text-right"
                    />
                  </div>
               </div>
               <div className="overflow-y-auto no-scrollbar flex-1">
                  {filteredDistricts.length > 0 ? filteredDistricts.map(d => (
                    <button key={d.id} onClick={() => { onSelectDistrict(d); setShowDistricts(false); setDistSearch(''); }} className="w-full p-4 text-right hover:bg-emerald-50 font-black text-xs border-b border-slate-50 last:border-none">{d.name}</button>
                  )) : (
                    <div className="p-6 text-center text-[10px] font-bold text-slate-300">لا يوجد نتائج</div>
                  )}
               </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { if(selectedDistrict) { setShowVillages(!showVillages); setShowDistricts(false); setVillSearch(''); } }} disabled={!selectedDistrict} className="w-full bg-[#F8FAFC] p-4 rounded-2xl text-right flex justify-between items-center text-xs disabled:opacity-50 border border-slate-100">
             <ChevronDown className={`h-4 w-4 text-slate-300 ${showVillages ? 'rotate-180' : ''}`} />
             <span className="font-black text-slate-800 truncate">{selectedVillage?.name || "اختر القرية"}</span>
          </button>
          {showVillages && selectedDistrict && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[6000] max-h-64 overflow-hidden border border-slate-100 animate-in zoom-in flex flex-col">
               <div className="p-3 border-b border-slate-50 sticky top-0 bg-white z-10">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    <input 
                      autoFocus
                      value={villSearch}
                      onChange={e => setVillSearch(e.target.value)}
                      placeholder="بحث عن قرية..." 
                      className="w-full bg-slate-50 p-2.5 pr-9 rounded-xl text-[10px] font-black outline-none border border-slate-100 focus:border-emerald-500 transition-all text-right"
                    />
                  </div>
               </div>
               <div className="overflow-y-auto no-scrollbar flex-1">
                  {filteredVillages.length > 0 ? filteredVillages.map(v => (
                    <button key={v.id} onClick={() => { onSelectVillage(v); setShowVillages(false); setVillSearch(''); }} className="w-full p-4 text-right hover:bg-emerald-50 font-black text-xs border-b border-slate-50 last:border-none">{v.name}</button>
                  )) : (
                    <div className="p-6 text-center text-[10px] font-bold text-slate-300">لا يوجد نتائج</div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
      {onAddressChange !== undefined && (
        <input value={addressNote} onChange={e => onAddressChange(e.target.value)} placeholder="رقم المنزل، علامة مميزة.." className="w-full bg-[#F8FAFC] p-5 rounded-2xl text-xs font-bold text-right outline-none focus:border-emerald-500/20 border-2 border-transparent transition-all shadow-inner" />
      )}
    </div>
  );
};

// --- Restaurant Details & Menu View ---

const RestaurantMenuView: React.FC<{ 
  restaurant: Restaurant, 
  initialDropoffVillage: Village | null,
  initialDistrict: District | null,
  onClose: () => void, 
  onConfirmOrder: (cart: CartItem[], foodTotal: number, deliveryTotal: number, grandTotal: number, distance: number, village: Village, specialRequest: string) => void 
}> = ({ restaurant, initialDropoffVillage, initialDistrict, onClose, onConfirmOrder }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [specialRequest, setSpecialRequest] = useState('');
  const [showFullMenuImage, setShowFullMenuImage] = useState(false);
  const [roadDist, setRoadDist] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [currentDistrict, setCurrentDistrict] = useState<District | null>(initialDistrict);
  const [currentVillage, setCurrentVillage] = useState<Village | null>(initialDropoffVillage);

  useEffect(() => {
    if (currentVillage) {
      setIsCalculating(true);
      getRoadDistance(restaurant.lat, restaurant.lng, currentVillage.center.lat, currentVillage.center.lng)
        .then(res => {
          setRoadDist(res.distance);
          setIsCalculating(false);
        })
        .catch(() => setIsCalculating(false));
    }
  }, [restaurant, currentVillage]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
  };

  const totalFoodItemsPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getDeliveryPrice = () => {
    if (!currentVillage) return 0;
    
    const isSameVillage = restaurant.address === currentVillage.name;
    const { sameVillagePrice, foodOutsidePricePerKm } = DEFAULT_PRICING;

    if (isSameVillage) return sameVillagePrice;

    // خارج القرية: المسافة × 3 جنيه
    const calc = roadDist * (foodOutsidePricePerKm || 3);
    return Math.max(Math.round(calc), DEFAULT_PRICING.minPrice);
  };

  const deliveryPrice = getDeliveryPrice();
  const finalEstimatedPrice = totalFoodItemsPrice + deliveryPrice;

  return (
    <div className="fixed inset-0 z-[5000] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden" dir="rtl">
       {/* Hero Section */}
       <div className="relative h-[28vh] shrink-0">
          <img src={restaurant.photoURL || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42339'} className="w-full h-full object-cover" alt={restaurant.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <button onClick={onClose} className="absolute top-10 right-6 p-4 bg-white/20 backdrop-blur-md text-white rounded-2xl active:scale-90 transition-all">
             <ArrowRight className="h-6 w-6" />
          </button>
          
          <div className="absolute bottom-6 right-8 left-8 text-right text-white">
             <h2 className="text-3xl font-black tracking-tight">{restaurant.name}</h2>
             <div className="flex items-center gap-2 mt-1">
                <span className="bg-emerald-500 px-3 py-0.5 rounded-full text-[9px] font-black uppercase">{restaurant.category}</span>
                <span className="text-[10px] font-bold opacity-70 flex items-center gap-1"><MapPin className="h-3 w-3" /> {restaurant.address}</span>
             </div>
          </div>
       </div>

       {/* Menu Content */}
       <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar bg-slate-50">
          
          {/* Location Picker */}
          <div className="space-y-4">
             <h3 className="text-xl font-black text-slate-800 pr-2 border-r-4 border-emerald-500">منطقة الاستلام (التوصيل)</h3>
             <LocationSelector 
                label="" helper="" icon={<MapPin />} iconBg="bg-rose-500" 
                selectedDistrict={currentDistrict} 
                selectedVillage={currentVillage}
                onSelectDistrict={setCurrentDistrict}
                onSelectVillage={setCurrentVillage}
                minimal
             />
          </div>

          {/* Paper Menu Button */}
          {restaurant.menuImageURL && (
            <button onClick={() => setShowFullMenuImage(true)} className="w-full bg-slate-900 p-6 rounded-[2.5rem] text-white flex justify-between items-center shadow-xl active:scale-95 transition-all group overflow-hidden relative">
               <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all"></div>
               <div className="bg-white/10 p-3 rounded-2xl relative z-10"><ZoomIn className="h-6 w-6 text-emerald-400" /></div>
               <div className="text-right relative z-10">
                  <h4 className="font-black text-md">عرض المنيو الورقي</h4>
                  <p className="text-[10px] font-bold text-emerald-400/80 mt-1">اضغط هنا لرؤية قائمة الطعام الأصلية بالأسعار</p>
               </div>
            </button>
          )}

          {/* Special Requests */}
          <div className="space-y-4">
             <h3 className="text-xl font-black text-slate-800 pr-2 border-r-4 border-amber-500">طلب خاص أو صنف غير موجود</h3>
             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl group-focus-within:bg-amber-500/10 transition-all"></div>
                <div className="flex items-center gap-3 mb-4 flex-row-reverse text-right relative z-10">
                   <Edit className="h-5 w-5 text-amber-500" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اكتب أي حاجة مش لاقيها في القائمة</p>
                </div>
                <textarea 
                   value={specialRequest}
                   onChange={e => setSpecialRequest(e.target.value)}
                   placeholder="مثلاً: رغيف حواوشي زيادة، صنف موسمي، ملاحظات على الأكل..."
                   className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold text-right outline-none focus:ring-2 focus:ring-amber-500/20 border-none min-h-[100px] relative z-10 shadow-inner"
                />
             </div>
          </div>

          {/* Digital Menu Items */}
          <div className="space-y-6 pb-20">
             <h3 className="text-xl font-black text-slate-800 pr-2 border-r-4 border-emerald-500">أصناف القائمة الرقمية</h3>
             <div className="grid gap-4">
                {restaurant.menu && restaurant.menu.length > 0 ? (
                  restaurant.menu.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-[2.8rem] shadow-sm border border-slate-100 flex justify-between items-center group transition-all hover:border-emerald-200">
                       <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
                             <button onClick={() => addToCart(item)} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg active:scale-75 transition-all"><Plus className="h-5 w-5" /></button>
                             <span className="font-black text-xl w-8 text-center text-slate-800">{cart.find(i => i.id === item.id)?.quantity || 0}</span>
                             <button onClick={() => removeFromCart(item.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl active:scale-75 transition-all"><Minus className="h-5 w-5" /></button>
                          </div>
                       </div>
                       <div className="text-right flex items-center gap-5 flex-row-reverse">
                          <div className="w-16 h-16 bg-slate-100 rounded-[1.8rem] overflow-hidden shrink-0 shadow-inner border border-slate-50 relative group-hover:scale-105 transition-transform duration-500">
                             {item.photoURL ? <img src={item.photoURL} className="w-full h-full object-cover" /> : <Utensils className="p-5 text-slate-200" />}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 text-lg leading-tight">{item.name}</p>
                             <p className="text-emerald-600 font-black text-sm mt-1">{item.price} <span className="text-[10px] opacity-60">ج.م</span></p>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                     <ClipboardList className="h-10 w-10 text-slate-200 mx-auto mb-2 opacity-50" />
                     <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">القائمة الرقمية بانتظار التحديث</p>
                     <p className="text-[9px] text-slate-300 mt-1">استخدم المنيو الورقي أو الطلب اليدوي</p>
                  </div>
                )}
             </div>
          </div>
       </div>

       {/* Floating Action Bar */}
       <div className="p-8 pb-10 bg-white/90 backdrop-blur-2xl border-t border-slate-100 shadow-2xl shrink-0">
          <div className="grid grid-cols-2 gap-4 mb-5">
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">قيمة الطعام</p>
                <p className="text-xl font-black text-slate-900">{totalFoodItemsPrice} <span className="text-xs">ج.م</span></p>
             </div>
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-right overflow-hidden relative">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest truncate">التوصيل لـ {currentVillage?.name || '...'}</p>
                <p className="text-xl font-black text-emerald-600">
                   {isCalculating ? <Loader2 className="h-5 w-5 animate-spin inline ml-1" /> : `${deliveryPrice} ج.م`}
                </p>
             </div>
          </div>

          <button 
            onClick={() => currentVillage && onConfirmOrder(cart, totalFoodItemsPrice, deliveryPrice, finalEstimatedPrice, roadDist, currentVillage, specialRequest)}
            disabled={(cart.length === 0 && !specialRequest) || !currentVillage || isCalculating}
            className="w-full bg-[#10b981] text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
          >
             <ShoppingBag className="h-7 w-7" /> تأكيد وإرسال الطلب ({finalEstimatedPrice} ج.م)
          </button>
       </div>

       {/* Full Image Modal */}
       {showFullMenuImage && (
         <div className="fixed inset-0 z-[6000] bg-slate-950 flex flex-col animate-in zoom-in duration-300">
            <div className="flex justify-between items-center p-8 bg-black/20 backdrop-blur-md">
               <button onClick={() => setShowFullMenuImage(false)} className="p-4 bg-white/10 text-white rounded-2xl active:scale-90 transition-all"><X className="h-6 w-6" /></button>
               <div className="text-right">
                  <h3 className="text-white font-black">منيو {restaurant.name}</h3>
                  <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">تصفح الأسعار الحقيقية</p>
               </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
               <img 
                 src={restaurant.menuImageURL} 
                 className="max-w-full max-h-full object-contain shadow-2xl rounded-xl animate-in zoom-in duration-500" 
                 alt="Paper Menu" 
               />
            </div>
            <div className="p-6 text-center text-white/40 text-[9px] font-bold uppercase tracking-[0.4em]">وصـــلــهــا • أصل الطعم</div>
         </div>
       )}
    </div>
  );
};

// --- Manual Restaurant Order Modal ---

const ManualRestaurantView: React.FC<{
  onClose: () => void,
  onConfirm: (data: { name: string, items: string, village: Village }) => void
}> = ({ onClose, onConfirm }) => {
  const [restName, setRestName] = useState('');
  const [items, setItems] = useState('');
  const [district, setDistrict] = useState<District | null>(null);
  const [village, setVillage] = useState<Village | null>(null);
  
  return (
    <div className="fixed inset-0 z-[5000] bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden" dir="rtl">
       <div className="p-8 md:p-10 bg-slate-950 text-white flex justify-between items-center shrink-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/5 blur-3xl"></div>
          <button onClick={onClose} className="p-4 bg-white/10 rounded-2xl active:scale-90 transition-all relative z-10"><ArrowRight className="h-6 w-6" /></button>
          <div className="text-right relative z-10">
             <h2 className="text-2xl font-black">طلب من مطعم خارجي</h2>
             <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest mt-1">أي مطعم في دماغك هنوصلك منه</p>
          </div>
       </div>
       <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
          <div className="space-y-4">
             <h3 className="text-xl font-black text-slate-800 pr-2 border-r-4 border-emerald-500">بيانات المطعم والطلب</h3>
             <div className="bg-white p-6 md:p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
                <input value={restName} onChange={e => setRestName(e.target.value)} placeholder="اسم المطعم (مثال: البرنس، كشري التحرير..)" className="w-full bg-slate-50 rounded-2xl p-6 text-sm font-black text-right outline-none focus:ring-4 focus:ring-emerald-500/5 border-none shadow-inner" />
                <textarea value={items} onChange={e => setItems(e.target.value)} placeholder="اكتب طلباتك هنا بالتفصيل (الوجبات، الأعداد، ملاحظات..)" className="w-full bg-slate-50 rounded-2xl p-6 text-sm font-bold text-right outline-none focus:ring-4 focus:ring-emerald-500/5 border-none shadow-inner min-h-[140px]" />
             </div>
          </div>
          <div className="space-y-4">
             <h3 className="text-xl font-black text-slate-800 pr-2 border-r-4 border-rose-500">مكان التوصيل</h3>
             <LocationSelector 
                label="" helper="" 
                icon={<CheckCircle2 />} iconBg="bg-rose-500" 
                selectedDistrict={district} 
                selectedVillage={village} 
                onSelectDistrict={setDistrict} 
                onSelectVillage={setVillage} 
                minimal
             />
          </div>
       </div>
       <div className="p-8 md:p-10 bg-white shadow-2xl border-t border-slate-100">
          <button 
             onClick={() => village && onConfirm({ name: restName, items, village })}
             disabled={!restName || !items || !village}
             className="w-full bg-slate-950 text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-4"
          >
             <Send className="h-6 w-6 text-emerald-400" /> إرسال الطلب الآن
          </button>
       </div>
    </div>
  );
};

// --- Main Dashboard Component ---

const CustomerDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeView, setActiveView] = useState<'NEW' | 'PROFILE' | 'ACTIVITY' | 'WALLET'>('NEW');
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory>('TAXI');
  
  const [pickupDistrict, setPickupDistrict] = useState<District | null>(null);
  const [pickupVillage, setPickupVillage] = useState<Village | null>(null);
  const [pickupNote, setPickupNote] = useState('');
  
  const [dropoffDistrict, setDropoffDistrict] = useState<District | null>(null);
  const [dropoffVillage, setDropoffVillage] = useState<Village | null>(null);
  const [dropoffNote, setDropoffNote] = useState('');

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [viewingAd, setViewingAd] = useState<Ad | null>(null);
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null);
  const [showManualRest, setShowManualRest] = useState(false);
  
  // Pharmacy States
  const [pharmacyNote, setPharmacyNote] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('MOTORCYCLE');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [incomingOffers, setIncomingOffers] = useState<Offer[]>([]);
  
  const [actualRoadDist, setActualRoadDist] = useState<number>(0);
  const [isCalculatingDist, setIsCalculatingDist] = useState(false);
  
  const [aiOpen, setAiOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  // Tracking Data
  const [driverLoc, setDriverLoc] = useState<{lat: number, lng: number} | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);

  useEffect(() => {
    onSnapshot(query(collection(db, "restaurants"), orderBy("name", "asc")), (snap) => {
      setRestaurants(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Restaurant[]);
    });

    onSnapshot(query(collection(db, "ads"), orderBy("displayOrder", "asc")), (snap) => {
      setAds(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })).filter(ad => ad.isActive) as Ad[]);
    });

    return onSnapshot(query(collection(db, "orders"), where("customerId", "==", user.id)), (snapshot) => {
      const all = snapshot.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) } as Order));
      setActiveOrder(all.find(o => ![OrderStatus.DELIVERED_RATED, OrderStatus.CANCELLED].includes(o.status)) || null);
    });
  }, [user.id]);

  useEffect(() => {
    if (activeOrder?.id && activeOrder.status === OrderStatus.WAITING_FOR_OFFERS) {
      return onSnapshot(query(collection(db, "offers"), where("orderId", "==", activeOrder.id)), (snap) => {
        setIncomingOffers(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Offer[]);
      });
    }
    
    // تتبع الكابتن المباشر والمسار الفعلي فور قبول الطلب
    if (activeOrder?.driverId && activeOrder.status !== OrderStatus.WAITING_FOR_OFFERS) {
       const unsubDriver = onSnapshot(doc(db, "users", activeOrder.driverId), (docSnap) => {
          if (docSnap.exists() && docSnap.data().location) {
             const loc = docSnap.data().location;
             setDriverLoc(loc);
             // جلب المسار الفعلي من مكان الكابتن إلى نقطة الاستلام/التوصيل
             const dest = activeOrder.status === OrderStatus.ACCEPTED ? activeOrder.pickup : activeOrder.dropoff;
             getRouteGeometry(loc.lat, loc.lng, dest.lat, dest.lng).then(setRouteGeometry);
          }
       });
       return () => unsubDriver();
    } else {
       setDriverLoc(null);
       setRouteGeometry([]);
    }
  }, [activeOrder?.id, activeOrder?.status, activeOrder?.driverId]);

  useEffect(() => {
    if (pickupVillage && dropoffVillage) {
      if (pickupVillage.id === dropoffVillage.id) {
        setActualRoadDist(0);
      } else {
        setIsCalculatingDist(true);
        getRoadDistance(pickupVillage.center.lat, pickupVillage.center.lng, dropoffVillage.center.lat, dropoffVillage.center.lng)
          .then(res => { setActualRoadDist(res.distance); setIsCalculatingDist(false); })
          .catch(() => setIsCalculatingDist(false));
      }
    }
  }, [pickupVillage, dropoffVillage]);

  const getEstimatedPrice = () => {
    if (!pickupVillage || !dropoffVillage) return 0;
    if (pickupVillage.id === dropoffVillage.id) return DEFAULT_PRICING.sameVillagePrice;
    const baseFare = DEFAULT_PRICING.basePrice + (actualRoadDist * DEFAULT_PRICING.pricePerKm);
    const multiplier = DEFAULT_PRICING.multipliers[selectedVehicle] || 1;
    return Math.round(Math.max(baseFare * multiplier, DEFAULT_PRICING.minPrice));
  };

  const estimatedPrice = getEstimatedPrice();

  const handleAcceptOffer = async (offer: Offer) => {
    if (!activeOrder) return;
    try {
      await updateDoc(doc(db, "orders", activeOrder.id), {
        driverId: offer.driverId,
        driverName: offer.driverName,
        driverPhone: offer.driverPhone,
        driverPhoto: offer.driverPhoto || null,
        status: OrderStatus.ACCEPTED,
        acceptedAt: Date.now(),
        price: offer.price 
      });
    } catch (e) { alert('فشل قبول العرض'); }
  };

  const handleCreateOrder = async (extraData: any = {}) => {
    const finalVillage = extraData.deliveryVillage || dropoffVillage;
    if(!finalVillage) return alert('يرجى تحديد مكان التوصيل');
    setIsSubmitting(true);
    try {
      const orderPrice = extraData.price || estimatedPrice;
      const orderData = {
        customerId: user.id, customerPhone: user.phone, category: selectedCategory,
        status: OrderStatus.WAITING_FOR_OFFERS, createdAt: Date.now(), paymentMethod: 'CASH',
        pickup: (selectedCategory === 'TAXI' && pickupVillage) ? { address: pickupVillage.name, lat: pickupVillage.center.lat, lng: pickupVillage.center.lng, villageName: pickupVillage.name } : (extraData.pickup || null),
        dropoff: { address: finalVillage.name, lat: finalVillage.center.lat, lng: finalVillage.center.lng, villageName: finalVillage.name },
        requestedVehicleType: selectedVehicle, price: orderPrice, distance: extraData.distance || actualRoadDist,
        pickupNotes: pickupNote, dropoffNotes: dropoffNote, ...extraData
      };
      await addDoc(collection(db, "orders"), stripFirestore(orderData));

      // بناء رسالة واتساب تفصيلية وشاملة
      const catLabel = selectedCategory === 'TAXI' ? '🚖 مشوار' : selectedCategory === 'FOOD' ? '🍔 طلب أكل' : '💊 صيدلية';
      const vehicleLabel = orderData.requestedVehicleType === 'TOKTOK' ? 'توكتوك 🛺' : orderData.requestedVehicleType === 'MOTORCYCLE' ? 'موتوسيكل 🏍️' : 'سيارة 🚗';
      
      let foodSummary = "";
      if (orderData.foodItems && orderData.foodItems.length > 0) {
        foodSummary = "\n📋 *الأصناف المطلوبة:*\n" + orderData.foodItems.map((i: any) => `- ${i.name} (عدد: ${i.quantity})`).join('\n');
      }

      const whatsappMsg = `*📢 طلب جديد من تطبيق وصلها*\n\n` +
        `👤 *العميل:* ${user.name}\n` +
        `📱 *الهاتف:* ${user.phone}\n` +
        `📂 *القسم:* ${catLabel}\n` +
        `📍 *الانطلاق:* ${orderData.pickup?.villageName || 'غير محدد'}\n` +
        `🏁 *التوصيل:* ${orderData.dropoff?.villageName || 'غير محدد'}\n` +
        `🛵 *المركبة:* ${vehicleLabel}\n` +
        `💰 *التكلفة:* ${orderData.price} ج.م\n` +
        (orderData.specialRequest ? `📝 *ملاحظة:* ${orderData.specialRequest}\n` : '') +
        foodSummary +
        `\n\n_تم الإرسال من تطبيق وصلها المنوفية_`;

      window.open(`https://wa.me/201065019364?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    } catch (e) { alert('خطأ في إرسال الطلب'); } finally { setIsSubmitting(false); }
  };

  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      setPrescriptionImage(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleRateTrip = async () => {
    if (!activeOrder) return;
    setIsRatingSubmitting(true);
    try {
      await updateDoc(doc(db, "orders", activeOrder.id), {
        status: OrderStatus.DELIVERED_RATED,
        rating: rating,
        feedback: feedback.trim(),
        ratedAt: Date.now()
      });
      setRating(5); setFeedback('');
    } catch (e) { alert('خطأ في التقييم'); } finally { setIsRatingSubmitting(false); }
  };

  if (showChat && activeOrder) return <ChatView user={user} order={activeOrder} onBack={() => setShowChat(false)} />;
  if (activeView === 'WALLET') return <WalletView user={user} onBack={() => setActiveView('NEW')} />;
  if (activeView === 'PROFILE') return <ProfileView user={user} onUpdate={() => {}} onBack={() => setActiveView('NEW')} onOpenWallet={() => setActiveView('WALLET')} />;
  if (activeView === 'ACTIVITY') return <ActivityView user={user} onBack={() => setActiveView('NEW')} />;

  return (
    <div className="rh-layout relative h-full w-full bg-slate-50 overflow-hidden">
      <AIAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      {viewingAd && <AdDetailsView ad={viewingAd} onClose={() => setViewingAd(null)} />}
      
      {showManualRest && (
        <ManualRestaurantView 
           onClose={() => setShowManualRest(false)} 
           onConfirm={(data) => {
              handleCreateOrder({
                restaurantName: data.name,
                specialRequest: data.items,
                deliveryVillage: data.village,
                price: 35, // سعر مبدأي تقديري
                pickup: { address: data.name, lat: 30.2931, lng: 30.9863, villageName: 'خارجي' }
              });
              setShowManualRest(false);
           }} 
        />
      )}

      {viewingRestaurant && (
        <RestaurantMenuView 
          restaurant={viewingRestaurant} 
          initialDropoffVillage={dropoffVillage}
          initialDistrict={dropoffDistrict}
          onClose={() => setViewingRestaurant(null)} 
          onConfirmOrder={(cart, foodTotal, deliveryTotal, grandTotal, distance, village, specialRequest) => {
            handleCreateOrder({ 
              restaurantId: viewingRestaurant.id, 
              restaurantName: viewingRestaurant.name, 
              foodItems: cart,
              specialRequest: specialRequest,
              price: grandTotal,
              distance: distance,
              deliveryVillage: village,
              pickup: { address: viewingRestaurant.name, lat: viewingRestaurant.lat, lng: viewingRestaurant.lng, villageName: viewingRestaurant.address } 
            });
            setViewingRestaurant(null);
          }} 
        />
      )}

      <div className="page-container no-scrollbar h-full overflow-y-auto">
        <div className="p-6 md:p-10 space-y-8 pb-32 max-w-2xl mx-auto">
          {!activeOrder ? (
            <>
              <div className="flex items-center justify-between">
                 <div className="text-right">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">وصـــلــهــا</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">توصيل ذكي حقيقي للمنوفية</p>
                 </div>
                 <button onClick={() => setAiOpen(true)} className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl active:scale-90 transition-all shadow-sm border border-emerald-100"><Bot /></button>
              </div>

              <AdsSlider ads={ads} onAdClick={(ad) => setViewingAd(ad)} />

              <div className="flex justify-center gap-4">
                  {[ 
                    { id: 'PHARMACY', label: 'صيدلية', icon: <Pill className="h-8 w-8" /> }, 
                    { id: 'FOOD', label: 'أكل', icon: <UtensilsCrossed className="h-8 w-8" /> }, 
                    { id: 'TAXI', label: 'مشوار', icon: <Bike className="h-8 w-8" /> } 
                  ].map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id as OrderCategory)} className={`flex-1 py-8 rounded-[2.5rem] flex flex-col items-center gap-3 bg-white card-shadow transition-all ${selectedCategory === cat.id ? 'border-4 border-emerald-500 scale-105 shadow-xl' : 'opacity-40 grayscale'}`}>
                       {cat.icon}
                       <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                    </button>
                  ))}
              </div>

              <div className="space-y-6 animate-reveal">
                {selectedCategory === 'PHARMACY' ? (
                  <div className="space-y-6 animate-in zoom-in">
                    <div className="bg-white p-8 rounded-[3rem] card-shadow space-y-8">
                       <div className="flex items-center gap-4 flex-row-reverse text-right">
                          <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg"><Stethoscope className="h-6 w-6" /></div>
                          <div>
                             <h4 className="text-xl font-black text-slate-800">طلب من الصيدلية</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">ارفع الروشتة أو اكتب الأدوية</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <textarea 
                             value={pharmacyNote}
                             onChange={e => setPharmacyNote(e.target.value)}
                             placeholder="اكتب أسماء الأدوية المطلوبة هنا..."
                             className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold text-right outline-none min-h-[120px] focus:ring-2 focus:ring-emerald-500/10 border-none"
                          />
                          <div className="relative">
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePrescriptionUpload} />
                             {prescriptionImage ? (
                               <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-emerald-50">
                                  <img src={prescriptionImage} className="w-full h-full object-cover" />
                                  <button onClick={() => setPrescriptionImage(null)} className="absolute top-4 left-4 bg-slate-900/60 text-white p-2 rounded-xl"><X className="h-4 w-4" /></button>
                               </div>
                             ) : (
                               <button 
                                 onClick={() => fileInputRef.current?.click()}
                                 className="w-full bg-slate-50 border-4 border-dashed border-slate-100 p-8 rounded-3xl flex flex-col items-center gap-2 text-slate-400 active:scale-95 transition-all"
                               >
                                  <ImageIcon className="h-10 w-10 opacity-30" />
                                  <span className="font-black text-xs uppercase tracking-widest">إرفاق صورة الروشتة</span>
                               </button>
                             )}
                          </div>
                       </div>
                    </div>
                    <LocationSelector label="مكان التوصيل" helper="أين سيسلمك الكابتن العلاج؟" icon={<CheckCircle2 />} iconBg="bg-rose-500" selectedDistrict={dropoffDistrict} selectedVillage={dropoffVillage} onSelectDistrict={setDropoffDistrict} onSelectVillage={setDropoffVillage} addressNote={dropoffNote} onAddressChange={setDropoffNote} />
                    <button onClick={() => handleCreateOrder({ specialRequest: pharmacyNote, prescriptionImage: prescriptionImage, pickup: { villageName: 'أقرب صيدلية', address: 'صيدلية', lat: 30.2931, lng: 30.9863 } })} disabled={isSubmitting || (!pharmacyNote && !prescriptionImage) || !dropoffVillage} className="w-full bg-slate-950 text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-95 transition-all">
                       {isSubmitting ? <Loader2 className="animate-spin h-7 w-7 mx-auto" /> : 'اطلب العلاج الآن'}
                    </button>
                  </div>
                ) : selectedCategory === 'FOOD' ? (
                  <div className="grid gap-5">
                    <div onClick={() => setShowManualRest(true)} className="bg-slate-900 p-6 rounded-[3rem] card-shadow flex flex-row-reverse justify-between items-center cursor-pointer active:scale-95 transition-all">
                       <div className="flex items-center gap-4 flex-row-reverse text-right">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                             <ClipboardList className="h-7 w-7" />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-white leading-tight">المطعم مش موجود؟</h4>
                             <p className="text-[10px] font-bold text-emerald-400/80">اطلب يدوي من أي مطعم في بالك</p>
                          </div>
                       </div>
                       <PlusCircle className="h-6 w-6 text-white/20" />
                    </div>
                    {restaurants.map(rest => (
                      <div key={rest.id} onClick={() => setViewingRestaurant(rest)} className="bg-white p-5 rounded-[3rem] card-shadow flex flex-row-reverse justify-between items-center cursor-pointer hover:border-emerald-500 border-2 border-transparent transition-all active:scale-95">
                         <div className="flex items-center gap-4 flex-row-reverse text-right">
                            <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] overflow-hidden shadow-lg border border-white/10">
                               {rest.photoURL ? <img src={rest.photoURL} className="w-full h-full object-cover" /> : <Utensils className="p-5 text-emerald-400" />}
                            </div>
                            <div><h4 className="text-lg font-black text-slate-800 leading-tight">{rest.name}</h4><p className="text-[10px] font-bold text-slate-400">{rest.category}</p></div>
                         </div>
                         <ChevronRight className="h-5 w-5 text-slate-300 rotate-180" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <LocationSelector label="نقطة الانطلاق" helper="موقع استلامك" icon={<MapPin />} iconBg="bg-emerald-500" selectedDistrict={pickupDistrict} selectedVillage={pickupVillage} onSelectDistrict={setPickupDistrict} onSelectVillage={setPickupVillage} addressNote={pickupNote} onAddressChange={setPickupNote} />
                    <LocationSelector label="مكان التوصيل" helper="أين ستستلم طلبك؟" icon={<CheckCircle2 />} iconBg="bg-rose-500" selectedDistrict={dropoffDistrict} selectedVillage={dropoffVillage} onSelectDistrict={setDropoffDistrict} onSelectVillage={setDropoffVillage} addressNote={dropoffNote} onAddressChange={setDropoffNote} />
                    <div className="grid grid-cols-3 gap-3">
                       {[{ id: 'TOKTOK', label: 'توكتوك', icon: <Zap className="h-4 w-4" /> }, { id: 'MOTORCYCLE', label: 'موتوسيكل', icon: <Bike className="h-4 w-4" /> }, { id: 'CAR', label: 'سيارة', icon: <Car className="h-4 w-4" /> }].map(v => (
                         <button key={v.id} onClick={() => setSelectedVehicle(v.id as VehicleType)} className={`py-5 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all font-black text-[10px] uppercase tracking-widest ${selectedVehicle === v.id ? 'bg-emerald-50 border-emerald-500 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400'}`}>
                           {v.icon} {v.label}
                         </button>
                       ))}
                    </div>
                    {(pickupVillage && dropoffVillage) && (
                      <div className="bg-white p-8 rounded-[3.5rem] border-4 border-emerald-50 shadow-2xl space-y-6 animate-reveal overflow-hidden relative">
                        <div className="flex justify-between items-center relative z-10">
                           <div className="text-right">
                              <h4 className="text-xl font-black text-slate-800 flex items-center gap-2 flex-row-reverse"><Calculator className="h-5 w-5 text-emerald-600" /> التكلفة التقريبية</h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">بناءً على المسافة ونوع المركبة</p>
                           </div>
                           <div className="bg-emerald-600 text-white px-8 py-4 rounded-[2rem] shadow-xl"><p className="text-3xl font-black">{isCalculatingDist ? '...' : estimatedPrice} <span className="text-xs opacity-60">ج.م</span></p></div>
                        </div>
                      </div>
                    )}
                    <button onClick={() => handleCreateOrder()} disabled={isSubmitting || !dropoffVillage || (selectedCategory === 'TAXI' && !pickupVillage) || isCalculatingDist} className="w-full bg-slate-950 text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                       {isSubmitting ? <Loader2 className="animate-spin h-7 w-7" /> : <><Sparkles className="h-6 w-6 text-emerald-400" /> اطلب مشوارك الآن</>}
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-12 py-10">
               {activeOrder.status === OrderStatus.WAITING_FOR_OFFERS ? (
                 <div className="text-center space-y-8 animate-reveal">
                    <div className="bg-white p-12 rounded-full card-shadow relative inline-block border-4 border-emerald-50 shadow-2xl shadow-emerald-900/10"><Radar className="h-20 w-20 text-emerald-600 animate-pulse" /></div>
                    <div className="space-y-2">
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter">جاري البحث عن كباتن متاحين...</h2>
                       <p className="text-xs font-bold text-slate-400">ستظهر العروض في الأسفل خلال لحظات</p>
                    </div>
                    <div className="space-y-4">
                       {incomingOffers.map(offer => (
                         <div key={offer.id} className="bg-white p-6 rounded-[2.5rem] card-shadow flex justify-between items-center animate-in zoom-in border-2 border-emerald-50 hover:border-emerald-500 transition-all">
                            <button onClick={() => handleAcceptOffer(offer)} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">قبول {offer.price} ج.م</button>
                            <div className="text-right">
                               <p className="font-black text-slate-900">{offer.driverName}</p>
                               <div className="flex items-center gap-1 justify-end"><span className="text-[10px] font-black text-amber-500">{offer.driverRating || '5.0'}</span><Star className="h-3 w-3 fill-amber-400 text-amber-400" /></div>
                            </div>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => updateDoc(doc(db, "orders", activeOrder.id), { status: OrderStatus.CANCELLED })} className="text-rose-500 font-black text-xs uppercase hover:underline tracking-widest mt-8">إلغاء الطلب</button>
                 </div>
               ) : activeOrder.status === OrderStatus.DELIVERED ? (
                 <div className="animate-reveal space-y-8 text-center bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-emerald-500/10">
                    <PartyPopper className="h-24 w-24 text-emerald-500 mx-auto animate-bounce" />
                    <h2 className="text-4xl font-black text-slate-950 tracking-tighter">وصلت بالسلامة!</h2>
                    <p className="text-slate-400 font-bold">يرجى تقييم تجربة التوصيل مع الكابتن {activeOrder.driverName}</p>
                    <div className="bg-slate-50 p-8 rounded-[3rem] space-y-10">
                       <div className="flex justify-center gap-3">
                          {[1,2,3,4,5].map(s => (
                             <button key={s} onClick={() => setRating(s)} className="transition-all active:scale-75">
                                <Star className={`h-12 w-12 ${rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                             </button>
                          ))}
                       </div>
                       <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="هل لديك أي ملاحظات أخرى على الرحلة؟ (اختياري)" className="w-full bg-white border-none rounded-[2rem] p-6 font-bold text-sm outline-none text-right shadow-inner min-h-[120px]" />
                    </div>
                    <button onClick={handleRateTrip} disabled={isRatingSubmitting} className="w-full bg-[#10b981] text-white py-8 rounded-[3rem] font-black text-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                       {isRatingSubmitting ? <Loader2 className="h-8 w-8 animate-spin" /> : <><ThumbsUp /> تأكيد وإرسال التقييم</>}
                    </button>
                 </div>
               ) : (
                 <div className="space-y-8 animate-reveal">
                    {/* خريطة تتبع الكابتن المباشرة والمسار الفعلي */}
                    {driverLoc && (
                      <div className="h-64 md:h-80 rounded-[3.5rem] overflow-hidden border-4 border-white shadow-2xl relative animate-in zoom-in duration-500">
                        <MapContainer center={[driverLoc.lat, driverLoc.lng]} zoom={15} zoomControl={false} className="h-full w-full">
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                          
                          {/* الكابتن */}
                          <Marker position={[driverLoc.lat, driverLoc.lng]} icon={driverIcon}>
                             <Popup><p className="font-black text-xs text-right">مكان الكابتن الآن</p></Popup>
                          </Marker>

                          {/* الوجهة (نقطة استلام العميل أو الوجهة) */}
                          <Marker position={[activeOrder.pickup.lat, activeOrder.pickup.lng]}>
                             <Popup><p className="font-black text-xs text-right">نقطة الالتقاء</p></Popup>
                          </Marker>

                          {/* رسم المسار الفعلي (OSRM Routing) */}
                          {routeGeometry.length > 0 && (
                            <Polyline positions={routeGeometry} color="#10b981" weight={6} opacity={0.6} />
                          )}

                          <MapAutoFit points={[[driverLoc.lat, driverLoc.lng], [activeOrder.pickup.lat, activeOrder.pickup.lng]]} />
                        </MapContainer>
                        <div className="absolute top-5 right-5 z-[1000] bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl text-[9px] font-black shadow-xl border border-slate-100 flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                           الكابتن يتحرك الآن
                        </div>
                      </div>
                    )}

                    <div className="bg-emerald-600 p-8 rounded-[3rem] text-white flex justify-between items-center shadow-xl">
                       <div className="text-right"><p className="text-xs font-black opacity-60 uppercase mb-1">تتبع الرحلة</p><h3 className="text-2xl font-black">{activeOrder.status}</h3></div>
                       <div className="bg-white/20 p-4 rounded-2xl"><Navigation className="h-8 w-8 animate-bounce" /></div>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                       <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl border-8 border-slate-100 flex items-center justify-center overflow-hidden relative">
                          {activeOrder.driverPhoto ? <img src={activeOrder.driverPhoto} className="w-full h-full object-cover" /> : (activeOrder.driverName || 'ك')[0]}
                       </div>
                       <div className="text-center"><h4 className="text-3xl font-black text-slate-950 tracking-tight">{activeOrder.driverName}</h4><p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-6 py-2 rounded-full inline-block mt-2">كابتن معتمد</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <a href={`tel:${activeOrder.driverPhone}`} className="bg-slate-950 text-white py-6 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl active:scale-95"><PhoneCall className="h-6 w-6" /> اتصال</a>
                       <button onClick={() => setShowChat(true)} className="bg-white border-2 border-slate-100 text-slate-900 py-6 rounded-3xl font-black flex items-center justify-center gap-3 active:scale-95 shadow-sm"><MessageCircle className="h-6 w-6" /> دردشة</button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100 px-6 py-6 flex justify-around items-center z-[150] shadow-2xl flex-row-reverse rounded-t-[3.5rem]">
         {[{id: 'NEW', icon: <Home className="h-6 w-6" />, label: 'الرئيسية'}, {id: 'ACTIVITY', icon: <History className="h-6 w-6" />, label: 'نشاطي'}, {id: 'PROFILE', icon: <UserIcon className="h-6 w-6" />, label: 'حسابي'}].map(tab => (
           <button key={tab.id} onClick={() => setActiveView(tab.id as any)} className={`flex flex-col items-center gap-1.5 transition-all border-none bg-transparent ${activeView === tab.id ? 'text-[#2D9469]' : 'text-slate-300'}`}><div className={`p-3.5 rounded-2xl transition-all ${activeView === tab.id ? 'bg-[#EBFDF5] shadow-inner scale-110' : ''}`}>{tab.icon}</div><span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span></button>
         ))}
      </nav>
    </div>
  );
};

export default CustomerDashboard;
