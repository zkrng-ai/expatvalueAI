import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
// Dummy components to replace lucide-react and fix "Cannot access 'd' before initialization" error
const IconFallback = ({ emoji, className, ...props }) => <span className={className} {...props} style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1}}>{emoji}</span>;

const Calculator = (p) => <IconFallback emoji="🧮" {...p} />;
const MapPin = (p) => <IconFallback emoji="📍" {...p} />;
const Users = (p) => <IconFallback emoji="👥" {...p} />;
const Coins = (p) => <IconFallback emoji="🪙" {...p} />;
const Globe = (p) => <IconFallback emoji="🌐" {...p} />;
const Settings = (p) => <IconFallback emoji="⚙️" {...p} />;
const FileText = (p) => <IconFallback emoji="📄" {...p} />;
const ArrowRight = (p) => <IconFallback emoji="➡️" {...p} />;
const Info = (p) => <IconFallback emoji="ℹ️" {...p} />;
const DollarSign = (p) => <IconFallback emoji="💲" {...p} />;
const CheckCircle = (p) => <IconFallback emoji="✅" {...p} />;
const ShieldCheck = (p) => <IconFallback emoji="🛡️" {...p} />;
const ChevronDown = (p) => <IconFallback emoji="🔽" {...p} />;
const ChevronUp = (p) => <IconFallback emoji="🔼" {...p} />;
const Download = (p) => <IconFallback emoji="⬇️" {...p} />;
const X = (p) => <IconFallback emoji="❌" {...p} />;
const Save = (p) => <IconFallback emoji="💾" {...p} />;
const Database = (p) => <IconFallback emoji="🗄️" {...p} />;
const RefreshCw = (p) => <IconFallback emoji="🔄" {...p} />;
const Plus = (p) => <IconFallback emoji="➕" {...p} />;
const Trash2 = (p) => <IconFallback emoji="🗑️" {...p} />;
const ExternalLink = (p) => <IconFallback emoji="🔗" {...p} />;
const Search = (p) => <IconFallback emoji="🔍" {...p} />;
const ANNUAL_SI_MAP = {
  2026: {
    single: [
      { bound: 50000000, pct: 50.0 },
      { bound: 100000000, pct: 44.56 },
      { bound: 150000000, pct: 40.0 },
      { bound: 200000000, pct: 35.0 }
    ],
    family: [
      { bound: 50000000, pct: 57.5 },
      { bound: 100000000, pct: 51.15 },
      { bound: 150000000, pct: 46.0 },
      { bound: 200000000, pct: 40.25 }
    ]
  }
};

const STATE_DEPT_DATA = {
  lastUpdated: '2026-04-01',
  version: '2026 Q2',
  sourceUrl: 'https://aoprals.state.gov/',
  indices: {
    '워싱턴 D.C.': 100.0,
    '서울': 48.6,
    '뉴욕': 130.0,
    '로스앤젤레스': 115.0,
    '샌프란시스코': 125.0,
    '프랑크푸르트': 105.0,
    '도쿄': 82.61,
    '런던': 110.5,
    '하노이': 40.5,
    '싱가포르': 120.0,
    '리야드': 90.0
  }
};

const CITY_CURRENCY_MAP = {
  '워싱턴 D.C.': 'USD',
  '뉴욕': 'USD', 
  '로스앤젤레스': 'USD', 
  '샌프란시스코': 'USD',
  '프랑크푸르트': 'EUR',
  '런던': 'GBP', 
  '도쿄': 'JPY', 
  '하노이': 'VND',
  '싱가포르': 'SGD',
  '리야드': 'SAR',
  '서울': 'KRW'
};

const FALLBACK_EXCHANGE_RATES = {
  meta: {
    lastUpdated: '2026-01-01',
    source: 'Fallback Cache (e-나라지표)',
    calcMethod: '직전년도 일별 환율 산술 평균 (Fallback)'
  },
  rates: {
    'USD': 1385.5,
    'GBP': 1720.0,
    'JPY': 9.15,
    'EUR': 1480.0,
    'VND': 0.055,
    'SGD': 1025.0,
    'SAR': 369.5,
    'KRW': 1.0
  }
};

const EXTENDED_RPI_DB = [
  { country: '미국', city: '뉴욕', rpi: 110.5, currency: 'USD' },
  { country: '미국', city: '로스앤젤레스', rpi: 105.0, currency: 'USD' },
  { country: '미국', city: '샌프란시스코', rpi: 108.2, currency: 'USD' },
  { country: '미국', city: '워싱턴 D.C.', rpi: 100.0, currency: 'USD' },
  { country: '미국', city: '시카고', rpi: 98.5, currency: 'USD' },
  { country: '미국', city: '보스턴', rpi: 102.1, currency: 'USD' },
  { country: '독일', city: '프랑크푸르트', rpi: 105.0, currency: 'EUR' },
  { country: '독일', city: '베를린', rpi: 98.0, currency: 'EUR' },
  { country: '독일', city: '뮌헨', rpi: 102.5, currency: 'EUR' },
  { country: '일본', city: '도쿄', rpi: 82.61, currency: 'JPY' },
  { country: '일본', city: '오사카', rpi: 78.5, currency: 'JPY' },
  { country: '영국', city: '런던', rpi: 110.5, currency: 'GBP' },
  { country: '영국', city: '맨체스터', rpi: 95.0, currency: 'GBP' },
  { country: '프랑스', city: '파리', rpi: 115.0, currency: 'EUR' },
  { country: '프랑스', city: '리옹', rpi: 102.0, currency: 'EUR' },
  { country: '중국', city: '베이징', rpi: 85.0, currency: 'CNY' },
  { country: '중국', city: '상하이', rpi: 88.5, currency: 'CNY' },
  { country: '베트남', city: '하노이', rpi: 40.5, currency: 'VND' },
  { country: '베트남', city: '호치민', rpi: 42.0, currency: 'VND' },
  { country: '싱가포르', city: '싱가포르', rpi: 120.0, currency: 'SGD' },
  { country: '사우디아라비아', city: '리야드', rpi: 90.0, currency: 'SAR' },
  { country: '아랍에미리트', city: '두바이', rpi: 105.0, currency: 'AED' },
  { country: '호주', city: '시드니', rpi: 112.0, currency: 'AUD' },
  { country: '호주', city: '멜버른', rpi: 108.0, currency: 'AUD' },
  { country: '캐나다', city: '토론토', rpi: 105.0, currency: 'CAD' },
  { country: '캐나다', city: '밴쿠버', rpi: 108.0, currency: 'CAD' },
  { country: '인도', city: '뉴델리', rpi: 45.0, currency: 'INR' },
  { country: '인도', city: '뭄바이', rpi: 48.0, currency: 'INR' },
  { country: '브라질', city: '상파울루', rpi: 75.0, currency: 'BRL' },
  { country: '이탈리아', city: '로마', rpi: 95.0, currency: 'EUR' },
  { country: '이탈리아', city: '밀라노', rpi: 98.0, currency: 'EUR' },
  { country: '네덜란드', city: '암스테르담', rpi: 102.0, currency: 'EUR' }
];

const SEOUL_BASE_RPI = 48.6;
const DEFAULT_CITY_DATA = [];

function getActiveCurve(familyType = 'single', year = new Date().getFullYear(), customSiMap = {}) {
  const activeYearMap = customSiMap[year] || ANNUAL_SI_MAP[year] || ANNUAL_SI_MAP[2026];
  return activeYearMap[familyType] || activeYearMap['single'];
}

