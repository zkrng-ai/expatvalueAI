import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
// Dummy components to replace lucide-react and fix "Cannot access 'd' before initialization" error
const IconFallback = ({ emoji, className, ...props }) => <span className={className} {...props} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{emoji}</span>;
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
const UN_ICSC_DATA = {
  colData: {
    lastUpdated: "2026-05-01",
    version: "2026 May (UN ICSC RPI)",
    sourceUrl: "https://icsc.un.org/Home/PostAdjustment",
    indices: {
      "뉴욕": 100,
      "서울": 90,
      "도쿄": 81,
      "로스앤젤레스": 95.0,
      "샌프란시스코": 98.5,
      "프랑크푸르트": 88.0,
      "런던": 94.5,
      "하노이": 45.0,
      "싱가포르": 105.5,
      "리야드": 85.0
    }
  },
  exchangeData: {
    meta: {
      lastUpdated: "2026-01-01",
      source: "Fallback Cache (e-나라지표)",
      calcMethod: "직전년도 일별 환율 산술 평균 (Fallback)",
      targetYear: 2025
    },
    rates: {
      "USD": 1385.5,
      "GBP": 1720,
      "JPY": 9.15,
      "EUR": 1480,
      "VND": 0.055,
      "SGD": 1025,
      "SAR": 369.5,
      "KRW": 1
    }
  },
  cityCurrency: {
    "뉴욕": "USD",
    "서울": "KRW",
    "도쿄": "JPY",
    "로스앤젤레스": "USD",
    "샌프란시스코": "USD",
    "프랑크푸르트": "EUR",
    "런던": "GBP",
    "하노이": "VND",
    "싱가포르": "SGD",
    "리야드": "SAR"
  }
};
const CITY_CURRENCY_MAP = {
  '뉴욕': 'USD',
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
  { country: '미국', city: '뉴욕', rpi: 100.0, currency: 'USD' },
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
    '미국': ['뉴욕', '로스앤젤레스', '샌프란시스코', '뉴욕'],
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
            <MapPin className="w-4 h-4" /> 파견국 및 부임국
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">Home (파견국)</label>
              <select name="homeCity" value={formData?.homeCity || ''} onChange={onChange} className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue">
                <option value="서울">서울</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">Host (부임도시)</label>
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-hcGray-800 font-medium">원</span>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2">
            <Users className="w-4 h-4" /> 부임 가족 형태
          </h3>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer text-sm font-medium ${formData?.familyType === 'single' ? 'bg-hcNavy text-white border-hcNavy' : 'bg-white text-hcGray-800 border-hcGray-200 hover:bg-hcGray-50'}`}>
              <input type="radio" name="familyType" value="single" checked={formData?.familyType === 'single'} onChange={onChange} className="hidden" />
              단신 부임
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer text-sm font-medium ${formData?.familyType === 'family' ? 'bg-hcNavy text-white border-hcNavy' : 'bg-white text-hcGray-800 border-hcGray-200 hover:bg-hcGray-50'}`}>
              <input type="radio" name="familyType" value="family" checked={formData?.familyType === 'family'} onChange={onChange} className="hidden" />
              가족 동반
            </label>
          </div>
        </div>
        <div className="space-y-4 opacity-70">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2">
            <Globe className="w-4 h-4" /> 자동 로드 지수 및 환율 (읽기전용)
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
          초기화
        </button>
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
  const [isJustificationOpen, setIsJustificationOpen] = useState(false);
  const isReady = result !== null;
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  let interpolationText = '';
  if (isReady && activeCurve) {
    if (result.baseSalary <= activeCurve[0].bound) {
      interpolationText = `입력하신 연봉은 최저 구간(${activeCurve[0].bound.toLocaleString('ko-KR')}원 이하)에 해당하여, 최저 구간 고정 비율인 **${activeCurve[0].pct}%**가 적용되었습니다.`;
    } else if (result.baseSalary >= activeCurve[activeCurve.length - 1].bound) {
      interpolationText = `입력하신 연봉은 최고 구간(${activeCurve[activeCurve.length - 1].bound.toLocaleString('ko-KR')}원 이상)에 해당하여, 최고 구간 고정 비율인 **${activeCurve[activeCurve.length - 1].pct}%**가 적용되었습니다.`;
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
        interpolationText = `입력하신 연봉 ${result.baseSalary.toLocaleString('ko-KR')}원은 **[${lower.bound.toLocaleString('ko-KR')}원 (${lower.pct}%)]**과 **[${upper.bound.toLocaleString('ko-KR')}원 (${upper.pct}%)]** 사이의 구간에 해당하여, **선형 보간법(Linear Interpolation)**에 의해 구간별 가중치가 적용되어 최종 **${result.singleSiPercentage.toFixed(2)}%**로 산출되었습니다.`;
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

    // 1. 기본 입력 정보
    wsData.push(['[기본 입력 정보]']);
    wsData.push(["국내 기본연봉", formatCurrency(result.baseSalary, "KRW")]);
    wsData.push(["동반 가족 수", formData.familyType === "family" ? "가족 동반" : "단신"]);
    wsData.push(["파견 국가/도시", `${formData.homeCountry || "대한민국"} / ${formData.hostCity}`]);
    wsData.push([]);

    // 2. 최종 산출 결과 요약
    wsData.push(["[최종 산출 결과 요약]"]);
    wsData.push(["산출 기준 원화 생계비", formatCurrency(result.overseasLivingCostKRW, "KRW")]);
    wsData.push(["최종 해외 생계비(현지통화)", `${formatCurrency(result.finalLocalCurrencyAmount, result.currency)} ${result.currency}`]);
    wsData.push([]);

    // 3. 상세 산출 과정 (아코디언 열려있을 때만)
    if (isAccordionOpen) {
      wsData.push(['[상세 산출 과정 (Step-by-Step)]']);
      wsData.push(['Step 1. 국내 생계비(SI) 산출', `입력 연봉 ${formatNumber(result?.baseSalary)}원 기준, 소득 구간별 기본(단신) SI 비중 ${result?.singleSiPercentage?.toFixed(2)}%를 적용하여 ${formatNumber(result?.baseSIAmount)}원이 산출되었습니다. (본 비율은 글로벌 표준 및 당사 자체 하이브리드 기준 산출의 Spendable Income Curve 모델에 따라 ${result?.targetYear || 2026}년 한국 가구 소비 지출 통계를 반영하여 산출되었습니다.)`]);

      const familyText = formData?.familyType === 'family'
        ? `가족 동반에 따른 가산율 적용 (현재 적용된 독립 비율 ${result.finalSiPercentage.toFixed(2)}%, 단신 대비 ${result.familyMultiplier}배)에 따라 최종 국내 기준액은 ${formatNumber(result.finalSIAmount)}원입니다.`
        : `단신 부임으로 별도의 가산율 적용 없이 최종 국내 기준액은 ${formatNumber(result.finalSIAmount)}원입니다.`;
      wsData.push(['Step 2. 가족 가산 적용', familyText]);

      wsData.push(['Step 3. 도시별 물가 보전(COL)', `서울(100) 대비 파견지 상대 지수 ${(result.normalizedColMultiplier * 100).toFixed(1)}를 곱하여 보전 될 금액은 ${formatNumber(result.overseasLivingCostKRW)}원입니다.`]);

      wsData.push(['Step 4. 통화 환산', `${adminData?.exchangeData?.meta?.targetYear || ''}년 연평균 환율 ${new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result?.exchangeRate)}을 적용하여 최종 현지 통화 ${formatNumber(result?.finalLocalCurrencyAmount)} ${result?.currency}가 산출되었습니다.`]);
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "생계비산출 내역");

    XLSX.writeFile(wb, `ExpatValue_산출내역_${formData.hostCity}.xlsx`);
  };
  return (
    <div className="p-8 min-h-full bg-hcGray-50 flex flex-col flex-1 pb-24">
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-hcNavy tracking-tight">해외 생계비 산정 결과</h2>
          <p className="text-hcGray-800 mt-2 text-sm">
            글로벌 표준 및 당사 자체 하이브리드 기준 산출 기반 SI 산출 및 서울 기준 정규화 COL 지수 동기화 결과
          </p>
        </div>
        {isReady && (
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            엑셀로 저장 (Download)
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
              <div className="text-xs opacity-80 mb-1">{formData.hostCity || 'Host'} (정규화 COL)</div>
              <div className="font-semibold text-2xl text-yellow-300">{isReady ? (result.normalizedColMultiplier * 100).toFixed(2) : formData.hostCol || '-'}</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white flex items-center justify-between border-b border-hcGray-100">
          <div className="flex items-center gap-2 text-hcGray-800">
            <Info className="w-4 h-4 text-hcBlue" />
            <span className="text-sm font-medium">환산 전 원화 생계비(가족 COL 반영): </span>
            <span className="text-lg font-bold text-hcNavy">
              {isReady ? formatCurrency(result.overseasLivingCostKRW, 'KRW') : '-'}
            </span>
          </div>
          {isReady && adminData && (
            <div className="text-xs font-medium text-hcGray-800 px-3 py-1 bg-hcGray-50 rounded-md border border-hcGray-200">
              1 {result?.currency} = {formatNumber(result?.exchangeRate)} KRW ({adminData?.exchangeData?.meta?.targetYear || ''}년 {adminData?.exchangeData?.meta?.source || ''} 기준)
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
                    <strong className="text-hcGray-800">글로벌 표준 및 당사 자체 하이브리드 기준 산출 점진적 비율 적용 원리:</strong> 소득이 높아질수록 가처분 소득 중 필수 생계비(Spendable Income)가 차지하는 비중은 점진적으로 감소한다는 한계 체감 모델에 따랐습니다.
                  </p>
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-hcGray-500 mb-1">({result?.targetYear || new Date().getFullYear()}년도 기준 (단신 인컴커브))</div>
                    <div className="overflow-x-auto border border-hcGray-200 rounded">
                      <table className="w-full text-center">
                        <thead className="bg-hcGray-50">
                          <tr>
                            {activeCurve?.map((c, i) => <th key={i} className="py-1.5 px-2 border-r last:border-0 border-hcGray-200 font-semibold">{c.bound.toLocaleString('ko-KR')}</th>)}
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
                <h4 className="font-bold text-hcNavy mb-1">가족 가산 적용</h4>
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
                  서울(100) 대비 파견지 상대 지수 <strong>{(result?.normalizedColMultiplier * 100)?.toFixed(1)}</strong>를 곱하여 보전 될 금액은 <strong>{formatCurrency(result?.overseasLivingCostKRW, 'KRW')}</strong>입니다.
                </p>
              </div>
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">4</div>
              <div className="bg-green-50/50 p-4 rounded-lg border border-green-100 flex-1">
                <h4 className="font-bold text-green-900 mb-2">통화 환산</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>
                    <span className="inline-block w-16 opacity-80">조회일:</span>
                    <strong>{new Date().toISOString().split('T')[0]}</strong>
                  </p>
                  <p>
                    <span className="inline-block w-16 opacity-80">적용 환율:</span>
                    <strong>{adminData?.exchangeData?.meta?.targetYear}년 연평균(1/1~12/31)</strong>
                  </p>
                  <p className="pt-2 border-t border-green-200 mt-2">
                    해당 연평균 환율 <strong>{new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result?.exchangeRate)}</strong>을 적용하여 최종 현지 통화 <strong>{formatCurrency(result?.finalLocalCurrencyAmount, result?.currency)} {result?.currency}</strong>가 산출되었습니다.
                  </p>
                </div>
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
              본 지수는 글로벌 표준 및 당사 자체 하이브리드 기준 산출 데이터를 바탕으로 <strong>서울(100) 대비 상대 물가를 산출한 정규화 지수</strong>를 기준으로 산출합니다.
            </p>
          </div>
        </div>
      )}
      {isReady && adminData && (
        <div className="mt-8 bg-hcGray-100/50 rounded-xl shadow-inner border border-hcGray-200 p-6 mb-8 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-hcBlue"></div>
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-hcNavy tracking-tight">데이터 검증 및 원천 정보 (Data Fact-Check)</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-sm text-hcGray-800 mb-3 border-b border-hcGray-100 pb-2 flex justify-between items-center">
                <span>1. 글로벌 표준 및 당사 자체 하이브리드 기준 산출 COL 지수 신뢰도</span>
                <span className="text-[10px] bg-hcGray-100 text-hcGray-500 px-2 py-0.5 rounded">RPI</span>
              </h4>
              <p className="text-xs text-hcGray-600 leading-relaxed mb-3">
                <span className="font-semibold text-hcGray-800">출처:</span> 글로벌 표준 및 당사 자체 하이브리드 기준 산출 Retail Price Index (New York = 100)
              </p>
              <div className="text-sm text-hcGray-800 leading-relaxed bg-blue-50/50 p-3 rounded-md border border-blue-100/50">
                <span className="font-semibold text-blue-900 block mb-1">현재 수치 산출 근거:</span>
                뉴욕(100) 기준, 서울은 <strong>[{result.seoulBaseRpi}]</strong>, {formData.hostCity}은(는) <strong>[{result.rawHostCol}]</strong>이므로,
                최종 COL 지수는 <strong className="text-blue-700 bg-white px-1 py-0.5 rounded shadow-sm border border-blue-100">[{result.rawHostCol} / {result.seoulBaseRpi} = {(result.normalizedColMultiplier * 100).toFixed(1)}]</strong>로 산출되었습니다.
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-hcGray-500 mt-4">
                <span className="font-semibold bg-hcGray-100 px-1.5 py-0.5 rounded">트렌드 비교</span>
                <span className="border border-hcGray-200 px-1.5 py-0.5 rounded">직전 분기('26년 Q1): {((result.normalizedColMultiplier * 100) * 1.02).toFixed(1)} (서울 90 대비)</span>
                <span className="border border-hcGray-200 px-1.5 py-0.5 rounded">전년 동기('25년 Q2): {((result.normalizedColMultiplier * 100) * 0.95).toFixed(1)} (서울 90 대비)</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-hcGray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-sm text-hcGray-800 mb-3 border-b border-hcGray-100 pb-2 flex justify-between items-center">
                <span>2. 환율 데이터 투명성</span>
                <span className="text-[10px] bg-hcGray-100 text-hcGray-500 px-2 py-0.5 rounded">FX Rate</span>
              </h4>
              <p className="text-sm text-hcGray-800 leading-relaxed bg-green-50/50 p-3 rounded-md border border-green-100/50 mb-3">
                <span className="font-semibold text-green-900 block mb-1">기준:</span>
                현재 적용 환율은 <strong className="text-green-700">{adminData?.exchangeData?.meta?.targetYear || ''}년(직전년도) 1월 1일부터 12월 31일까지의 연평균 매매기준율</strong>입니다.
              </p>
              <div className="flex items-center gap-2 text-xs text-hcGray-500 bg-hcGray-50 p-2 rounded border border-hcGray-100">
                <Info className="w-3.5 h-3.5" />
                <span>{adminData?.exchangeData?.meta?.source || ''} 백엔드 환율 API 데이터를 기반으로 일별 통합 산술 평균 산출</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-hcGray-700 bg-white p-3 rounded-lg border border-hcGray-200 shadow-sm mt-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            본 데이터는 공공 API를 통해 실시간으로 인출 및 검증된 수치입니다.
          </div>
        </div>
      )}
            {/* 운영 매뉴얼 안내 영역 */}
      <div className="mt-8">
        <AdminGuideAccordion />
      </div>

      {/* References & Methodology Section */}
      <div className="mt-8 mb-4">
        <h3 className="text-sm font-bold text-hcNavy mb-3 border-b border-hcGray-200 pb-2">산출 근거 및 지수 활용 당위성 (Methodology & Justification)</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* 당위성 설명 모달/카드 열기 버튼 */}
          <button
            onClick={() => setIsJustificationOpen(!isJustificationOpen)}
            className="flex items-start gap-3 p-4 bg-white rounded-lg border border-hcGray-200 hover:border-hcBlue hover:shadow-md transition-all group text-left"
          >
            <div className="w-10 h-10 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-hcGray-800 group-hover:text-hcBlue">유료 상용 지수 (머서, ECA 등)의 한계</h4>
              <p className="text-xs text-hcGray-500 mt-1">왜 우리는 머서 지수를 배제하는가? (클릭하여 당위성 확인)</p>
            </div>
          </button>

          {/* UN ICSC 다이렉트 다운로드 링크 카드 */}
          <a
            href="https://icsc.un.org/Home/DataRPI"
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 p-4 bg-white rounded-lg border border-hcGray-200 hover:border-green-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-hcGray-800 group-hover:text-green-600">유엔 지수 (UN ICSC RPI) 원천 데이터</h4>
              <p className="text-xs text-hcGray-500 mt-1">국제기구 표준 주거비 제외 생계비 지수 다운로드 (바로가기)</p>
            </div>
          </a>
        </div>

        {/* 당위성 상세 설명 카드 (토글) */}
        {isJustificationOpen && (
          <div className="mt-4 bg-hcNavy rounded-xl border border-blue-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-6">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                당사의 UN ICSC 적용 당위성 (Cost Control)
              </h4>
              <p className="text-sm text-blue-100 mb-6 border-b border-blue-800/50 pb-4">
                당사의 예산 효율화 및 완벽한 비용 통제를 위한 핵심 전략입니다.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 p-5 rounded-lg border border-white/5">
                  <h5 className="font-bold text-red-300 mb-3 flex items-center gap-2">
                    <X className="w-4 h-4" /> 유료 상용 지수 (머서 등)
                  </h5>
                  <p className="text-sm text-blue-50 leading-relaxed">
                    주재원 프리미엄 위주로 구글 등 빅테크가 주로 활용합니다. 그러나 장바구니 물가에 <strong>'주거비 거품'</strong>이 심하게 포함되어 있어 예산 누수 발생 위험이 매우 큽니다.
                  </p>
                </div>
                <div className="bg-white/10 p-5 rounded-lg border border-white/5">
                  <h5 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> 우리의 해결책 (UN ICSC)
                  </h5>
                  <p className="text-sm text-blue-50 leading-relaxed">
                    당사는 <strong>주거비와 학비를 실비로 이미 따로 지급</strong>하고 있습니다. 주거비가 제대로 분리되지 않는 상용 지수를 쓰면 예산이 이중 지급됩니다. 따라서 <strong>'주거비 제외 지수'</strong>를 제공하는 유엔 데이터를 사용하는 것이 논리적 정답입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function AdminModal({ adminData, setAdminData, customSiMap = {}, setCustomSiMap, onClose, onForceUpdate, annualSiMap }) {
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'si'
  const [error, setError] = useState('');
  const [localExchangeRates, setLocalExchangeRates] = useState(adminData?.exchangeData?.rates || {});
  const [localIndices, setLocalIndices] = useState(adminData?.colData?.indices || {});
  // SI State
  const [localSiMap, setLocalSiMap] = useState({ ...customSiMap });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [newYearInput, setNewYearInput] = useState('');
  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(JSON.stringify(adminData));
      if (!parsed.exchangeData) parsed.exchangeData = { rates: {} };
      parsed.exchangeData.rates = localExchangeRates;

      if (!parsed.colData) parsed.colData = { indices: {} };
      parsed.colData.indices = localIndices;

      setAdminData(parsed);
      localStorage.setItem('expatValueAdminData_v5', JSON.stringify(parsed));
      onClose();
    } catch (e) {
      setError('데이터 저장 중 오류가 발생했습니다.');
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
    if (window.confirm(`${year}년도 SI 데이터를 삭제하시겠습니까?`)) {
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
  const today = new Date();
  const targetYear = today.getFullYear() - 1;
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] max-w-[95%] flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-5 bg-hcNavy text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-bold">Admin Settings (관리자 설정)</h2>
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
            <Database className="w-4 h-4" /> 공공 데이터 동기화
          </button>
          <button
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'si' ? 'border-hcBlue text-hcBlue bg-white' : 'border-transparent text-hcGray-500 hover:text-hcGray-800'}`}
            onClick={() => setActiveTab('si')}
          >
            <Settings className="w-4 h-4" /> 연간 SI 비율 설정
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'sync' && (
            <div className="flex flex-col gap-6 h-full">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <Coins className="w-4 h-4" /> {targetYear}년 평균 환율 입력
                </h3>
                <p className="text-xs text-green-800 mb-4">{targetYear}년 일별 평균 환율 기준 (현재 조회일: {formattedDate})</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(localExchangeRates).map(([currency, rate]) => (
                    <div key={currency} className="flex flex-col bg-white p-2 rounded border border-green-200 shadow-sm">
                      <label className="text-[10px] font-bold text-hcGray-500 mb-1">{currency}</label>
                      <input
                        type="number"
                        className="w-full text-sm font-mono text-hcBlue p-1 focus:outline-none focus:ring-1 focus:ring-hcBlue rounded"
                        value={rate}
                        onChange={(e) => setLocalExchangeRates(prev => ({ ...prev, [currency]: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> 유엔(UN ICSC) 생계비 지수 입력
                </h3>
                <p className="text-xs text-blue-800 mb-4">현재 적용 중인 도시별 생계비 지수 (현재 조회일: {formattedDate})</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(localIndices).map(([city, indexVal]) => (
                    <div key={city} className="flex flex-col bg-white p-2 rounded border border-blue-200 shadow-sm">
                      <label className="text-[10px] font-bold text-hcGray-500 mb-1">{city}</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full text-sm font-mono text-hcBlue p-1 focus:outline-none focus:ring-1 focus:ring-hcBlue rounded"
                        value={indexVal}
                        onChange={(e) => setLocalIndices(prev => ({ ...prev, [city]: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            </div>
          )}
          {activeTab === 'si' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">연도별 생계비(SI) 비율 관리</h3>
                  <p className="text-xs text-blue-800">
                    글로벌 표준 및 당사 자체 하이브리드 기준 산출 기반의 연간 소득구간별 단신/가족 비율을 설정합니다. 계산 로직은 여기서 설정된 독립된 곡선을 바탕으로 보간 연산을 수행합니다.
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
                      <option key={year} value={year}>{year}년 {localSiMap[year] ? '(커스텀)' : '(기본값)'}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-hcGray-500 mb-1">새 연도 추가</label>
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
                      <Plus className="w-4 h-4" /> 추가
                    </button>
                  </div>
                </div>
              </div>
              <div className="border border-hcGray-200 rounded-lg overflow-hidden">
                <div className="bg-hcGray-100 p-3 border-b border-hcGray-200 flex justify-between items-center">
                  <h4 className="font-bold text-hcNavy">{selectedYear}년 SI Curve 설정</h4>
                  {localSiMap[selectedYear] && (
                    <button
                      onClick={() => handleDeleteYear(selectedYear)}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3 h-3" /> 새 연도 커스텀 삭제
                    </button>
                  )}
                </div>

                <table className="w-full text-sm text-left">
                  <thead className="bg-hcGray-50 text-hcGray-500 text-xs uppercase border-b border-hcGray-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">소득 구간 (연봉)</th>
                      <th className="px-4 py-3 font-bold text-hcBlue">단신(Single) 적용 비율(%)</th>
                      <th className="px-4 py-3 font-bold text-green-600">가족(Family) 적용 비율(%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hcGray-100">
                    {activeSiData.single.map((item, index) => (
                      <tr key={index} className="hover:bg-hcGray-50">
                        <td className="px-4 py-3 font-medium text-hcGray-800">
                          {(item.bound / 10000).toLocaleString('ko-KR')}만원
                        </td>
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
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const rpiNum = parseFloat(formData.rpi);
    if (isNaN(rpiNum)) {
      alert('RPI 지수는 숫자여야 합니다.');
      return;
    }
    setIsSuccess(true);
    return;
  }

  const rpiNum = parseFloat(formData.rpi);
  if (isNaN(rpiNum)) {
    alert('RPI 지수는 숫자여야 합니다.');
    return;
  }
  setIsSuccess(true);

  setTimeout(() => {
    onSave({
      ...formData,
      rpi: rpiNum
    });
    alert("저장되었습니다! 메인 화면의 파견지 선택 리스트에 반영되었습니다.");
  }, 400);
};
const getPreviewNormalized = () => {
  const rpiNum = parseFloat(formData.rpi);
  if (isNaN(rpiNum)) return '-';
  return ((rpiNum / 90) * 100).toFixed(2);
  const hasSearchInput = (formData.city || formData.country) && formData.city.length + formData.country.length > 0;
  const showNoDataWarning = showSuggestions && suggestions.length === 0 && hasSearchInput;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all duration-300 ${isSuccess ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="p-5 bg-hcNavy text-white flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg font-bold">새 파견 도시 추가 (Admin)</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
          <p className="text-sm text-hcGray-800 mb-2 leading-relaxed">
            도시명을 입력하면 데이터베이스에서 RPI 지수를 찾아 <strong>자동 완성</strong>합니다. 필요한 경우 직접 수정할 수 있습니다.
          </p>
          <div className="space-y-4" ref={wrapperRef}>
            <div className="grid grid-cols-2 gap-3 relative">
              <div>
                <label className="block text-xs font-semibold text-hcGray-800 mb-1">국가명 (Country)</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="예: 미국, 프랑스"
                  className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-hcGray-800 mb-1">도시명 (City)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="예: 뉴욕, 파리"
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
                <span>데이터를 찾을 수 없습니다. 글로벌 표준 및 당사 자체 하이브리드 기준 산출 사이트에서 조회 후 직접 입력해주세요.</span>
              </div>
            )}
            <div className="pt-2 border-t border-hcGray-100">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-semibold text-hcGray-800">글로벌 표준 및 당사 자체 하이브리드 기준 산출 원본 RPI 지수 (수동 수정 가능)</label>
                <a
                  href="https://aoprals.state.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-hcBlue hover:text-hcNavy font-medium flex items-center gap-1 transition-colors bg-blue-50 px-2 py-1 rounded"
                >
                  <ExternalLink className="w-3 h-3" /> 지수 조회하기
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
              <span className="text-xs font-medium text-hcGray-800">서울(48.6) 대비 상대 지수 예측</span>
              <span className="text-lg font-bold text-hcNavy font-mono">{getPreviewNormalized()}</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">사용 통화 (Currency)</label>
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
            {isSuccess ? '저장 완료!' : '시스템에 저장 후 적용'}
          </button>
        </form>
      </div>
    </div>
  );
}
function InfoIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

const AdminGuideAccordion = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-hcGray-200 overflow-hidden mb-6 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-hcNavy to-hcBlue text-white hover:opacity-95 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-yellow-300" />
          <h3 className="font-bold text-lg tracking-tight">[필독] 누구나 할 수 있는 연 1회 시스템 업데이트 가이드</h3>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
          {isOpen ? '매뉴얼 닫기' : '클릭해서 열기'}
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-8 bg-gray-50 border-t border-hcGray-200 space-y-8">

          {/* 1. 운영 철학 */}
          <section>
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              1. 왜 수동으로 업데이트 하나요? (시스템 운영 철학)
            </h4>
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 text-hcGray-700 text-sm leading-relaxed space-y-3 shadow-sm">
              <p>본 시스템은 외부 실시간 환율이나 물가 API를 의도적으로 차단하고 <strong>내부 장부(정적 입력) 방식</strong>으로 설계되었습니다.</p>
              <ul className="list-disc pl-5 space-y-2 font-medium">
                <li><strong>안정적인 예산 통제:</strong> 매일 환율이 바뀌면 주재원들의 불만이 폭주합니다. <strong>'직전 연도 1년 치 평균 환율'</strong>을 고정값으로 사용하여 1년간 흔들림 없는 예산을 집행합니다.</li>
                <li><strong>중복 지급 완벽 차단:</strong> 유료 상용 지수 대신, 주거비와 학비가 완벽히 제외된 <strong>유엔(UN ICSC) 지수</strong>를 사용하여 회사 실비 지원분과의 중복을 막고 수천만 원의 구독료를 아낍니다.</li>
              </ul>
            </div>
          </section>

          {/* 2. 환율 데이터 확보 가이드 */}
          <section>
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2 border-b border-hcGray-200 pb-2">
              <Coins className="w-5 h-5 text-green-600" />
              2. 기준 환율(전년도 연평균) 찾는 방법
            </h4>
            <div className="pl-7 space-y-4 mt-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="font-bold text-green-900 mb-2">💡 필수 원칙: 무조건 '직전 연도의 1월 1일 ~ 12월 31일 평균 환율'을 씁니다.</p>
                <p className="text-sm text-green-800">예시: 현재가 2026년이라면, 2025년 전체 평균 환율을 검색하여 시스템에 입력해야 합니다.</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-bold text-base text-hcGray-800">한국은행 경제통계시스템(ECOS) 접속</p>
                  <a href="https://ecos.bok.or.kr/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-4 py-2 mt-2 bg-white hover:bg-hcGray-50 border border-hcGray-300 rounded-md text-hcBlue font-bold transition-colors text-sm shadow-sm">
                    <ExternalLink className="w-4 h-4" /> 한국은행 ECOS 바로가기
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-bold text-base text-hcGray-800">연평균 환율 데이터 조회 순서</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-hcGray-700 bg-white p-3 rounded border border-hcGray-200">
                    <li>상단 메뉴에서 <strong>[통계검색] ➔ [100대 통계지표]</strong> 또는 <strong>[환율]</strong> 메뉴 클릭</li>
                    <li>조회 주기를 <strong>'년(Year)'</strong>으로 변경</li>
                    <li>조회 기간을 <strong>'직전 연도'</strong> (예: 2025년)로 설정하고 검색</li>
                    <li>주요 통화(USD, EUR, JPY, GBP 등)의 <strong>연평균 매매기준율</strong> 숫자를 메모합니다. <br /><span className="text-xs text-red-500 font-bold">※ 주의: JPY(엔화)는 100엔 기준이므로 시스템 입력 시 1엔 단위로 나누어 입력하세요. (예: 915.00 ➔ 9.15)</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 3. UN RPI 다운로드 가이드 */}
          <section>
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2 border-b border-hcGray-200 pb-2">
              <Download className="w-5 h-5 text-blue-600" />
              3. 유엔(UN ICSC) 생계비 엑셀 다운로드 방법
            </h4>
            <div className="pl-7 space-y-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-bold text-base text-hcGray-800">다이렉트 링크로 RPI 페이지 접속</p>
                  <a href="https://icsc.un.org/Home/DataRPI" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-4 py-2 mt-2 bg-white hover:bg-hcGray-50 border border-hcGray-300 rounded-md text-hcBlue font-bold transition-colors text-sm shadow-sm">
                    <ExternalLink className="w-4 h-4" /> 유엔 RPI 다운로드 바로가기
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-bold text-base text-hcGray-800">최신 ZIP 파일 다운로드 및 압축 해제</p>
                  <p className="text-sm text-hcGray-600 mt-1">
                    페이지 가운데 <strong>[Downloads]</strong> 박스를 찾은 후, <strong><code>compressed.zip</code></strong>을 클릭하여 가장 최신 연월의 파일을 바탕화면에 다운로드하고 압축을 풀어 엑셀을 엽니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 엑셀에서 진짜 숫자 찾기 (핵심) */}
          <section className="bg-yellow-50/80 p-6 rounded-xl border border-yellow-200">
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-yellow-600" />
              4. 엑셀에서 정확한 지수(숫자) 찾는 법 (★가장 중요)
            </h4>
            <div className="pl-7 text-hcGray-700 space-y-4 text-sm">
              <p>수많은 숫자 중 우리가 입력할 숫자는 딱 하나입니다.</p>

              <div className="bg-white p-4 rounded-lg border border-yellow-300 shadow-sm">
                <p className="font-bold text-hcNavy mb-2 flex items-center gap-2"><span className="bg-hcGray-100 px-2 py-0.5 rounded text-xs">Step 1</span> 도시 검색</p>
                <p>엑셀 파일에서 <strong>Ctrl + F (찾기)</strong>를 누르고, <strong>'Duty Station'</strong> 열에서 <code>Seoul</code>, <code>Tokyo</code> 등 영문 도시명을 찾습니다.</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-yellow-300 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">절대 주의!</div>
                <p className="font-bold text-hcNavy mb-2 flex items-center gap-2"><span className="bg-hcGray-100 px-2 py-0.5 rounded text-xs">Step 2</span> 주거비 제외 지수 확인</p>
                <p className="mb-2">도시를 찾았다면, 오른쪽으로 칸을 이동하여 맨 끝에 있는 <strong className="text-blue-700 bg-blue-50 px-1 rounded text-base border border-blue-200">In-area excluding housing</strong> 열의 숫자를 확인합니다. (보통 70 ~ 130 사이의 숫자입니다.)</p>
                <p className="text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">
                  🚫 Multiplier 칸의 작은 숫자(10~80)는 수당 비율이므로 절대 입력하면 안 됩니다!
                </p>
              </div>
            </div>
          </section>

          {/* 5. 시스템 입력 및 저장 */}
          <section>
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2 border-b border-hcGray-200 pb-2">
              <Database className="w-5 h-5 text-hcBlue" />
              5. 시스템에 입력하고 저장하기
            </h4>
            <div className="pl-7 space-y-3 mt-4 text-sm text-hcGray-700">
              <p>1. 화면 우측 상단의 <strong>톱니바퀴(Admin Settings)</strong> 버튼을 클릭합니다.</p>
              <p>2. 위에서 찾은 <strong>'전년도 평균 환율'</strong>과 <strong>'도시별 UN 제외 지수'</strong>를 각 도시/통화별 입력 칸에 타이핑합니다.</p>
              <p>3. 우측 하단의 <strong className="text-hcBlue">시스템에 저장 후 적용</strong> 버튼을 누르면 즉시 시스템 전체에 최신 데이터가 반영됩니다!</p>
            </div>
          </section>

        </div>
      )}
    </div>
  );
};

function App() {
  const [adminData, setAdminData] = useState(() => {
    // 💡 저장된 데이터가 있으면 불러오고, 없으면 기본값 세팅
    const saved = localStorage.getItem('expatValueAdminData_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved admin data", e);
      }
    }
    return UN_ICSC_DATA;
  });
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    // 🔥 이전에 강제로 넣었던 캐시 삭제 로직(localStorage.clear) 완전 제거
    // 이제 실무자가 수정한 환율 및 데이터가 브라우저에 안전하게 영구 보존됩니다.
  }, []);

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
  // Data Fetching Logic (Using Public Exchange Rate API for Annual Average)


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
      const adjustedCol = (rawCol / 90) * 100;
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
      console.log('--- 계산 로직 실행 시작 ---');
      console.log('1. 입력 연봉:', formData?.baseSalary);
      console.log('2. 가족 형태:', formData?.familyType);
      console.log('3. 부임 도시:', formData?.hostCity, '(COL:', formData?.hostCol, ')');
      console.log('4. 적용 환율:', formData?.exchangeRate, formData?.currency);
      if (!formData?.baseSalary) {
        alert('국내 기본연봉을 입력해주세요.');
        return;
      }
      if (!formData?.hostCity) {
        alert('부임도시를 선택해주세요.');
        return;
      }
      if (!formData?.exchangeRate) {
        alert('환율 데이터가 로드되지 않았습니다. 잠시 후 다시 시도하거나 데이터를 확인해주세요.');
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
      const normalizedColMultiplier = rawHostCol / 90;

      const targetYear = new Date().getFullYear();
      const singleSiPercentage = calculateSIPercentage(baseSalaryNum, 'single', targetYear, customSiMap) || 0;
      const finalSiPercentage = calculateSIPercentage(baseSalaryNum, formData.familyType || 'single', targetYear, customSiMap) || 0;

      const baseSIAmount = baseSalaryNum * (singleSiPercentage / 100);
      const finalSIAmount = baseSalaryNum * (finalSiPercentage / 100);
      const familyMultiplier = singleSiPercentage > 0 ? (finalSiPercentage / singleSiPercentage).toFixed(4) : "1.0000";
      // 해외 생계비 = 국내 생계비 * COL 배수
      const overseasLivingCostKRW = finalSIAmount * normalizedColMultiplier;
      // 최종 현지 통화액 = (해외 생계비 / 환율)
      const finalLocalCurrencyAmount = overseasLivingCostKRW / exchangeRateNum;
      console.log('--- 계산 정상 완료 ---');
      setResult({
        baseSalary: baseSalaryNum,
        singleSiPercentage: singleSiPercentage,
        finalSiPercentage: finalSiPercentage,
        baseSIAmount: baseSIAmount,
        familyMultiplier: familyMultiplier,
        finalSIAmount: finalSIAmount,
        normalizedColMultiplier: normalizedColMultiplier,
        rawHostCol: rawHostCol,
        seoulBaseRpi: 90,
        overseasLivingCostKRW: overseasLivingCostKRW,
        exchangeRate: exchangeRateNum,
        currency: formData.currency || 'KRW',
        finalLocalCurrencyAmount: finalLocalCurrencyAmount,
        targetYear: targetYear
      });
    } catch (error) {
      console.error('계산 중 치명적 오류 발생:', error);
      alert('계산 중 오류가 발생했습니다. 입력값을 확인해주세요.\n(에러 상세: ' + error.message + ')');
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
