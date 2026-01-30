
import type { Village, District } from '../types';

export type { District };

export const PLATFORM_COMMISSION_RATE = 0.15;

/**
 * البيانات الجغرافية الشاملة والنهائية لمحافظة المنوفية
 * تم تحديث القائمة لتشمل كافة الوحدات المحلية والقرى التابعة للمراكز العشرة
 */
export const MENOFIA_DATA: District[] = [
  {
    id: 'd-ashmoun',
    name: 'أشمون',
    villages: [
      { id: 'ash-city', name: 'مدينة أشمون', center: { lat: 30.2931, lng: 30.9863 } },
      { id: 'v-shamma', name: 'شما', center: { lat: 30.3122, lng: 30.9658 } },
      { id: 'v-samadoun', name: 'سمادون', center: { lat: 30.2858, lng: 30.9636 } },
      { id: 'v-santes', name: 'سنتريس', center: { lat: 30.3008, lng: 30.9439 } },
      { id: 'v-saqia', name: 'ساقية أبو شعرة', center: { lat: 30.3256, lng: 30.9394 } },
      { id: 'v-sabk', name: 'سبك الأحد', center: { lat: 30.3219, lng: 30.9981 } },
      { id: 'v-gris', name: 'جريس', center: { lat: 30.3361, lng: 30.9812 } },
      { id: 'v-shatanouf', name: 'شطانوف', center: { lat: 30.3297, lng: 30.9268 } },
      { id: 'v-darwa', name: 'دروة', center: { lat: 30.2500, lng: 30.9800 } },
      { id: 'v-shanshour', name: 'شنشور', center: { lat: 30.2799, lng: 30.9507 } },
      { id: 'v-talia', name: 'طليا', center: { lat: 30.2450, lng: 30.9350 } },
      { id: 'v-anjab', name: 'الأنجب', center: { lat: 30.3700, lng: 30.9900 } },
      { id: 'v-ramla-ash', name: 'رملة الأنجب', center: { lat: 30.3750, lng: 30.9850 } },
      { id: 'v-khadra', name: 'الخضرة', center: { lat: 30.3200, lng: 30.9700 } },
      { id: 'v-monsha-sultan', name: 'منشأة سلطان', center: { lat: 30.3550, lng: 31.0100 } },
      { id: 'v-smalay', name: 'سملاي', center: { lat: 30.2750, lng: 30.9550 } },
      { id: 'v-qours', name: 'قورص', center: { lat: 30.3150, lng: 30.9500 } },
      { id: 'v-dalhamou', name: 'دلهمو', center: { lat: 30.3150, lng: 30.9250 } },
      { id: 'v-tahway', name: 'طهواي', center: { lat: 30.3089, lng: 30.9322 } },
      { id: 'v-abu-raqaba', name: 'أبو رقبة', center: { lat: 30.3450, lng: 30.9750 } },
      { id: 'v-amreia', name: 'العامرية', center: { lat: 30.3600, lng: 31.0150 } },
      { id: 'v-kafr-amreia', name: 'كفر العامرية', center: { lat: 30.3650, lng: 31.0200 } },
      { id: 'v-barania', name: 'البرانية', center: { lat: 30.2400, lng: 30.9250 } },
      { id: 'v-sandafeis', name: 'صندفيس', center: { lat: 30.2400, lng: 30.9900 } },
      { id: 'v-lawaizeh', name: 'اللوايزة', center: { lat: 30.3900, lng: 31.0200 } },
      { id: 'v-mansh-santes', name: 'منشأة سنتريس', center: { lat: 30.3050, lng: 30.9400 } },
      { id: 'v-ezbet-bakr', name: 'عزبة بكر', center: { lat: 30.3000, lng: 30.9850 } },
      { id: 'v-ezbet-aly', name: 'عزبة علي', center: { lat: 30.3050, lng: 30.9900 } },
      { id: 'v-ashma', name: 'أشما', center: { lat: 30.2950, lng: 30.9500 } },
      { id: 'v-hallawsi', name: 'الحلواصي', center: { lat: 30.3300, lng: 30.9350 } },
      { id: 'v-kafr-mansour', name: 'كفر منصور', center: { lat: 30.3350, lng: 30.9400 } },
      { id: 'v-monil-doweeb', name: 'منيل دويب', center: { lat: 30.3500, lng: 30.9200 } },
      { id: 'v-boha-shatanouf', name: 'بوهة شطانوف', center: { lat: 30.3400, lng: 30.9200 } },
      { id: 'v-kafr-el-gharid', name: 'كفر الغريب', center: { lat: 30.3200, lng: 31.0100 } }
    ]
  },
  {
    id: 'd-shebin',
    name: 'شبين الكوم',
    villages: [
      { id: 'shebin-city', name: 'مدينة شبين الكوم', center: { lat: 30.5612, lng: 31.0125 } },
      { id: 'v-elmay', name: 'الماي', center: { lat: 30.5200, lng: 30.9500 } },
      { id: 'v-elbetanoun', name: 'البتانون', center: { lat: 30.6100, lng: 31.0500 } },
      { id: 'v-shanawan', name: 'شنوان', center: { lat: 30.5100, lng: 31.0100 } },
      { id: 'v-milia', name: 'مليج', center: { lat: 30.6000, lng: 31.0000 } },
      { id: 'v-bakhati', name: 'بخاتي', center: { lat: 30.5800, lng: 30.9400 } },
      { id: 'v-shobrabas', name: 'شبرا باص', center: { lat: 30.5400, lng: 30.9700 } },
      { id: 'v-el-moselha', name: 'المصيلحة', center: { lat: 30.5400, lng: 31.0500 } },
      { id: 'v-zowat-el-ghazal', name: 'زاوية الغزال', center: { lat: 30.5700, lng: 31.0300 } },
      { id: 'v-meet-khalaf', name: 'ميت خلف', center: { lat: 30.5300, lng: 31.0400 } },
      { id: 'v-tobloha', name: 'تبلوها', center: { lat: 30.6300, lng: 31.0200 } },
      { id: 'v-el-rahba', name: 'الراهب', center: { lat: 30.5500, lng: 31.0350 } },
      { id: 'v-shobra-khalfoun', name: 'شبرا خلفون', center: { lat: 30.5850, lng: 30.9700 } },
      { id: 'v-kom-el-dabaa-sh', name: 'كوم الضبع', center: { lat: 30.5250, lng: 30.9800 } },
      { id: 'v-tanbedi', name: 'طنبدي', center: { lat: 30.6400, lng: 31.0400 } },
      { id: 'v-kafr-el-moselha', name: 'كفر المصيلحة', center: { lat: 30.5500, lng: 31.0400 } },
      { id: 'v-selka', name: 'سلكا', center: { lat: 30.5100, lng: 30.9800 } },
      { id: 'v-zowat-el-kanater', name: 'زاوية القناطر', center: { lat: 30.5750, lng: 31.0450 } }
    ]
  },
  {
    id: 'd-menouf',
    name: 'منوف',
    villages: [
      { id: 'menouf-city', name: 'مدينة منوف', center: { lat: 30.4667, lng: 30.9333 } },
      { id: 'v-feisha-kobra', name: 'فيشا الكبرى', center: { lat: 30.4000, lng: 30.9667 } },
      { id: 'v-barahim', name: 'براهيم', center: { lat: 30.4833, lng: 30.9500 } },
      { id: 'v-al-haswa', name: 'الحصوة', center: { lat: 30.4500, lng: 30.9000 } },
      { id: 'v-zowat-rabein', name: 'زاوية رزين', center: { lat: 30.4100, lng: 30.8800 } },
      { id: 'v-tamalay', name: 'طملاي', center: { lat: 30.4900, lng: 30.9100 } },
      { id: 'v-sanhour', name: 'سنهور', center: { lat: 30.5100, lng: 30.9200 } },
      { id: 'v-deberky', name: 'دبركي', center: { lat: 30.4200, lng: 30.9800 } },
      { id: 'v-el-houli', name: 'الحولي', center: { lat: 30.4400, lng: 30.9400 } },
      { id: 'v-kafr-fiars', name: 'كفر فيشا', center: { lat: 30.4050, lng: 30.9500 } },
      { id: 'v-elhamoul', name: 'الحامول', center: { lat: 30.4400, lng: 30.9700 } },
      { id: 'v-sanjarg', name: 'سنجرج', center: { lat: 30.4300, lng: 30.9900 } },
      { id: 'v-behwash', name: 'بهواش', center: { lat: 30.4800, lng: 30.8900 } },
      { id: 'v-gezi', name: 'جزي', center: { lat: 30.4100, lng: 30.8500 } },
      { id: 'v-monsha-el-sadat', name: 'منشأة السادات', center: { lat: 30.4300, lng: 30.8900 } }
    ]
  },
  {
    id: 'd-sers',
    name: 'سرس الليان',
    villages: [
      { id: 'sers-city-main', name: 'مدينة سرس الليان', center: { lat: 30.4333, lng: 30.9167 } }
    ]
  },
  {
    id: 'd-sadat',
    name: 'مدينة السادات',
    villages: [
      { id: 'sadat-center', name: 'مركز المدينة', center: { lat: 30.3833, lng: 30.5000 } },
      { id: 'v-khatatba', name: 'الخطاطبة', center: { lat: 30.3167, lng: 30.8000 } },
      { id: 'v-kafr-dawood', name: 'كفر داود', center: { lat: 30.4667, lng: 30.7333 } },
      { id: 'v-el-akhmas', name: 'الأخماس', center: { lat: 30.4000, lng: 30.6000 } },
      { id: 'v-el-breigat', name: 'البريجات', center: { lat: 30.3500, lng: 30.7500 } },
      { id: 'v-el-tahra', name: 'الطاهرة', center: { lat: 30.4200, lng: 30.5500 } },
      { id: 'v-el-salam', name: 'قرية السلام', center: { lat: 30.3300, lng: 30.6500 } },
      { id: 'v-el-rehab', name: 'مدينة الرحاب', center: { lat: 30.4000, lng: 30.5000 } }
    ]
  },
  {
    id: 'd-bagour',
    name: 'الباجور',
    villages: [
      { id: 'bagour-city', name: 'مدينة الباجور', center: { lat: 30.4333, lng: 31.0333 } },
      { id: 'v-meet-afifi', name: 'ميت عفيف', center: { lat: 30.4167, lng: 31.0667 } },
      { id: 'v-estra', name: 'أسطرنط', center: { lat: 30.4500, lng: 31.0500 } },
      { id: 'v-behalshai', name: 'بهناي', center: { lat: 30.4000, lng: 31.0000 } },
      { id: 'v-meshirf', name: 'مشيرف', center: { lat: 30.4200, lng: 31.0800 } },
      { id: 'v-feisha-soghra', name: 'فيشا الصغرى', center: { lat: 30.4100, lng: 31.0200 } },
      { id: 'v-shobra-zangi', name: 'شبرا زنجي', center: { lat: 30.4600, lng: 31.0200 } },
      { id: 'v-el-koran-bagour', name: 'القرين', center: { lat: 30.4450, lng: 31.0600 } },
      { id: 'v-kafr-el-bagour', name: 'كفر الباجور', center: { lat: 30.4250, lng: 31.0400 } },
      { id: 'v-sabk-el-dahak', name: 'سبك الضحاك', center: { lat: 30.4500, lng: 31.0800 } },
      { id: 'v-garwan', name: 'جروان', center: { lat: 30.4000, lng: 31.0500 } },
      { id: 'v-bai-el-arab', name: 'بي العرب', center: { lat: 30.3800, lng: 31.0200 } },
      { id: 'v-talbant-abshish', name: 'تلبنت أبشيش', center: { lat: 30.4800, lng: 31.0600 } },
      { id: 'v-qalti-kobra', name: 'قلتي الكبرى', center: { lat: 30.4700, lng: 31.0300 } }
    ]
  },
  {
    id: 'd-quesna',
    name: 'قويسنا',
    villages: [
      { id: 'quesna-city', name: 'مدينة قويسنا', center: { lat: 30.5500, lng: 31.1333 } },
      { id: 'v-arab-raml', name: 'عرب الرمل', center: { lat: 30.5167, lng: 31.1500 } },
      { id: 'v-meet-berra', name: 'ميت برة', center: { lat: 30.5000, lng: 31.1167 } },
      { id: 'v-taha-shobra', name: 'طه شبرا', center: { lat: 30.5833, lng: 31.1500 } },
      { id: 'v-ashlim', name: 'أشليم', center: { lat: 30.5300, lng: 31.1800 } },
      { id: 'v-el-koramia', name: 'الكرامية', center: { lat: 30.5600, lng: 31.1000 } },
      { id: 'v-shobra-qabala', name: 'شبرا قبالة', center: { lat: 30.5400, lng: 31.1400 } },
      { id: 'v-meet-sirag', name: 'ميت سراج', center: { lat: 30.5700, lng: 31.1200 } },
      { id: 'v-ibshadi', name: 'إبشادي', center: { lat: 30.5900, lng: 31.1200 } },
      { id: 'v-kafr-abu-hassan', name: 'كفر أبو حسن', center: { lat: 30.5200, lng: 31.1000 } },
      { id: 'v-aghor-el-raml', name: 'أجهور الرمل', center: { lat: 30.4900, lng: 31.1600 } },
      { id: 'v-shobrabakhom', name: 'شبرابخوم', center: { lat: 30.5100, lng: 31.1800 } },
      { id: 'v-begerm', name: 'بجيرم', center: { lat: 30.5350, lng: 31.1200 } }
    ]
  },
  {
    id: 'd-berket',
    name: 'بركة السبع',
    villages: [
      { id: 'berket-city', name: 'مدينة بركة السبع', center: { lat: 30.6333, lng: 31.0833 } },
      { id: 'v-horin', name: 'هورين', center: { lat: 30.6167, lng: 31.1167 } },
      { id: 'v-abu-mashhour', name: 'أبو مشهور', center: { lat: 30.6667, lng: 31.1000 } },
      { id: 'v-toukh-dalaka', name: 'طوخ طنبشا', center: { lat: 30.6000, lng: 31.0667 } },
      { id: 'v-el-ghouri', name: 'الغوري', center: { lat: 30.6500, lng: 31.0700 } },
      { id: 'v-el-dabia', name: 'الضبعة', center: { lat: 30.6200, lng: 31.1000 } },
      { id: 'v-kafr-el-sheikh-shehata', name: 'كفر الشيخ شحاتة', center: { lat: 30.6400, lng: 31.0900 } },
      { id: 'v-kafr-hila', name: 'كفر هلال', center: { lat: 30.6700, lng: 31.0500 } },
      { id: 'v-meet-fares', name: 'ميت فارس', center: { lat: 30.6100, lng: 31.1300 } },
      { id: 'v-el-roda', name: 'الروضة', center: { lat: 30.6800, lng: 31.1200 } },
      { id: 'v-kafr-aleim', name: 'كفر عليم', center: { lat: 30.6400, lng: 31.1100 } }
    ]
  },
  {
    id: 'd-tala',
    name: 'تلا',
    villages: [
      { id: 'tala-city', name: 'مدينة تلا', center: { lat: 30.6833, lng: 30.9500 } },
      { id: 'v-babel', name: 'بابل', center: { lat: 30.6500, lng: 30.9333 } },
      { id: 'v-kafr-arab', name: 'كفر العرب', center: { lat: 30.7000, lng: 30.9667 } },
      { id: 'v-zenara', name: 'زنارة', center: { lat: 30.7167, lng: 30.9167 } },
      { id: 'v-shobrakhalaf-tala', name: 'شبرا خلفون', center: { lat: 30.6700, lng: 30.9000 } },
      { id: 'v-el-kawady-tala', name: 'الكوادي (تلا)', center: { lat: 30.7300, lng: 30.9400 } },
      { id: 'v-meet-abu-el-koum', name: 'ميت أبو الكوم', center: { lat: 30.7500, lng: 30.9200 } },
      { id: 'v-kafr-shokr', name: 'كفر شكر', center: { lat: 30.7200, lng: 30.9700 } },
      { id: 'v-kafr-babel', name: 'كفر بابل', center: { lat: 30.6600, lng: 30.9200 } },
      { id: 'v-zorqan', name: 'زرقان', center: { lat: 30.7300, lng: 30.8800 } },
      { id: 'v-kafr-rabie', name: 'كفر ربيع', center: { lat: 30.7500, lng: 30.9000 } },
      { id: 'v-bamm', name: 'بمم', center: { lat: 30.7000, lng: 31.0000 } }
    ]
  },
  {
    id: 'd-shohadaa',
    name: 'الشهداء',
    villages: [
      { id: 'shohadaa-city', name: 'مدينة الشهداء', center: { lat: 30.6000, lng: 30.8167 } },
      { id: 'v-zawyat-naura', name: 'زاوية الناعورة', center: { lat: 30.6333, lng: 30.7833 } },
      { id: 'v-meet-shahala', name: 'ميت شهالة', center: { lat: 30.5833, lng: 30.8333 } },
      { id: 'v-denashwai', name: 'دنشواي', center: { lat: 30.6167, lng: 30.7500 } },
      { id: 'v-kafr-elsalmia', name: 'كفر السالمية', center: { lat: 30.5950, lng: 30.7700 } },
      { id: 'v-sarsamous', name: 'سرساموس', center: { lat: 30.6400, lng: 30.8100 } },
      { id: 'v-nader', name: 'نادر', center: { lat: 30.6500, lng: 30.7500 } },
      { id: 'v-bishtami', name: 'بشتامي', center: { lat: 30.6800, lng: 30.7800 } },
      { id: 'v-gezira-hagar', name: 'جزيرة الحجر', center: { lat: 30.6000, lng: 30.7000 } }
    ]
  }
];

export const ASHMOUN_VILLAGES: Village[] = MENOFIA_DATA.flatMap(d => d.villages);

export const DEFAULT_PRICING = {
  basePrice: 12,           // فتحة العداد 12 جنيهاً
  pricePerKm: 9,           // 9 جنيه لكل كيلومتر (حسب الملف الحالي)
  minPrice: 20,            // أقل مشوار 20 جنيهاً
  maxPrice: 900,           // أقصى حد للرحلة
  sameVillagePrice: 15,     // داخل القرية الواحدة 15 جنيهاً
  deliveryBasePrice: 25,   // السعر الأساسي للتوصيل
  foodOutsidePricePerKm: 3, 
  multipliers: {
    MOTORCYCLE: 0.9,       // معامل الموتوسيكل
    TOKTOK: 1.0,            // معامل التوكتوك
    CAR: 2.0               // معامل السيارة
  }
};