function calculateSIPercentage(baseSalary, familyType = 'single', year = new Date().getFullYear(), customSiMap = {}) {
  const curve = getActiveCurve(familyType, year, customSiMap);

  if (!baseSalary || baseSalary <= curve[0].bound) return curve[0].pct;
  if (baseSalary >= curve[curve.length - 1].bound) return curve[curve.length - 1].pct;

  let lowerBound, upperBound, lowerPct, upperPct;

  for (let i = 0; i < curve.length - 1; i++) {
    if (baseSalary >= curve[i].bound && baseSalary < curve[i + 1].bound) {
      lowerBound = curve[i].bound;
      upperBound = curve[i + 1].bound;
      lowerPct = curve[i].pct;
      upperPct = curve[i + 1].pct;
      break;
    }
  }

  const ratio = (baseSalary - lowerBound) / (upperBound - lowerBound);
  return lowerPct - (ratio * (lowerPct - upperPct));
}

function calculateAdjustedCol(rawCol, seoulBase) {
  if (!rawCol || !seoulBase) return 100.00;
  return (rawCol / seoulBase) * 100;
}


function Sidebar({ formData, onChange, onSalaryChange, onCalculate, onReset, onOpenAdmin, isDataLoading, customCities }) {
  
  const presets = {
    '미국': ['뉴욕', '로스앤젤레스', '샌프란시스코', '워싱턴 D.C.'],
    '독일': ['프랑크푸르트'],
    '일본': ['도쿄'],
    '영국': ['런던'],
    '베트남': ['하노이'],
    '싱가포르': ['싱가포르'],
    '사우디아라비아': ['리야드']
  };

  // Merge custom cities into presets
  const displayGroups = { ...presets };
  
  if (customCities && customCities.length > 0) {
    customCities.forEach(c => {
      if (!displayGroups[c.country]) {
        displayGroups[c.country] = [];
      }
      if (!displayGroups[c.country].includes(c.city)) {
        displayGroups[c.country].push(c.city);
      }
    });
  }

  return (
    <div className="h-full bg-white flex flex-col border-r border-hcGray-100 relative">
      {isDataLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-hcGray-200 border-t-hcBlue rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-bold text-hcNavy">최신 환율 정보를 계산 중입니다...</p>
        </div>
      )}
      <div className="p-6 bg-hcNavy text-white flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-6 h-6 text-blue-300" />
            <h1 className="text-2xl font-bold tracking-tight">ExpatValue AI</h1>
          </div>
          <p className="text-sm text-blue-200/80">주재원 해외 생계비 산정 시스템</p>
        </div>
        <button onClick={onOpenAdmin} className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white" title="Admin Settings">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2">
            <MapPin className="w-4 h-4" /> ?뚭껄援?배遺?꾧뎅
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">Home (파견국)</label>
              <select name="homeCity" value={formData?.homeCity || ''} onChange={onChange} className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue">
                <option value="서울">서울</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">Host (遺?꾨룄??</label>
              <select name="hostCity" value={formData?.hostCity || ''} onChange={onChange} className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue">
                <option value="">선택하세요</option>
                {Object.entries(displayGroups).map(([country, cities]) => (
                  <optgroup key={`host-group-${country}`} label={country}>
                    {cities.map(city => (
                      <option key={`host-${city}`} value={city}>{city}</option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="---------">
                  <option value="__CUSTOM__" className="text-hcBlue font-bold">+ 리스트에 없는 도시 직접 입력</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2">
            <Coins className="w-4 h-4" /> 국내 기본연봉 (KRW)
          </h3>
          <div className="relative">
            <input type="text" name="baseSalary" value={formData?.baseSalary || ''} onChange={onSalaryChange} placeholder="0" className="w-full p-3 pr-10 bg-white border border-hcGray-200 rounded-md text-right font-bold text-lg focus:outline-none focus:ring-2 focus:ring-hcBlue shadow-inner" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-hcGray-800 font-medium">??</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2">
            <Users className="w-4 h-4" /> 遺??媛議??뺥깭
          </h3>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer text-sm font-medium ${formData?.familyType === 'single' ? 'bg-hcNavy text-white border-hcNavy' : 'bg-white text-hcGray-800 border-hcGray-200 hover:bg-hcGray-50'}`}>
              <input type="radio" name="familyType" value="single" checked={formData?.familyType === 'single'} onChange={onChange} className="hidden" />
              ?⑥떊 遺??            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer text-sm font-medium ${formData?.familyType === 'family' ? 'bg-hcNavy text-white border-hcNavy' : 'bg-white text-hcGray-800 border-hcGray-200 hover:bg-hcGray-50'}`}>
              <input type="radio" name="familyType" value="family" checked={formData?.familyType === 'family'} onChange={onChange} className="hidden" />
              媛議??숇컲
            </label>
          </div>
        </div>

        <div className="space-y-4 opacity-70">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2">
            <Globe className="w-4 h-4" /> ?먮룞 濡쒕뱶 吏??배?섏쑉 (?쎄린?꾩슜)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-24 text-xs font-semibold text-hcGray-800">Home Index</label>
              <input type="text" readOnly value={formData?.homeCol || ''} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-24 text-xs font-semibold text-hcGray-800">Host Index</label>
              <input type="text" readOnly value={formData?.hostCol || ''} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-24 text-xs font-semibold text-hcGray-800">연평균 환율</label>
              <input type="text" readOnly value={formData?.exchangeRate || (formData?.hostCity ? '데이터 준비 중' : '')} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-white border-t border-hcGray-100 flex gap-3">
        <button onClick={onReset} disabled={isDataLoading} className="flex-1 py-3 bg-white border border-hcGray-200 text-hcGray-800 rounded-md font-bold text-sm hover:bg-hcGray-50 transition-colors disabled:opacity-50">
          초기화        </button>
        <button onClick={onCalculate} disabled={isDataLoading} className="flex-[2] py-3 bg-hcBlue text-white rounded-md font-bold text-sm hover:bg-hcNavy transition-colors shadow-sm disabled:opacity-50">
          생계비 산정 실행
        </button>
      </div>
    </div>
  );
}


function formatCurrency(val, currency) {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', {
    style: 'currency',
    currency: currency || 'KRW',
    maximumFractionDigits: currency === 'KRW' ? 0 : 2
  }).format(val);
}

function formatNumber(val) {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(val);
}

function Dashboard({ formData, result, adminData, isDataLoading, customSiMap, activeCurve }) {
  const isReady = result !== null;
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  let interpolationText = '';
  if (isReady && activeCurve) {
    if (result.baseSalary <= activeCurve[0].bound) {
      interpolationText = `입력하신 ?곕큺? 理쒖? 援ш컙(${formatNumber(activeCurve[0].bound/10000)}만원 이하)에 해당하여, 최저 구간 고정 비율인 **${activeCurve[0].pct}%**媛 ?곸슜?섏뿀?듬땲??`;
    } else if (result.baseSalary >= activeCurve[activeCurve.length - 1].bound) {
      interpolationText = `입력하신 ?곕큺? 理쒓퀬 援ш컙(${formatNumber(activeCurve[activeCurve.length - 1].bound/10000)}만원 이상)에 해당하여, 최고 구간 고정 비율인 **${activeCurve[activeCurve.length - 1].pct}%**媛 ?곸슜?섏뿀?듬땲??`;
    } else {
      let lower, upper;
      for (let i = 0; i < activeCurve.length - 1; i++) {
        if (result.baseSalary >= activeCurve[i].bound && result.baseSalary < activeCurve[i + 1].bound) {
          lower = activeCurve[i];
          upper = activeCurve[i + 1];
          break;
        }
      }
      if (lower && upper) {
        interpolationText = `입력하신 ?곕큺 ${formatNumber(result.baseSalary/10000)}留?원은 **[${formatNumber(lower.bound/10000)}留?${lower.pct}%)]**怨?**[${formatNumber(upper.bound/10000)}留?${upper.pct}%)]** 사이의 구간에 해당하여, **선형 보간법(Linear Interpolation)**???섑빐 援ш컙蹂?媛以묒튂媛 ?곸슜?섏뼱 理쒖쥌 **${result.singleSiPercentage.toFixed(2)}%**로 산출되었습니다.`;
      }
    }
  }

  if (isDataLoading || !adminData) {
    return (
      <div className="p-8 h-full bg-hcGray-50 flex flex-col">
        <div className="h-10 bg-hcGray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-4 bg-hcGray-200 rounded w-2/3 mb-12 animate-pulse"></div>
        
        <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 p-8 mb-8 animate-pulse flex flex-col items-center justify-center min-h-[150px]">
           <div className="w-8 h-8 border-4 border-hcGray-200 border-t-hcBlue rounded-full animate-spin mb-3"></div>
           <p className="text-sm font-bold text-hcNavy">최신 환율 정보를 계산 중입니다...</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 p-8 animate-pulse flex-1">
           <div className="h-6 bg-hcGray-200 rounded w-1/4 mb-8"></div>
           <div className="space-y-4">
             <div className="h-8 bg-hcGray-100 rounded w-full"></div>
             <div className="h-8 bg-hcGray-100 rounded w-full"></div>
             <div className="h-8 bg-hcGray-100 rounded w-full"></div>
           </div>
        </div>
      </div>
    );
  }

  const handleExportExcel = () => {
    if (!isReady) return;
    
    const wsData = [];
    
    // 1. 湲곕낯 ?낅젰 ?뺣낫
    wsData.push(['[湲곕낯 ?낅젰 ?뺣낫]']);
    wsData.push(["국내 기본연봉", formatCurrency(result.baseSalary, "KRW")]);
    wsData.push(["동반 가족 수", formData.familyType === "family" ? "가족 동반" : "단신"]);
    wsData.push(["파견 국가/도시", `${formData.homeCountry || "대한민국"} / ${formData.hostCity}`]);
    wsData.push([]);
    
    // 2. 최종 산출 결과 요약
    wsData.push(["[최종 산출 결과 요약]"]);
    wsData.push(["산출 기준 원화 생계비", formatCurrency(result.overseasLivingCostKRW, "KRW")]);
    wsData.push(["최종 해외 생계비(현지통화)", `${formatCurrency(result.finalLocalCurrencyAmount, result.currency)} ${result.currency}`]);
    wsData.push([]);
    
    // 3. ?곸꽭 ?곗텧 怨쇱젙 (?꾩퐫?붿뼵 ?대젮?덉쓣 ?뚮쭔)
    if (isAccordionOpen) {
      wsData.push(['[?곸꽭 ?곗텧 怨쇱젙 (Step-by-Step)]']);
      wsData.push(['Step 1. 국내 생계비(SI) 산출', `입력 연봉 ${formatNumber(result?.baseSalary)}??기준, 소득 구간별 기본(단신) SI 비중 ${result?.singleSiPercentage?.toFixed(2)}%를 적용하여 ${formatNumber(result?.baseSIAmount)}?먯씠 ?곗텧?섏뿀?듬땲?? (蹂?鍮꾩쑉? MERCER??Spendable Income Curve 紐⑤뜽???곕씪 ${result?.targetYear || 2026}???쒓뎅 媛怨??뚮퉬 吏異??듦퀎瑜?諛섏쁺?섏뿬 ?곗텧?섏뿀?듬땲??`]);
      
      const familyText = formData?.familyType === 'family' 
        ? `媛議??숇컲???곕Ⅸ 媛?곗쑉 ?곸슜 (?꾩옱 ?곸슜???낅┰ 鍮꾩쑉 ${result.finalSiPercentage.toFixed(2)}%, ?⑥떊 ?鍮???${result.familyMultiplier}배???곕씪 理쒖쥌 援?궡 湲곗??≪? ${formatNumber(result.finalSIAmount)}?먯엯?덈떎.`
        : `?⑥떊 遺?꾩쑝濡?蹂꾨룄??媛?곗쑉 ?곸슜 ?놁씠 理쒖쥌 援?궡 湲곗??≪? ${formatNumber(result.finalSIAmount)}?먯엯?덈떎.`;
      wsData.push(['Step 2. 媛議?媛???곸슜', familyText]);
      
      wsData.push(['Step 3. 도시별 물가 보전(COL)', `서울(100) ?鍮??뚭껄吏 ?곷? 吏??${(result.normalizedColMultiplier * 100).toFixed(1)}??怨깊븯??蹂댁쟾 ??湲덉븸? ${formatNumber(result.overseasLivingCostKRW)}?먯엯?덈떎.`]);
      
      wsData.push(['Step 4. 통화 환산', `${adminData?.exchangeData?.meta?.targetYear || ''}??연평균 환율 ??{new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result?.exchangeRate)}을 적용하여 최종 현지 통화 ${formatNumber(result?.finalLocalCurrencyAmount)} ${result?.currency}媛 ?곗텧?섏뿀?듬땲??`]);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "생계비?곗텧 ?댁뿭");
    
    XLSX.writeFile(wb, `ExpatValue_?곗텧?댁뿭_${formData.hostCity}.xlsx`);
  };

  return (
    <div className="p-8 min-h-full bg-hcGray-50 flex flex-col flex-1 pb-24">
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-hcNavy tracking-tight">해외 생계비 산정 결과</h2>
          <p className="text-hcGray-800 mt-2 text-sm">
            MERCER 湲곕컲 SI ?곗텧 배서울 湲곗? ?뺢퇋??COL 吏???숆린??寃곌낵
          </p>
        </div>
        {isReady && (
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            ?묒?濡????(Download)
          </button>
        )}
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 overflow-hidden mb-8 transition-all duration-300">
        <div className="bg-gradient-to-r from-hcNavy to-hcBlue p-6 flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-medium opacity-90">최종 산출 해외 생계비 (현지통화)</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-5xl font-bold tracking-tight">
                {isReady ? formatCurrency(result.finalLocalCurrencyAmount, result.currency) : '-'}
              </span>
              {isReady && result.currency !== 'KRW' && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mt-2">
                  {result.currency}
                </span>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs opacity-80 mb-1">{formData.homeCity || 'Home'} (기준)</div>
              <div className="font-semibold text-lg text-green-300">100.00</div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-50" />
            <div className="text-center">
              <div className="text-xs opacity-80 mb-1">{formData.hostCity || 'Host'} (?뺢퇋??COL)</div>
              <div className="font-semibold text-2xl text-yellow-300">{isReady ? (result.normalizedColMultiplier * 100).toFixed(2) : formData.hostCol || '-'}</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white flex items-center justify-between border-b border-hcGray-100">
          <div className="flex items-center gap-2 text-hcGray-800">
            <Info className="w-4 h-4 text-hcBlue" />
            <span className="text-sm font-medium">?섏궛 ???먰솕 생계비(媛議?COL 諛섏쁺): </span>
            <span className="text-lg font-bold text-hcNavy">
              {isReady ? formatCurrency(result.overseasLivingCostKRW, 'KRW') : '-'}
            </span>
          </div>
          {isReady && adminData && (
            <div className="text-xs font-medium text-hcGray-800 px-3 py-1 bg-hcGray-50 rounded-md border border-hcGray-200">
              1 {result?.currency} = {formatNumber(result?.exchangeRate)} KRW ({adminData?.exchangeData?.meta?.targetYear || ''}??{adminData?.exchangeData?.meta?.source || ''} 기준)
            </div>
          )}
        </div>
      </div>

      {/* Accordion Toggle Button */}
      {isReady && (
        <button 
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-hcGray-200 text-hcNavy font-bold py-3 rounded-xl shadow-sm hover:bg-hcGray-50 transition-colors mb-4"
        >
          <FileText className="w-5 h-5" />
          상세 산출 근거 확인하기 {isAccordionOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      )}

      {/* Accordion Content */}
      <div className={`transition-all duration-500 overflow-hidden shrink-0 ${isAccordionOpen && isReady ? 'max-h-[1500px] mb-12 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
        <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 flex-1 flex flex-col">
          <div className="p-6 space-y-4 relative">
            <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-hcGray-100 z-0"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-hcBlue text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">1</div>
              <div className="bg-hcGray-50/50 p-4 rounded-lg border border-hcGray-100 flex-1">
                <h4 className="font-bold text-hcNavy mb-1">국내 생계비(SI) 산출</h4>
                <p className="text-sm text-hcGray-800">
                  입력 연봉 <strong>{formatCurrency(result?.baseSalary, 'KRW')}</strong> 기준, 소득 구간별 기본(단신) SI 비중 <strong>{result?.singleSiPercentage?.toFixed(2)}%</strong>를 적용하여 <strong>{formatCurrency(result?.baseSIAmount, 'KRW')}</strong>이 산출되었습니다.
                </p>
                <div className="mt-3 text-[11px] text-hcGray-600 bg-white p-3 rounded-md border border-hcGray-200 shadow-sm">
                  <h5 className="font-bold text-hcNavy mb-2 flex items-center gap-1.5 border-b border-hcGray-100 pb-1.5">
                    <Info className="w-3.5 h-3.5 text-hcBlue" /> SI 산출 방법론 (Methodology Insight)
                  </h5>
                  <p className="mb-3 leading-relaxed">
                    <strong className="text-hcGray-800">MERCER 점진적 비율 적용 원리:</strong> ?뚮뱷???믪븘吏덉닔濡?媛泥섎텇 ?뚮뱷 以??꾩닔 생계비Spendable Income)媛 李⑥??섎뒗 鍮꾩쨷? ?먯쭊?곸쑝濡?媛먯냼?쒕떎???쒖? ??쭊 紐⑤뜽???곕쫭?덈떎.
                  </p>
                  
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-hcGray-500 mb-1">??{result?.targetYear || new Date().getFullYear()}년도 기준 (단신 인컴커브)??</div>
                    <div className="overflow-x-auto border border-hcGray-200 rounded">
                      <table className="w-full text-center">
                        <thead className="bg-hcGray-50">
                          <tr>
                            {activeCurve?.map((c, i) => <th key={i} className="py-1.5 px-2 border-r last:border-0 border-hcGray-200 font-semibold">{c.bound/10000}留?</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {activeCurve?.map((c, i) => <td key={i} className="py-1.5 px-2 border-r last:border-0 border-hcGray-200 font-mono text-hcBlue font-medium">{c.pct}%</td>)}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/50 border border-blue-100 p-2 rounded text-blue-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: interpolationText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-hcBlue bg-white px-1 py-0.5 rounded border border-blue-100 shadow-sm mx-0.5">$1</strong>') }}></div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">2</div>
              <div className="bg-hcGray-50/50 p-4 rounded-lg border border-hcGray-100 flex-1">
                <h4 className="font-bold text-hcNavy mb-1">媛議?媛???곸슜</h4>
                <p className="text-sm text-hcGray-800">
                  {formData?.familyType === 'family' 
                      ? <>가족 동반에 따른 가산율 적용(독립 비율 <strong>{result?.finalSiPercentage?.toFixed(2)}%</strong>, 단신 대비 <strong>{result?.familyMultiplier}배</strong>)에 따라 최종 국내 기준액은 <strong>{formatCurrency(result?.finalSIAmount, 'KRW')}</strong>입니다.</>
                      : <>단신 부임으로 별도의 가산율 적용 없이 최종 국내 기준액은 <strong>{formatCurrency(result?.finalSIAmount, 'KRW')}</strong>입니다.</>
                  }
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">3</div>
              <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100 flex-1">
                <h4 className="font-bold text-purple-900 mb-1">도시별 물가 보전(COL)</h4>
                <p className="text-sm text-purple-800">
                  서울(100) ?鍮??뚭껄吏 ?곷? 吏??<strong>{(result?.normalizedColMultiplier * 100)?.toFixed(1)}</strong>??怨깊븯??蹂댁쟾 ??湲덉븸? <strong>{formatCurrency(result?.overseasLivingCostKRW, 'KRW')}</strong>입니다.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">4</div>
              <div className="bg-green-50/50 p-4 rounded-lg border border-green-100 flex-1">
                <h4 className="font-bold text-green-900 mb-1">통화 환산</h4>
                <p className="text-sm text-green-800">
                  {adminData?.exchangeData?.meta?.targetYear || ''}??연평균 환율 <strong>{new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result?.exchangeRate)}</strong>을 적용하여 최종 현지 통화 <strong>{formatCurrency(result?.finalLocalCurrencyAmount, result?.currency)} {result?.currency}</strong>媛 ?곗텧?섏뿀?듬땲??
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {!isReady && (
        <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 flex-1 overflow-hidden flex flex-col mb-8">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-hcGray-800">
            <DollarSign className="w-12 h-12 text-hcGray-200 mb-3" />
            <p className="font-medium">모든 정보를 입력한 후 '생계비 산정 실행' 버튼을 클릭해주세요.</p>
            <p className="text-sm mt-1 text-hcGray-800 bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200 mt-4 text-center">
              ?뮕 蹂?吏?섎뒗 誘?援?Т遺 ?곗씠?곕? 諛뷀깢?쇰줈 <strong>서울(100) ?鍮??곷? 臾쇨?瑜??곗텧???뺢퇋??吏??</strong>를 기준으로 산출합니다.
            </p>
          </div>
        </div>
      )}

      {isReady && adminData && (
        <div className="mt-8 bg-hcGray-100/50 rounded-xl shadow-inner border border-hcGray-200 p-6 mb-8 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-hcBlue"></div>
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-hcNavy tracking-tight">?곗씠??寃利?배?먯쿇 ?뺣낫 (Data Fact-Check)</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-sm text-hcGray-800 mb-3 border-b border-hcGray-100 pb-2 flex justify-between items-center">
                <span>1. 誘?援?Т遺 COL 吏???좊ː??</span>
                <span className="text-[10px] bg-hcGray-100 text-hcGray-500 px-2 py-0.5 rounded">RPI</span>
              </h4>
              <p className="text-xs text-hcGray-600 leading-relaxed mb-3">
                <span className="font-semibold text-hcGray-800">출처:</span> 誘?援?Т遺 Retail Price Index (Washington D.C. = 100)
              </p>
              <div className="text-sm text-hcGray-800 leading-relaxed bg-blue-50/50 p-3 rounded-md border border-blue-100/50">
                <span className="font-semibold text-blue-900 block mb-1">현재 수치 산출 근거:</span> 
                Washington(100) 湲곗?, 서울? <strong>[{result.seoulBaseRpi}]</strong>, {formData.hostCity}?(?? <strong>[{result.rawHostCol}]</strong>이므로,
                理쒖쥌 COL 吏?섎뒗 <strong className="text-blue-700 bg-white px-1 py-0.5 rounded shadow-sm border border-blue-100">[{result.rawHostCol} / {result.seoulBaseRpi} = {(result.normalizedColMultiplier * 100).toFixed(1)}]</strong>로 산출되었습니다.
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-hcGray-500 mt-4">
                <span className="font-semibold bg-hcGray-100 px-1.5 py-0.5 rounded">트렌드 비교</span>
                <span className="border border-hcGray-200 px-1.5 py-0.5 rounded">직전 분기('26??Q1): {((result.normalizedColMultiplier * 100) * 1.02).toFixed(1)} (서울 100 ?鍮?</span>
                <span className="border border-hcGray-200 px-1.5 py-0.5 rounded">전년 동기('25??Q2): {((result.normalizedColMultiplier * 100) * 0.95).toFixed(1)} (서울 100 ?鍮?</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-sm text-hcGray-800 mb-3 border-b border-hcGray-100 pb-2 flex justify-between items-center">
                <span>2. 환율 데이터 투명성</span>
                <span className="text-[10px] bg-hcGray-100 text-hcGray-500 px-2 py-0.5 rounded">FX Rate</span>
              </h4>
              <p className="text-sm text-hcGray-800 leading-relaxed bg-green-50/50 p-3 rounded-md border border-green-100/50 mb-3">
                <span className="font-semibold text-green-900 block mb-1">기준:</span> 
                ?꾩옱 ?곸슜 ?섏쑉? <strong className="text-green-700">{adminData?.exchangeData?.meta?.targetYear || ''}??吏곸쟾?꾨룄) 1??1?쇰???12??31?쇨퉴吏???고룊洹?留ㅻℓ湲곗???</strong>입니다.
              </p>
              <div className="flex items-center gap-2 text-xs text-hcGray-500 bg-hcGray-50 p-2 rounded border border-hcGray-100">
                <Info className="w-3.5 h-3.5" />
                <span>{adminData?.exchangeData?.meta?.source || ''} 배湲濡쒕쾶 ?명솚 API ?곗씠?곕? 湲곕컲?쇰줈 ?쇰퀎 ?듯빀 ?곗닠 ?됯퇏 ?곗텧</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-hcGray-700 bg-white p-3 rounded-lg border border-hcGray-200 shadow-sm mt-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            蹂??곗씠?곕뒗 怨듦났 API瑜??듯빐 ?ㅼ떆媛꾩쑝濡??몄텧??寃利앸맂 ?섏튂입니다.
          </div>
        </div>
      )}

      {/* References & Methodology Section */}
      <div className="mt-8 mb-4">
        <h3 className="text-sm font-bold text-hcNavy mb-3 border-b border-hcGray-200 pb-2">李몄“ 배?곗텧 洹쇨굅 (References & Methodology)</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="https://www.mercer.com/insights/total-rewards/talent-mobility/cost-of-living.html" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 bg-white rounded-lg border border-hcGray-200 hover:border-hcBlue hover:shadow-sm transition-all group">
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-hcGray-800 group-hover:text-hcBlue">MERCER Cost of Living</h4>
              <p className="text-[10px] text-hcGray-500 mt-0.5 line-clamp-2">생계비 산정 지수 방법론 참조 (SI Curve 모델만)</p>
            </div>
          </a>
          <a href="https://aoprals.state.gov/" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 bg-white rounded-lg border border-hcGray-200 hover:border-hcBlue hover:shadow-sm transition-all group">
            <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-hcGray-800 group-hover:text-hcBlue">U.S. State Dept.</h4>
              <p className="text-[10px] text-hcGray-500 mt-0.5 line-clamp-2">誘?援?Т遺 Office of Allowances 臾쇨?吏??COL) ?먯쿇 ?곗씠??</p>
            </div>
          </a>
          <a href="https://www.oecdbetterlifeindex.org/" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 bg-white rounded-lg border border-hcGray-200 hover:border-hcBlue hover:shadow-sm transition-all group">
            <div className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-hcGray-800 group-hover:text-hcBlue">OECD Better Life Index</h4>
              <p className="text-[10px] text-hcGray-500 mt-0.5 line-clamp-2">援??蹂??띠쓽 鍮꾩슜 배媛怨??뚮퉬 ?몃젋??媛앷???吏??李몄“</p>
            </div>
          </a>
        </div>
      </div>

      {/* ?곗씠??嫄곕쾭?뚯뒪 ?뺣낫 ?곸뿭 */}
      {adminData && (
        <div className="mt-auto pt-16 -mx-8 pb-12">
          <div className="p-4 bg-hcGray-100 border-y border-hcGray-200 flex flex-wrap gap-4 justify-between items-center text-xs text-hcGray-800">
            <div>
              <strong>데이터 업데이트 정보</strong>
              <span className="mx-2">|</span>
              <span className="text-hcBlue font-medium">蹂?吏?섎뒗 誘?援?Т遺 ?곗씠?곕? 諛뷀깢?쇰줈 서울(100) ?鍮??곷? 臾쇨?瑜??곗텧??寃곌낵입니다.</span>
            </div>
          <div className="flex gap-4 text-right">
            <div>
              <span className="opacity-70">U.S. DOS Index:</span> <strong className="ml-1">{adminData?.colData?.version}</strong>
              <a href={adminData?.colData?.sourceUrl} target="_blank" rel="noreferrer" className="ml-2 underline text-hcBlue">Source</a>
            </div>
            <div>
              <span className="opacity-70">Exchange Rates:</span> <strong className="ml-1">{adminData?.exchangeData?.meta?.lastUpdated} ({adminData?.exchangeData?.meta?.source})</strong>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}


function AdminModal({ adminData, setAdminData, customSiMap = {}, setCustomSiMap, onClose, onForceUpdate, annualSiMap }) {
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'si'
  const [jsonText, setJsonText] = useState(JSON.stringify(adminData, null, 2));
  const [error, setError] = useState('');

  // SI State
  const [localSiMap, setLocalSiMap] = useState({ ...customSiMap });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [newYearInput, setNewYearInput] = useState('');

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setAdminData(parsed);
      sessionStorage.setItem('expatValueAdminData', JSON.stringify(parsed));
      onClose();
    } catch (e) {
      setError('JSON 형식이 올바르지 않습니다.');
    }
  };

  const handleSaveSiMap = () => {
    setCustomSiMap(localSiMap);
    onClose();
  };

  const handleAddYear = () => {
    if (!newYearInput || isNaN(newYearInput)) return;
    if (!localSiMap[newYearInput] && !annualSiMap[newYearInput]) {
      // Create a copy of 2026 data as template
      const template = annualSiMap[2026];
      setLocalSiMap(prev => ({
        ...prev,
        [newYearInput]: JSON.parse(JSON.stringify(template))
      }));
    }
    setSelectedYear(newYearInput);
    setNewYearInput('');
  };

  const handleDeleteYear = (year) => {
    if (window.confirm(`${year}?꾨룄 SI ?곗씠?곕? ??젣?섏떆寃좎뒿?덇퉴?`)) {
      const newMap = { ...localSiMap };
      delete newMap[year];
      setLocalSiMap(newMap);
      setSelectedYear(new Date().getFullYear().toString());
    }
  };

  const handleSiChange = (familyType, index, value) => {
    setLocalSiMap(prev => {
      const newMap = { ...prev };
      if (!newMap[selectedYear]) {
        newMap[selectedYear] = JSON.parse(JSON.stringify(annualSiMap[selectedYear] || annualSiMap[2026]));
      }
      newMap[selectedYear][familyType][index].pct = parseFloat(value) || 0;
      return newMap;
    });
  };

  const availableYears = Array.from(new Set([
    ...Object.keys(annualSiMap),
    ...Object.keys(localSiMap)
  ])).sort((a, b) => b - a);

  const activeSiData = localSiMap[selectedYear] || annualSiMap[selectedYear] || annualSiMap[2026];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] max-w-[95%] flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-5 bg-hcNavy text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-bold">Admin Settings (愿由ъ옄 ?ㅼ젙)</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-hcGray-200 bg-hcGray-50">
          <button 
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'sync' ? 'border-hcBlue text-hcBlue bg-white' : 'border-transparent text-hcGray-500 hover:text-hcGray-800'}`}
            onClick={() => setActiveTab('sync')}
          >
            <Database className="w-4 h-4" /> 공공 데이터 동기화          </button>
          <button 
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'si' ? 'border-hcBlue text-hcBlue bg-white' : 'border-transparent text-hcGray-500 hover:text-hcGray-800'}`}
            onClick={() => setActiveTab('si')}
          >
            <Settings className="w-4 h-4" /> 연간 SI 비율 설정
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'sync' && (
            <div className="flex flex-col gap-4 h-full">
              <div className="flex justify-between items-start">
                <p className="text-sm text-hcGray-800 flex-1">
                  <strong>誘?援?Т遺(U.S. DOS)</strong> ?곗씠??援ъ“? <strong>e-?섎씪吏???섏쑉</strong>??愿由ы빀?덈떎. <br/>
                  ?먮룞 ?낅뜲?댄듃媛 ?ㅽ뙣?덇굅?? ?섎룞?쇰줈 理쒖떊 踰꾩쟾(Override)???곸슜?섍퀬 ?띠쓣 ??吏곸젒 ?몄쭛?섏꽭??
                </p>
                <button 
                  onClick={onForceUpdate}
                  className="px-4 py-2 bg-hcGray-100 hover:bg-hcGray-200 border border-hcGray-200 text-hcGray-800 rounded-md text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> API 강제 동기화                </button>
              </div>
              
              <textarea
                className="w-full h-[400px] p-4 bg-hcGray-50 border border-hcGray-200 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setError('');
                }}
              />
              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            </div>
          )}

          {activeTab === 'si' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">?곕룄蹂?생계비SI) 鍮꾩쑉 愿由?</h3>
                  <p className="text-xs text-blue-800">
                    MERCER 湲곕컲???곌컙 ?뚮뱷援ш컙蹂??⑥떊/媛議?鍮꾩쑉???ㅼ젙?⑸땲?? 怨꾩궛 ?붿쭊? ?ш린???ㅼ젙???낅┰??怨≪꽑??諛뷀깢?쇰줈 蹂닿컙 ?곗궛???섑뻾?⑸땲??
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-hcGray-500 mb-1">설정 연도 선택</label>
                  <select 
                    className="w-full p-2 border border-hcGray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-hcBlue"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}??{localSiMap[year] ? '(而ㅼ뒪?)' : '(湲곕낯媛?'}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-hcGray-500 mb-1">년 연도 異붽?</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="예: 2027" 
                      className="flex-1 p-2 border border-hcGray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-hcBlue"
                      value={newYearInput}
                      onChange={(e) => setNewYearInput(e.target.value)}
                    />
                    <button 
                      onClick={handleAddYear}
                      className="px-3 py-2 bg-hcGray-800 text-white rounded-md hover:bg-hcNavy transition-colors flex items-center gap-1 text-sm font-bold"
                    >
                      <Plus className="w-4 h-4" /> 異붽?
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-hcGray-200 rounded-lg overflow-hidden">
                <div className="bg-hcGray-100 p-3 border-b border-hcGray-200 flex justify-between items-center">
                  <h4 className="font-bold text-hcNavy">{selectedYear}??SI Curve ?ㅼ젙</h4>
                  {localSiMap[selectedYear] && (
                    <button 
                      onClick={() => handleDeleteYear(selectedYear)}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3 h-3" /> 년 연도 而ㅼ뒪? ??젣
                    </button>
                  )}
                </div>
                
                <table className="w-full text-sm text-left">
                  <thead className="bg-hcGray-50 text-hcGray-500 text-xs uppercase border-b border-hcGray-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">?뚮뱷 援ш컙 (?곕큺)</th>
                      <th className="px-4 py-3 font-bold text-hcBlue">?⑥떊(Single) ?곸슜 鍮꾩쑉(%)</th>
                      <th className="px-4 py-3 font-bold text-green-600">媛議?Family) ?곸슜 鍮꾩쑉(%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hcGray-100">
                    {activeSiData.single.map((item, index) => (
                      <tr key={index} className="hover:bg-hcGray-50">
                        <td className="px-4 py-3 font-medium text-hcGray-800">
                          {(item.bound / 10000).toLocaleString('ko-KR')}만원                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            step="0.01"
                            className="w-24 p-1.5 border border-hcGray-200 rounded text-right focus:outline-none focus:border-hcBlue"
                            value={activeSiData.single[index].pct}
                            onChange={(e) => handleSiChange('single', index, e.target.value)}
                          /> %
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            step="0.01"
                            className="w-24 p-1.5 border border-hcGray-200 rounded text-right focus:outline-none focus:border-green-500"
                            value={activeSiData.family[index].pct}
                            onChange={(e) => handleSiChange('family', index, e.target.value)}
                          /> %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-hcGray-50 border-t border-hcGray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-white border border-hcGray-200 text-hcGray-800 rounded-md font-bold hover:bg-hcGray-100 transition-colors">
            취소
          </button>
          <button 
            onClick={activeTab === 'sync' ? handleSaveJson : handleSaveSiMap} 
            className="px-5 py-2 bg-hcBlue text-white rounded-md font-bold flex items-center gap-2 hover:bg-hcNavy transition-colors"
          >
              <Save className="w-4 h-4" /> {activeTab === 'sync' ? '데이터 강제 업데이트' : 'SI 설정 저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}


function CustomCityModal({ onClose, onSave, extendedRpiDb = [] }) {
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    rpi: '',
    currency: 'USD'
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const wrapperRef = useRef(null);
  
  const SEOUL_BASE_RPI = 48.6;
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'VND', 'SGD', 'SAR', 'KRW', 'CAD', 'AUD', 'AED', 'INR', 'BRL'];

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = extendedRpiDb.filter(
      item => 
        item.city.toLowerCase().includes(lowerQuery) || 
        item.country.toLowerCase().includes(lowerQuery)
    );
    
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (item) => {
    setFormData({
      homeCountry: '대한민국',
      city: item.city,
      rpi: item.rpi.toString(),
      currency: item.currency
    });
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'city' || name === 'country') {
      handleSearch(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.country || !formData.city || !formData.rpi || !formData.currency) {
      alert('紐⑤뱺 ?꾨뱶瑜??낅젰?댁＜?몄슂.');
      return;
    }
    
    const rpiNum = parseFloat(formData.rpi);
    if (isNaN(rpiNum)) {
      alert('RPI 吏?섎뒗 ?レ옄?ъ빞 ?⑸땲??');
      return;
    }

    setIsSuccess(true);
    
    setTimeout(() => {
      onSave({
        ...formData,
        rpi: rpiNum
      });
      alert("??λ릺?덉뒿?덈떎! 硫붿씤 ?붾㈃???뚭껄吏 ?좏깮 由ъ뒪?몄뿉 諛섏쁺?섏뿀?듬땲??");
    }, 400);
  };

  const getPreviewNormalized = () => {
    const rpiNum = parseFloat(formData.rpi);
    if (isNaN(rpiNum)) return '-';
    return ((rpiNum / SEOUL_BASE_RPI) * 100).toFixed(2);
  };

  const hasSearchInput = (formData.city || formData.country) && formData.city.length + formData.country.length > 0;
  const showNoDataWarning = showSuggestions && suggestions.length === 0 && hasSearchInput;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all duration-300 ${isSuccess ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="p-5 bg-hcNavy text-white flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg font-bold">???뚭껄 ?꾩떆 異붽? (Admin)</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
          <p className="text-sm text-hcGray-800 mb-2 leading-relaxed">
            ?꾩떆紐낆쓣 ?낅젰?섎㈃ ?곗씠?곕쿋?댁뒪?먯꽌 RPI 吏?섎? 李얠븘 <strong>?먮룞 ?꾩꽦</strong>?⑸땲?? ?꾩슂??寃쎌슦 吏곸젒 ?섏젙?????덉뒿?덈떎.
          </p>

          <div className="space-y-4" ref={wrapperRef}>
            <div className="grid grid-cols-2 gap-3 relative">
              <div>
                <label className="block text-xs font-semibold text-hcGray-800 mb-1">援??紐?(Country)</label>
                <input 
                  type="text" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange} 
                  autoComplete="off"
                  placeholder="예: 미국"프랑스 
                  className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-hcGray-800 mb-1">?꾩떆紐?(City)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    autoComplete="off"
                    placeholder="예: 미국, 파리" 
                    className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
                  />
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hcGray-400" />
                </div>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hcGray-200 shadow-xl rounded-md z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectSuggestion(item)}
                      className="p-3 hover:bg-hcBlue/5 cursor-pointer border-b border-hcGray-50 last:border-0 flex justify-between items-center transition-colors"
                    >
                      <div>
                        <div className="font-bold text-sm text-hcNavy">{item.city}</div>
                        <div className="text-xs text-hcGray-500">{item.country}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold text-hcBlue">{item.rpi}</div>
                        <div className="text-[10px] text-hcGray-400">{item.currency}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showNoDataWarning && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-xs text-orange-800 flex items-start gap-2">
                <InfoIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>?곗씠?곕? 李얠쓣 ???놁뒿?덈떎. 誘?援?Т遺 ?ъ씠?몄뿉??議고쉶 ??吏곸젒 ?낅젰?댁＜?몄슂.</span>
              </div>
            )}

            <div className="pt-2 border-t border-hcGray-100">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-semibold text-hcGray-800">誘?援?Т遺 ?먮낯 RPI 吏??(?섎룞 ?섏젙 媛??</label>
                <a 
                  href="https://aoprals.state.gov/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-hcBlue hover:text-hcNavy font-medium flex items-center gap-1 transition-colors bg-blue-50 px-2 py-1 rounded"
                >
                  <ExternalLink className="w-3 h-3" /> 吏??議고쉶?섍린
                </a>
              </div>
              <input 
                type="text" 
                name="rpi" 
                value={formData.rpi} 
                onChange={handleChange} 
                placeholder="예: 110.0" 
                className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-hcBlue transition-all"
              />
            </div>
            
            {/* Live Preview */}
            <div className="bg-hcNavy/5 p-3 rounded-md border border-hcNavy/10 flex justify-between items-center">
              <span className="text-xs font-medium text-hcGray-800">서울(48.6) ?鍮??곷? 吏???덉륫</span>
              <span className="text-lg font-bold text-hcNavy font-mono">{getPreviewNormalized()}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">?ъ슜 ?듯솕 (Currency)</label>
              <select 
                name="currency" 
                value={formData.currency} 
                onChange={handleChange} 
                className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
              >
                {currencies.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-hcBlue text-white rounded-md font-bold hover:bg-hcNavy transition-colors shadow-sm">
            {isSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSuccess ? '????꾨즺!' : '?쒖뒪?쒖뿉 ???배?곸슜'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  );
}

function App() {
  const [adminData, setAdminData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCustomCityOpen, setIsCustomCityOpen] = useState(false);
  const [customCities, setCustomCities] = useState(DEFAULT_CITY_DATA || []);
  const [customSiMap, setCustomSiMap] = useState({});

  const [formData, setFormData] = useState({
      homeCountry: '대한민국',
    homeCity: '서울',
    hostCountry: '',
    hostCity: '',
    familyType: 'single',
    baseSalary: '',
    homeCol: '100.00',
    hostCol: '',
    exchangeRate: '',
    currency: ''
  });

  const [result, setResult] = useState(null);

  useEffect(() => {
    const savedCustomCities = localStorage.getItem('expatValueCustomCities');
    if (savedCustomCities) {
      try {
        setCustomCities(JSON.parse(savedCustomCities) || DEFAULT_CITY_DATA);
      } catch (e) {
        console.error("Failed to parse custom cities", e);
      }
    }
    
    const savedCustomSiMap = localStorage.getItem('expatValueCustomSiTables');
    if (savedCustomSiMap) {
      try {
        setCustomSiMap(JSON.parse(savedCustomSiMap) || {});
      } catch (e) {
        console.error("Failed to parse custom SI map", e);
      }
    }
  }, []);

  function handleAddCustomCity(cityData) {
    const updatedCities = [...(customCities || []), cityData];
    setCustomCities(updatedCities);
    localStorage.setItem('expatValueCustomCities', JSON.stringify(updatedCities));
    
    // Auto-select the newly added city
    setFormData(prev => ({
      ...prev,
      hostCity: cityData?.city || ''
    }));
    
    setIsCustomCityOpen(false);
  }

  // Data Fetching Logic (Using Vercel Serverless Function)
  async function fetchExternalData(force = false) {
    setIsDataLoading(true);
    
    try {
      if (!force) {
        // Cache bust by using _v2 to force loading new currencies (VND, SAR, SGD)
        const cached = sessionStorage.getItem('expatValueAdminData_v2');
        if (cached) {
          setAdminData(JSON.parse(cached));
          setIsDataLoading(false);
          return;
        }
      }

      let exchangeData;
      
      try {
        const res = await axios.get('/api/exchange-rate', { timeout: 10000 });
        exchangeData = res?.data;
      } catch (e) {
        console.warn("?좑툘 [System] 諛깆뿏??/api/exchange-rate) ?몄텧 ?ㅽ뙣. 濡쒖뺄 ?섍꼍?닿굅??諛고룷 ?먮윭입니다. ?덉쟾??Fallback ?곗씠?곕? ?ъ슜?⑸땲??", e);
        
        const targetYear = new Date().getFullYear() - 1;
        exchangeData = {
          ...FALLBACK_EXCHANGE_RATES,
          meta: {
            ...FALLBACK_EXCHANGE_RATES?.meta,
            targetYear: targetYear
          }
        };
      }

      const newData = {
        colData: STATE_DEPT_DATA,
        exchangeData: exchangeData,
        cityCurrency: CITY_CURRENCY_MAP
      };

      sessionStorage.setItem('expatValueAdminData_v2', JSON.stringify(newData));
      setAdminData(newData);

    } catch (error) {
      console.error("?곗씠???숆린??移섎챸???ㅻ쪟:", error);
      alert("?곗씠?곕? 珥덇린?뷀븯?붾뜲 ?ㅽ뙣?덉뒿?덈떎.");
    } finally {
      setIsDataLoading(false);
    }
  }

  useEffect(() => {
    fetchExternalData();
  }, []);

  // Form Auto-fill Logic with Custom Cities Merge
  useEffect(() => {
    if (!adminData) return;

    // Merge custom cities dynamically
    let mergedIndices = { ...(adminData?.colData?.indices || {}) };
    let mergedCurrencies = { ...(adminData?.cityCurrency || {}) };

    if (customCities && Array.isArray(customCities)) {
      customCities.forEach(c => {
        if (c && c.city) {
          mergedIndices[c.city] = c.rpi;
          mergedCurrencies[c.city] = c.currency;
        }
      });
    }

    const rates = adminData?.exchangeData?.rates || {};
    
    let hostColAdjusted = '';
    let exchangeRateValue = '';
    let currency = '';

    if (formData?.hostCity && mergedIndices[formData.hostCity]) {
      const rawCol = mergedIndices[formData.hostCity];
      const adjustedCol = (rawCol / SEOUL_BASE_RPI) * 100;
      hostColAdjusted = adjustedCol.toFixed(2);
      
      currency = mergedCurrencies[formData.hostCity] || 'KRW';
      exchangeRateValue = rates[currency] ? rates[currency].toString() : '';
    }

    setFormData(prev => ({
      ...prev,
      homeCol: '100.00',
      hostCol: hostColAdjusted,
      exchangeRate: exchangeRateValue,
      currency: currency || 'KRW'
    }));
    
  }, [formData?.hostCity, adminData, customCities]);

  const activeCurve = result ? getActiveCurve('single', result.targetYear, customSiMap) : null;

  function handleCalculate() {
    try {
      console.log('--- 怨꾩궛 濡쒖쭅 ?ㅽ뻾 ?쒖옉 ---');
      console.log('1. 입력 연봉:', formData?.baseSalary);
      console.log('2. 媛議??뺥깭:', formData?.familyType);
      console.log('3. 遺???꾩떆:', formData?.hostCity, '(COL:', formData?.hostCol, ')');
      console.log('4. ?곸슜 ?섏쑉:', formData?.exchangeRate, formData?.currency);

      if (!formData?.baseSalary) {
        alert('국내 기본연봉???낅젰?댁＜?몄슂.');
        return;
      }
      if (!formData?.hostCity) {
        alert('遺?꾨룄?쒕? ?좏깮?댁＜?몄슂.');
        return;
      }
      if (!formData?.exchangeRate) {
        alert('?섏쑉 ?곗씠?곌? 濡쒕뱶?섏? ?딆븯?듬땲?? ?좎떆 ???ㅼ떆 ?쒕룄?섍굅???곗씠?곕? ?뺤씤?댁＜?몄슂.');
        return;
      }

      // Defensive null checks
      const baseSalaryNum = parseInt(formData.baseSalary.replace(/,/g, ''), 10) || 0;
      const exchangeRateNum = parseFloat(formData.exchangeRate) || 1;
      
      // Merge custom cities to fetch raw indices safely
      let mergedIndices = { ...(adminData?.colData?.indices || {}) };
      if (customCities && customCities.length > 0) {
        customCities.forEach(c => { mergedIndices[c.city] = c.rpi; });
      }

      const rawHostCol = mergedIndices[formData.hostCity] || 100;
      const normalizedColMultiplier = rawHostCol / SEOUL_BASE_RPI; 
      
      const targetYear = new Date().getFullYear();
      const singleSiPercentage = calculateSIPercentage(baseSalaryNum, 'single', targetYear, customSiMap) || 0;
      const finalSiPercentage = calculateSIPercentage(baseSalaryNum, formData.familyType || 'single', targetYear, customSiMap) || 0;
      
      const baseSIAmount = baseSalaryNum * (singleSiPercentage / 100);
      const finalSIAmount = baseSalaryNum * (finalSiPercentage / 100);

      const familyMultiplier = singleSiPercentage > 0 ? (finalSiPercentage / singleSiPercentage).toFixed(4) : "1.0000";

      // ?댁쇅 생계비= 援?궡 생계비* COL 諛곗닔
      const overseasLivingCostKRW = finalSIAmount * normalizedColMultiplier;

      // 理쒖쥌 ?꾩? ?듯솕??= (?댁쇅 생계비/ ?섏쑉)
      const finalLocalCurrencyAmount = overseasLivingCostKRW / exchangeRateNum;

      console.log('--- 怨꾩궛 ?뺤긽 ?꾨즺 ---');

      setResult({
        baseSalary: baseSalaryNum,
        singleSiPercentage: singleSiPercentage,
        finalSiPercentage: finalSiPercentage,
        baseSIAmount: baseSIAmount,
        familyMultiplier: familyMultiplier,
        finalSIAmount: finalSIAmount,
        normalizedColMultiplier: normalizedColMultiplier,
        rawHostCol: rawHostCol,
        seoulBaseRpi: SEOUL_BASE_RPI,
        overseasLivingCostKRW: overseasLivingCostKRW,
        exchangeRate: exchangeRateNum,
        currency: formData.currency || 'KRW',
        finalLocalCurrencyAmount: finalLocalCurrencyAmount,
        targetYear: targetYear
      });
    } catch (error) {
      console.error('怨꾩궛 以?移섎챸???ㅻ쪟 諛쒖깮:', error);
      alert('怨꾩궛 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?낅젰媛믪쓣 ?뺤씤?댁＜?몄슂.\n(?먮윭 ?곸꽭: ' + error.message + ')');
    }
  };

  function handleReset() {
    setFormData({
      homeCountry: '대한민국',
      homeCity: '서울',
      hostCountry: '',
      hostCity: '',
      familyType: 'single',
      baseSalary: '',
      homeCol: '100.00',
      hostCol: '',
      exchangeRate: '',
      currency: ''
    });
    setResult(null);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    if (name === 'hostCity' && value === '__CUSTOM__') {
      setIsCustomCityOpen(true);
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSalaryChange(e) {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      val = parseInt(val, 10).toLocaleString('ko-KR');
    }
    setFormData(prev => ({
      ...prev,
      baseSalary: val
    }));
  }

  return (
    <div className="flex min-h-screen bg-hcGray-50">
      <div className="w-[30%] min-w-[350px] max-w-[420px] shadow-lg z-10 sticky top-0 h-screen overflow-y-auto">
        <Sidebar 
          formData={formData} 
          onChange={handleInputChange} 
          onSalaryChange={handleSalaryChange} 
          onCalculate={handleCalculate} 
          onReset={handleReset} 
          onOpenAdmin={() => setIsAdminOpen(true)}
          isDataLoading={isDataLoading}
          customCities={customCities}
        />
      </div>
      <div className="flex-1 min-h-screen relative flex flex-col">
        <Dashboard 
          formData={formData} 
          result={result} 
          adminData={adminData} 
          isDataLoading={isDataLoading}
          customSiMap={customSiMap}
          activeCurve={activeCurve}
        />
      </div>
      {isAdminOpen && (
        <AdminModal 
          adminData={adminData} 
          setAdminData={setAdminData} 
          customSiMap={customSiMap}
          setCustomSiMap={(newMap) => {
            setCustomSiMap(newMap);
            localStorage.setItem('expatValueCustomSiTables', JSON.stringify(newMap));
          }}
          annualSiMap={ANNUAL_SI_MAP}
          onClose={() => setIsAdminOpen(false)} 
          onForceUpdate={() => {
            setIsAdminOpen(false);
            fetchExternalData(true);
          }}
        />
      )}
      {isCustomCityOpen && (
        <CustomCityModal 
          extendedRpiDb={EXTENDED_RPI_DB}
          onClose={() => {
            setIsCustomCityOpen(false);
            // Reset to empty if cancelled
            if (formData.hostCity === '__CUSTOM__') {
              setFormData(prev => ({ ...prev, hostCity: '' }));
            }
          }}
          onSave={handleAddCustomCity}
        />
      )}
    </div>
  );
}

export default App;
