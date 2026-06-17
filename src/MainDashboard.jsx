import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

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
    single: [{ bound: 64224400, pct: 40.26 }, { bound: 71578800, pct: 38.81 }, { bound: 82379400, pct: 37.09 }, { bound: 90396200, pct: 36.08 }, { bound: 93666000, pct: 35.67 }, { bound: 118408100, pct: 33.49 }, { bound: 122579100, pct: 32.92 }],
    family: [{ bound: 64224400, pct: 49.19 }, { bound: 71578800, pct: 46.83 }, { bound: 82379400, pct: 44.47 }, { bound: 90396200, pct: 42.87 }, { bound: 93666000, pct: 42.20 }, { bound: 118408100, pct: 38.88 }, { bound: 122579100, pct: 38.18 }]
  }
};

const UN_ICSC_DATA = {
  colData: { lastUpdated: "2026-05-01", version: "2026 May (UN ICSC RPI)", modifier: "시스템 초기화", indices: { "뉴욕": 100, "서울": 90, "도쿄": 81, "로스앤젤레스": 95.0, "샌프란시스코": 98.5, "프랑크푸르트": 88.0, "런던": 94.5, "하노이": 45.0, "싱가포르": 105.5, "리야드": 85.0 } },
  exchangeData: { meta: { source: "한국은행 경제통계시스템", targetYear: 2025 }, rates: { "USD": 1385.5, "GBP": 1720, "JPY": 950.79, "EUR": 1480, "VND": 0.055, "SGD": 1025, "SAR": 369.5, "KRW": 1 } },
  cityCurrency: { "뉴욕": "USD", "서울": "KRW", "도쿄": "JPY", "로스앤젤레스": "USD", "샌프란시스코": "USD", "프랑크푸르트": "EUR", "런던": "GBP", "하노이": "VND", "싱가포르": "SGD", "리야드": "SAR" }
};

const STANDARD_SI_CURVE = [
  { bound: 50000000, pct: 45.0 }, { bound: 60000000, pct: 42.5 }, { bound: 70000000, pct: 40.0 }, { bound: 80000000, pct: 37.5 }, { bound: 90000000, pct: 35.0 }, { bound: 100000000, pct: 32.5 },
  { bound: 110000000, pct: 30.0 }, { bound: 120000000, pct: 27.5 }, { bound: 130000000, pct: 25.0 }, { bound: 140000000, pct: 22.5 }, { bound: 150000000, pct: 20.0 }
];

const EXTENDED_RPI_DB = [
  { country: '미국', city: '뉴욕', rpi: 110.5, currency: 'USD' }, { country: '미국', city: '로스앤젤레스', rpi: 105.0, currency: 'USD' }, { country: '미국', city: '샌프란시스코', rpi: 108.2, currency: 'USD' },
  { country: '독일', city: '프랑크푸르트', rpi: 105.0, currency: 'EUR' }, { country: '일본', city: '도쿄', rpi: 82.61, currency: 'JPY' }, { country: '영국', city: '런던', rpi: 110.5, currency: 'GBP' },
  { country: '베트남', city: '하노이', rpi: 40.5, currency: 'VND' }, { country: '싱가포르', city: '싱가포르', rpi: 120.0, currency: 'SGD' }, { country: '사우디아라비아', city: '리야드', rpi: 90.0, currency: 'SAR' }
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
  let lowerPct, upperPct, lowerBound, upperBound;
  for (let i = 0; i < curve.length - 1; i++) {
    if (baseSalary >= curve[i].bound && baseSalary < curve[i + 1].bound) {
      lowerBound = curve[i].bound; upperBound = curve[i + 1].bound;
      lowerPct = curve[i].pct; upperPct = curve[i + 1].pct; break;
    }
  }
  const ratio = (baseSalary - lowerBound) / (upperBound - lowerBound);
  return lowerPct - (ratio * (lowerPct - upperPct));
}

function formatCurrency(val, currency) {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', { style: 'currency', currency: currency || 'KRW', maximumFractionDigits: currency === 'KRW' ? 0 : 2 }).format(val);
}

function formatNumber(val) {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(val);
}

function Sidebar({ formData, onChange, onSalaryChange, onCalculate, onReset, onOpenAdmin, isDataLoading, customCities }) {
  const presets = { '미국': ['뉴욕', '로스앤젤레스', '샌프란시스코'], '독일': ['프랑크푸르트'], '일본': ['도쿄'], '영국': ['런던'], '베트남': ['하노이'], '싱가포르': ['싱가포르'], '사우디아라비아': ['리야드'] };
  const displayGroups = { ...presets };
  if (customCities && customCities.length > 0) {
    customCities.forEach(c => {
      if (!displayGroups[c.country]) displayGroups[c.country] = [];
      if (!displayGroups[c.country].includes(c.city)) displayGroups[c.country].push(c.city);
    });
  }

  return (
    <div className="h-full bg-white flex flex-col border-r border-hcGray-100 relative">
      {isDataLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-hcGray-200 border-t-hcBlue rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-bold text-hcNavy">최신 정보를 계산 중입니다...</p>
        </div>
      )}
      <div className="p-6 bg-hcNavy text-white flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2"><Calculator className="w-6 h-6 text-blue-300" /><h1 className="text-2xl font-bold tracking-tight">ExpatValue AI</h1></div>
          <p className="text-sm text-blue-200/80">주재원 해외 생계비 산정 시스템</p>
        </div>
        <button onClick={onOpenAdmin} className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white" title="Admin Settings"><Settings className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2"><MapPin className="w-4 h-4" /> 파견국 및 부임국</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">Home (파견국)</label>
              <select name="homeCity" value={formData?.homeCity || ''} onChange={onChange} className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"><option value="서울">서울</option></select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">Host (부임도시)</label>
              <select name="hostCity" value={formData?.hostCity || ''} onChange={onChange} className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue">
                <option value="">선택하세요</option>
                {Object.entries(displayGroups).map(([country, cities]) => (
                  <optgroup key={`host-group-${country}`} label={country}>
                    {Array.from(new Set(cities)).map(city => <option key={`host-${city}`} value={city}>{city}</option>)}
                  </optgroup>
                ))}
                <optgroup label="---------"><option value="__CUSTOM__" className="text-hcBlue font-bold">+ 리스트에 없는 도시 직접 입력</option></optgroup>
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2"><Coins className="w-4 h-4" /> 국내 기본연봉 (KRW)</h3>
          <div className="relative">
            <input type="text" name="baseSalary" value={formData?.baseSalary || ''} onChange={onSalaryChange} placeholder="0" className="w-full p-3 pr-10 bg-white border border-hcGray-200 rounded-md text-right font-bold text-lg focus:outline-none focus:ring-2 focus:ring-hcBlue shadow-inner" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-hcGray-800 font-medium">원</span>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2"><Users className="w-4 h-4" /> 부임 가족 형태</h3>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer text-sm font-medium ${formData?.familyType === 'single' ? 'bg-hcNavy text-white border-hcNavy' : 'bg-white text-hcGray-800 border-hcGray-200 hover:bg-hcGray-50'}`}>
              <input type="radio" name="familyType" value="single" checked={formData?.familyType === 'single'} onChange={onChange} className="hidden" /> 단신 부임
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer text-sm font-medium ${formData?.familyType === 'family' ? 'bg-hcNavy text-white border-hcNavy' : 'bg-white text-hcGray-800 border-hcGray-200 hover:bg-hcGray-50'}`}>
              <input type="radio" name="familyType" value="family" checked={formData?.familyType === 'family'} onChange={onChange} className="hidden" /> 가족 동반
            </label>
          </div>
        </div>
        <div className="space-y-4 opacity-70">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2"><Globe className="w-4 h-4" /> 자동 로드 지수 및 환율 (읽기전용)</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><label className="w-24 text-xs font-semibold text-hcGray-800">Home Index</label><input type="text" readOnly value={formData?.homeCol || ''} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" /></div>
            <div className="flex items-center gap-3"><label className="w-24 text-xs font-semibold text-hcGray-800">Host Index</label><input type="text" readOnly value={formData?.hostCol || ''} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" /></div>
            <div className="flex items-center gap-3"><label className="w-24 text-xs font-semibold text-hcGray-800">연평균 환율</label><input type="text" readOnly value={formData?.exchangeRate || (formData?.hostCity ? '데이터 준비 중' : '')} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" /></div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white border-t border-hcGray-100 flex gap-3">
        <button onClick={onReset} disabled={isDataLoading} className="flex-1 py-3 bg-white border border-hcGray-200 text-hcGray-800 rounded-md font-bold text-sm hover:bg-hcGray-50 transition-colors disabled:opacity-50">초기화</button>
        <button onClick={onCalculate} disabled={isDataLoading} className="flex-[2] py-3 bg-hcBlue text-white rounded-md font-bold text-sm hover:bg-hcNavy transition-colors shadow-sm disabled:opacity-50">생계비 산정 실행</button>
      </div>
    </div>
  );
}

function Dashboard({ formData, result, adminData, isDataLoading, customSiMap }) {
  const [isJustificationOpen, setIsJustificationOpen] = useState(false);
  const isReady = result !== null;
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const interpolationText = '입력하신 연봉은 당사 보상 원칙에 따른 구간별 보간 연산을 통해 한계체감 가중치가 반영되었습니다.';

  if (isDataLoading || !adminData) {
    return (
      <div className="p-8 h-full bg-hcGray-50 flex flex-col">
        <div className="h-10 bg-hcGray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-4 bg-hcGray-200 rounded w-2/3 mb-12 animate-pulse"></div>
        <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 p-8 mb-8 animate-pulse flex flex-col items-center justify-center min-h-[150px]"><div className="w-8 h-8 border-4 border-hcGray-200 border-t-hcBlue rounded-full animate-spin mb-3"></div><p className="text-sm font-bold text-hcNavy">최신 환율 정보를 계산 중입니다...</p></div>
      </div>
    );
  }

  const handleExportExcel = () => {
    if (!isReady) return;
    const wsData = [];
    wsData.push(['[기본 입력 정보]']);
    wsData.push(["국내 기본연봉", formatCurrency(result.baseSalary, "KRW")]);
    wsData.push(["동반 가족 수", formData.familyType === "family" ? "가족 동반" : "단신"]);
    wsData.push(["파견 국가/도시", `${formData.homeCountry || "대한민국"} / ${formData.hostCity}`]);
    wsData.push([]);
    wsData.push(["[최종 산출 결과 요약]"]);
    wsData.push(["산출 기준 원화 생계비", formatCurrency(result.overseasLivingCostKRW, "KRW")]);
    wsData.push(["최종 해외 생계비(현지통화)", `${formatCurrency(result.finalLocalCurrencyAmount, result.currency)} ${result.currency}`]);

    if (isAccordionOpen) {
      wsData.push([]);
      wsData.push(['[상세 산출 과정 (Step-by-Step)]']);
      wsData.push(['Step 1. 국내 생계비(SI) 산출', `입력 연봉 ${formatNumber(result?.baseSalary)}원 기준, 소득 구간별 기본(단신) SI 비중 ${result?.singleSiPercentage?.toFixed(2)}%를 적용하여 ${formatNumber(result?.baseSIAmount)}원이 산출되었습니다.`]);
      const familyText = formData?.familyType === 'family' ? `가족 동반에 따른 가산율 적용 (현재 적용된 독립 비율 ${result.finalSiPercentage.toFixed(2)}%, 단신 대비 ${result.familyMultiplier}배)에 따라 최종 국내 기준액은 ${formatNumber(result.finalSIAmount)}원입니다.` : `단신 부임으로 별도의 가산율 적용 없이 최종 국내 기준액은 ${formatNumber(result.finalSIAmount)}원입니다.`;
      wsData.push(['Step 2. 가족 가산 적용', familyText]);
      wsData.push(['Step 3. 도시별 물가 보전(COL)', `서울(100) 대비 파견지 상대 지수 ${(result.normalizedColMultiplier * 100).toFixed(1)}를 곱하여 보전 될 금액은 ${formatNumber(result.overseasLivingCostKRW)}원입니다.`]);
      wsData.push(['Step 4. 통화 환산', `${adminData?.exchangeData?.meta?.targetYear || ''}년 연평균 환율 ${new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result?.exchangeRate)}을 적용하여 최종 현지 통화 ${formatNumber(result?.finalLocalCurrencyAmount)} ${result?.currency}가 산출되었습니다.`]);
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "생계비산출 내역");
    XLSX.writeFile(wb, `ExpatValue_산출내역_${formData.hostCity}.xlsx`);
  };

  const currentCurve = getActiveCurve(formData?.familyType || 'single', result?.targetYear || new Date().getFullYear(), customSiMap);
  
  return (
    <div className="p-8 min-h-full bg-hcGray-50 flex flex-col flex-1 pb-24">
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-hcNavy tracking-tight">해외 생계비 산정 결과</h2>
          <p className="text-hcGray-800 mt-2 text-sm">글로벌 표준으로 사용되는 UN 물가지수를 활용한 해외 생계비 산정 결과</p>
        </div>
        {isReady && <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-colors"><Download className="w-4 h-4" /> 엑셀로 저장 (Download)</button>}
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 overflow-hidden mb-8 transition-all duration-300">
        <div className="bg-gradient-to-r from-hcNavy to-hcBlue p-6 flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-medium opacity-90">최종 산출 해외 생계비 (현지통화)</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-5xl font-bold tracking-tight">{isReady ? formatCurrency(result.finalLocalCurrencyAmount, result.currency) : '-'}</span>
              {isReady && result.currency !== 'KRW' && <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mt-2">{result.currency}</span>}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center"><div className="text-xs opacity-80 mb-1">{formData.homeCity || 'Home'} (기준)</div><div className="font-semibold text-lg text-green-300">100.00</div></div>
            <ArrowRight className="w-5 h-5 opacity-50" />
            <div className="text-center"><div className="text-xs opacity-80 mb-1">{formData.hostCity || 'Host'} (정규화 COL)</div><div className="font-semibold text-2xl text-yellow-300">{isReady ? (result.normalizedColMultiplier * 100).toFixed(2) : formData.hostCol || '-'}</div></div>
          </div>
        </div>
        <div className="p-6 bg-white flex items-center justify-between border-b border-hcGray-100">
          <div className="flex items-center gap-2 text-hcGray-800">
            <Info className="w-4 h-4 text-hcBlue" />
            <span className="text-sm font-medium">환산 전 원화 생계비(가족 COL 반영): </span>
            <span className="text-lg font-bold text-hcNavy">{isReady ? formatCurrency(result.overseasLivingCostKRW, 'KRW') : '-'}</span>
          </div>
          {isReady && adminData && <div className="text-xs font-medium text-hcGray-800 px-3 py-1 bg-hcGray-50 rounded-md border border-hcGray-200">1 {result?.currency} = {formatNumber(result?.exchangeRate)} KRW ({adminData?.exchangeData?.meta?.targetYear || ''}년 기준)</div>}
        </div>
      </div>

      {isReady && <button onClick={() => setIsAccordionOpen(!isAccordionOpen)} className="w-full flex items-center justify-center gap-2 bg-white border border-hcGray-200 text-hcNavy font-bold py-3 rounded-xl shadow-sm hover:bg-hcGray-50 transition-colors mb-4"><FileText className="w-5 h-5" /> 상세 산출 근거 확인하기 {isAccordionOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</button>}

      <div className={`transition-all duration-500 overflow-hidden shrink-0 ${isAccordionOpen && isReady ? 'max-h-[1500px] mb-12 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
        <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 flex-1 flex flex-col">
          <div className="p-6 space-y-4 relative">
            <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-hcGray-100 z-0"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-hcBlue text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">1</div>
              <div className="bg-hcGray-50/50 p-4 rounded-lg border border-hcGray-100 flex-1">
                <h4 className="font-bold text-hcNavy mb-1">국내 생계비(SI) 산출</h4>
                <p className="text-sm text-hcGray-800">입력 연봉 <strong>{formatCurrency(result?.baseSalary, 'KRW')}</strong> 기준, 소득 구간별 기본(단신) SI 비중 <strong>{result?.singleSiPercentage?.toFixed(2)}%</strong>를 적용하여 <strong>{formatCurrency(result?.baseSIAmount, 'KRW')}</strong>이 산출되었습니다.</p>
                <div className="mt-3 text-[11px] text-hcGray-600 bg-white p-3 rounded-md border border-hcGray-200 shadow-sm">
                  <h5 className="font-bold text-hcNavy mb-2 flex items-center gap-1.5 border-b border-hcGray-100 pb-1.5"><Info className="w-3.5 h-3.5 text-hcBlue" /> SI 산출 방법론 (Methodology Insight)</h5>
                  <p className="mb-3 leading-relaxed"><strong className="text-hcGray-800">글로벌 표준 생계비 비율 적용 원리:</strong> 소득이 높아질수록 가처분 소득 중 필수 생계비(Spendable Income)가 차지하는 비중은 점진적으로 감소한다는 한계 체감 모델에 따랐습니다.</p>
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-hcGray-500 mb-1">({result?.targetYear || new Date().getFullYear()}년도 시스템 표준 보간 기준)</div>
                    <div className="overflow-x-auto border border-hcGray-200 rounded">
                      <table className="w-full text-center">
                        <thead className="bg-hcGray-50">
                         <tr>{currentCurve.map((c, i) => (<th key={i} className="py-1.5 px-2 border-r last:border-0 border-hcGray-200 font-semibold text-xs">{Math.round(c.bound / 10000).toLocaleString('ko-KR')}만</th>))}</tr>
                        </thead>
                        <tbody>
                          <tr>{currentCurve.map((c, i) => (<td key={i} className="py-1.5 px-2 border-r last:border-0 font-mono text-hcBlue font-medium text-xs">{c.pct}%</td>))}</tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 p-2 rounded text-blue-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: interpolationText }}></div>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">2</div>
              <div className="bg-hcGray-50/50 p-4 rounded-lg border border-hcGray-100 flex-1">
                <h4 className="font-bold text-hcNavy mb-1">가족 가산 적용</h4>
                <p className="text-sm text-hcGray-800">{formData?.familyType === 'family' ? <>가족 동반에 따른 가산율 적용(독립 비율 <strong>{result?.finalSiPercentage?.toFixed(2)}%</strong>, 단신 대비 <strong>{result?.familyMultiplier}배</strong>)에 따라 최종 국내 기준액은 <strong>{formatCurrency(result?.finalSIAmount, 'KRW')}</strong>입니다.</> : <>단신 부임으로 별도의 가산율 적용 없이 최종 국내 기준액은 <strong>{formatCurrency(result?.finalSIAmount, 'KRW')}</strong>입니다.</>}</p>
              </div>
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">3</div>
              <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100 flex-1">
                <h4 className="font-bold text-purple-900 mb-1">도시별 물가 보전(COL)</h4>
                <p className="text-sm text-purple-800">서울(100) 대비 파견지 상대 지수 <strong>{(result?.normalizedColMultiplier * 100)?.toFixed(1)}</strong>를 곱하여 보전 될 금액은 <strong>{formatCurrency(result?.overseasLivingCostKRW, 'KRW')}</strong>입니다.</p>
              </div>
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">4</div>
              <div className="bg-green-50/50 p-4 rounded-lg border border-green-100 flex-1">
                <h4 className="font-bold text-green-900 mb-2">통화 환산</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p><span className="inline-block w-16 opacity-80">조회일:</span><strong>{new Date().toISOString().split('T')[0]}</strong></p>
                  <p><span className="inline-block w-16 opacity-80">적용 환율:</span><strong>{adminData?.exchangeData?.meta?.targetYear}년 연평균(1/1~12/31)</strong></p>
                  <p className="pt-2 border-t border-green-200 mt-2">해당 연평균 환율 <strong>{new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result?.exchangeRate)}</strong>을 적용하여 최종 현지 통화 <strong>{formatCurrency(result?.finalLocalCurrencyAmount, result?.currency)} {result?.currency}</strong>가 산출되었습니다.</p>
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
            <p className="text-sm mt-1 text-hcGray-800 bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200 mt-4 text-center">본 지수는 글로벌 표준 데이터를 바탕으로 <strong>서울(100) 대비 상대 물가를 산출한 정규화 지수</strong>를 기준으로 산출합니다.</p>
          </div>
        </div>
      )}

      {isReady && adminData && (
        <div className="mt-8 bg-hcGray-100/50 rounded-xl shadow-inner border border-hcGray-200 p-6 mb-8 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-hcBlue"></div>
          <div className="flex items-center gap-2 mb-5"><CheckCircle className="w-6 h-6 text-green-600" /><h3 className="text-xl font-bold text-hcNavy tracking-tight">데이터 검증 및 원천 정보 (Data Fact-Check)</h3></div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-sm text-hcGray-800 mb-3 border-b border-hcGray-100 pb-2 flex justify-between items-center"><span>1. 글로벌 표준 물가 지수 신뢰도</span><span className="text-[10px] bg-hcGray-100 text-hcGray-500 px-2 py-0.5 rounded">RPI</span></h4>
              <p className="text-xs text-hcGray-600 leading-relaxed mb-3"><span className="font-semibold text-hcGray-800">출처:</span> 글로벌 표준 Retail Price Index (New York = 100)</p>
              <div className="text-sm text-hcGray-800 leading-relaxed bg-blue-50/50 p-3 rounded-md border border-blue-100/50">
                <span className="font-semibold text-blue-900 block mb-1">현재 수치 산출 근거:</span>
                뉴욕(100) 기준, 서울은 <strong>[{result.seoulBaseRpi}]</strong>, {formData.hostCity}은(는) <strong>[{result.rawHostCol}]</strong>이므로, 최종 COL 지수는 <strong className="text-blue-700 bg-white px-1 py-0.5 rounded shadow-sm border border-blue-100">[{result.rawHostCol} / {result.seoulBaseRpi} = {(result.normalizedColMultiplier * 100).toFixed(1)}]</strong>로 산출되었습니다.
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-hcGray-500 mt-4"><span className="border border-hcGray-200 px-2 py-1 rounded text-hcGray-700 font-medium">[최종 업데이트] {adminData?.colData?.lastUpdated} / 수정자: {adminData?.colData?.modifier || '시스템 초기화'}</span></div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-sm text-hcGray-800 mb-3 border-b border-hcGray-100 pb-2 flex justify-between items-center"><span>2. 환율 데이터 투명성</span><span className="text-[10px] bg-hcGray-100 text-hcGray-500 px-2 py-0.5 rounded">FX Rate</span></h4>
              <p className="text-sm text-hcGray-800 leading-relaxed bg-green-50/50 p-3 rounded-md border border-green-100/50 mb-3"><span className="font-semibold text-green-900 block mb-1">기준:</span>현재 적용 환율은 <strong className="text-green-700">{adminData?.exchangeData?.meta?.targetYear || ''}년(직전년도) 1월 1일부터 12월 31일까지의 연평균 매매기준율</strong>입니다.</p>
              <div className="flex items-center gap-2 text-xs text-hcGray-500 bg-hcGray-50 p-2 rounded border border-hcGray-100"><Info className="w-3.5 h-3.5" /><span>유럽중앙은행(ECB) 기준 직전 연도 일별 데이터 실시간 평균 연산 적용</span></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-hcGray-700 bg-white p-3 rounded-lg border border-hcGray-200 shadow-sm mt-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> 본 데이터는 내부 검증 절차에 따라 최종 수동 입력 및 적용 완료된 기준 수치입니다.
          </div>
        </div>
      )}

      <div className="mt-8">
        <AdminGuideAccordion />
      </div>

      <div className="mt-8 mb-4">
        <h3 className="text-sm font-bold text-hcNavy mb-3 border-b border-hcGray-200 pb-2">산출 근거 및 지수 활용 당위성 (Methodology & Justification)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button onClick={() => setIsJustificationOpen(!isJustificationOpen)} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-hcGray-200 hover:border-hcBlue hover:shadow-md transition-all group text-left">
            <div className="w-10 h-10 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors"><ShieldCheck className="w-5 h-5" /></div>
            <div><h4 className="text-sm font-bold text-hcGray-800 group-hover:text-hcBlue">유료 상용 지수 (머서, ECA 등)의 한계</h4><p className="text-xs text-hcGray-500 mt-1">왜 우리는 머서 지수를 배제하는가? (클릭하여 당위성 확인)</p></div>
          </button>
          <a href="https://icsc.un.org/Home/DataRPI" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-4 bg-white rounded-lg border border-hcGray-200 hover:border-green-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors"><Download className="w-5 h-5" /></div>
            <div><h4 className="text-sm font-bold text-hcGray-800 group-hover:text-green-600">유엔 지수 (UN ICSC RPI) 원천 데이터</h4><p className="text-xs text-hcGray-500 mt-1">국제기구 표준 주거비 제외 생계비 지수 다운로드 (바로가기)</p></div>
          </a>
        </div>
        {isJustificationOpen && (
          <div className="mt-4 bg-hcNavy rounded-xl border border-blue-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-6">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-yellow-400" />당사의 UN ICSC 적용 당위성 (Cost Control)</h4>
              <p className="text-sm text-blue-100 mb-6 border-b border-blue-800/50 pb-4">당사의 예산 효율화 및 완벽한 비용 통제를 위한 핵심 운영 방침입니다.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 p-5 rounded-lg border border-white/5">
                  <h5 className="font-bold text-red-300 mb-3 flex items-center gap-2"><X className="w-4 h-4" /> 유료 상용 지수 (머서 등)</h5>
                  <p className="text-sm text-blue-50 leading-relaxed">주재원 프리미엄 위주로 구글 등 빅테크가 주로 활용합니다. 그러나 장바구니 물가에 <strong>'주거비 거품'</strong>이 심하게 포함되어 있어 예산 누수 발생 위험이 매우 큽니다.</p>
                </div>
                <div className="bg-white/10 p-5 rounded-lg border border-white/5">
                  <h5 className="font-bold text-green-400 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> 우리의 해결책 (UN ICSC)</h5>
                  <p className="text-sm text-blue-50 leading-relaxed">당사는 <strong>주거비와 학비를 실비로 이미 따로 지급</strong>하고 있습니다. 주거비가 제대로 분리되지 않는 상용 지수를 쓰면 예산이 이중 지급됩니다. 따라서 <strong>'주거비 제외 지수'</strong>를 제공하는 유엔 데이터를 사용하는 것이 논리적 정답입니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminModal({ adminData, setAdminData, customSiMap = {}, setCustomSiMap, onClose }) {
  const [activeTab, setActiveTab] = useState('sync');
  const [error, setError] = useState('');
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [localExchangeRates, setLocalExchangeRates] = useState(adminData?.exchangeData?.rates || {});
  const [localIndices, setLocalIndices] = useState(adminData?.colData?.indices || {});
  const [localSiMap, setLocalSiMap] = useState({ ...customSiMap });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [newYearInput, setNewYearInput] = useState('');

  const SUPPORTED_API_CURRENCIES = ['USD', 'JPY', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 'SEK', 'SGD', 'INR', 'BRL'];

  const fetchFrankfurterRates = async () => {
    setIsFetchingRates(true);
    try {
      const prevYear = new Date().getFullYear() - 1;
      const currenciesToFetch = Object.keys(localExchangeRates).filter(c => c !== 'KRW');
      const newRates = { ...localExchangeRates };
      const unsupportedCurrencies = [];

      await Promise.all(currenciesToFetch.map(async (currency) => {
        if (!SUPPORTED_API_CURRENCIES.includes(currency)) {
          unsupportedCurrencies.push(currency);
          return;
        }
        try {
          const response = await fetch(`https://api.frankfurter.dev/v1/${prevYear}-01-01..${prevYear}-12-31?base=${currency}&symbols=KRW`);
          if (!response.ok) {
            if (response.status === 404) unsupportedCurrencies.push(currency);
            return;
          }
          const data = await response.json();
          const vals = Object.values(data.rates).map(x => x.KRW);
          let avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          if (currency === 'JPY') avg = avg * 100;
          newRates[currency] = Math.round(avg * 100) / 100;
        } catch (err) { console.error(`[${currency}] API Error:`, err); }
      }));

      setLocalExchangeRates(newRates);
      if (unsupportedCurrencies.length > 0) alert(`${unsupportedCurrencies.join(', ')} 등 일부 통화는 오픈 API 제공 목록에 없어 기존 데이터가 유지됩니다. 필요 시 수동 입력해 주세요.`);
    } catch (e) {
      alert("환율 데이터를 불러오는 데 실패했습니다. 수동으로 입력해 주세요.");
    } finally {
      setIsFetchingRates(false);
    }
  };

  const handleSaveJson = () => {
    const modifier = window.prompt("책임 소재 파악을 위해 수정자의 성명/사번을 입력하세요. (예: 홍길동/111777)");
    if (!modifier) { alert("저장이 취소되었습니다. (수정자 정보 누락)"); return; }
    try {
      const parsed = JSON.parse(JSON.stringify(adminData));
      if (!parsed.exchangeData) parsed.exchangeData = { rates: {} };
      parsed.exchangeData.rates = localExchangeRates;
      if (!parsed.colData) parsed.colData = { indices: {} };
      parsed.colData.indices = localIndices;
      parsed.colData.modifier = modifier;
      parsed.colData.lastUpdated = new Date().toISOString().split('T')[0];

      setAdminData(parsed);
      localStorage.setItem('expatValueAdminData_v5', JSON.stringify(parsed));
      onClose();
    } catch (e) { setError('데이터 저장 중 오류가 발생했습니다.'); }
  };

  const handleSaveSiMap = () => { setCustomSiMap(localSiMap); onClose(); };

  const handleAddYear = () => {
    if (!newYearInput || isNaN(newYearInput)) return;
    if (!localSiMap[newYearInput]) {
      setLocalSiMap(prev => ({ ...prev, [newYearInput]: JSON.parse(JSON.stringify(ANNUAL_SI_MAP[2026])) }));
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
      if (!newMap[selectedYear]) newMap[selectedYear] = JSON.parse(JSON.stringify(ANNUAL_SI_MAP[2026]));
      newMap[selectedYear][familyType][index].pct = parseFloat(value) || 0;
      return newMap;
    });
  };

  const availableYears = Array.from(new Set([...Object.keys(ANNUAL_SI_MAP), ...Object.keys(localSiMap)])).sort((a, b) => b - a);
  const activeSiData = localSiMap[selectedYear] || ANNUAL_SI_MAP[selectedYear] || ANNUAL_SI_MAP[2026];
  const targetYear = new Date().getFullYear() - 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] max-w-[95%] flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-5 bg-hcNavy text-white flex justify-between items-center">
          <div className="flex items-center gap-2"><Settings className="w-5 h-5" /><h2 className="text-lg font-bold">Admin Settings (관리자 설정)</h2></div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex border-b border-hcGray-200 bg-hcGray-50">
          <button onClick={() => setActiveTab('sync')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'sync' ? 'border-hcBlue text-hcBlue bg-white' : 'border-transparent text-hcGray-500 hover:text-hcGray-800'}`}><Database className="w-4 h-4" /> 공공 데이터 동기화</button>
          <button onClick={() => setActiveTab('si')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'si' ? 'border-hcBlue text-hcBlue bg-white' : 'border-transparent text-hcGray-500 hover:text-hcGray-800'}`}><Settings className="w-4 h-4" /> 연간 SI 비율 설정</button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'sync' && (
            <div className="flex flex-col gap-6 h-full">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-green-900 mb-1 flex items-center gap-2"><Coins className="w-4 h-4" /> {targetYear}년 평균 환율 입력</h3>
                    <p className="text-xs text-green-800">자동 산출 시 지원 불가 통화는 제외됩니다.</p>
                  </div>
                  <button onClick={fetchFrankfurterRates} disabled={isFetchingRates} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded text-xs font-bold transition-colors flex items-center gap-1">
                    {isFetchingRates ? <><RefreshCw className="w-3 h-3 animate-spin" /> 분석 중...</> : <><RefreshCw className="w-3 h-3" /> 자동 산출</>}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(localExchangeRates).map(([currency, rate]) => (
                    <div key={currency} className="flex flex-col bg-white p-2 rounded border border-green-200 shadow-sm">
                      <label className="text-[10px] font-bold text-hcGray-500 mb-1">{currency}</label>
                      <input type="number" className="w-full text-sm font-mono text-hcBlue p-1 focus:outline-none focus:ring-1 focus:ring-hcBlue rounded" value={rate} onChange={(e) => setLocalExchangeRates(prev => ({ ...prev, [currency]: parseFloat(e.target.value) || 0 }))} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Globe className="w-4 h-4" /> 유엔(UN ICSC) 생계비 지수 입력</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(localIndices).map(([city, indexVal]) => (
                    <div key={city} className="flex flex-col bg-white p-2 rounded border border-blue-200 shadow-sm">
                      <label className="text-[10px] font-bold text-hcGray-500 mb-1">{city}</label>
                      <input type="number" step="0.1" className="w-full text-sm font-mono text-hcBlue p-1 focus:outline-none focus:ring-1 focus:ring-hcBlue rounded" value={indexVal} onChange={(e) => setLocalIndices(prev => ({ ...prev, [city]: parseFloat(e.target.value) || 0 }))} />
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
                <div><h3 className="font-bold text-blue-900 mb-1">연도별 생계비(SI) 비율 관리</h3><p className="text-xs text-blue-800">글로벌 표준 기반 연간 소득구간별 단신/가족 비율 설정 (보안상 시스템은 표준화된 1천만 원 단위로만 렌더링합니다.)</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-hcGray-500 mb-1">설정 연도 선택</label>
                  <select className="w-full p-2 border border-hcGray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-hcBlue" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    {availableYears.map(year => <option key={year} value={year}>{year}년 {localSiMap[year] ? '(커스텀)' : '(기본값)'}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-hcGray-500 mb-1">새 연도 추가</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="예: 2027" className="flex-1 p-2 border border-hcGray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-hcBlue" value={newYearInput} onChange={(e) => setNewYearInput(e.target.value)} />
                    <button onClick={handleAddYear} className="px-3 py-2 bg-hcGray-800 text-white rounded-md hover:bg-hcNavy transition-colors flex items-center gap-1 text-sm font-bold"><Plus className="w-4 h-4" /> 추가</button>
                  </div>
                </div>
              </div>
              <div className="border border-hcGray-200 rounded-lg overflow-hidden">
                <div className="bg-hcGray-100 p-3 border-b border-hcGray-200 flex justify-between items-center">
                  <h4 className="font-bold text-hcNavy">{selectedYear}년 SI Curve 설정</h4>
                  {localSiMap[selectedYear] && <button onClick={() => handleDeleteYear(selectedYear)} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-bold"><Trash2 className="w-3 h-3" /> 삭제</button>}
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-hcGray-50 text-hcGray-500 text-xs uppercase border-b border-hcGray-200">
                    <tr><th className="px-4 py-3 font-bold">소득 구간 (표준 연봉)</th><th className="px-4 py-3 font-bold text-hcBlue">단신 적용 비율(%)</th><th className="px-4 py-3 font-bold text-green-600">가족 적용 비율(%)</th></tr>
                  </thead>
                  <tbody className="divide-y divide-hcGray-100">
                    {STANDARD_SI_CURVE.map((item, index) => {
                      const singleVal = activeSiData.single[index] ? activeSiData.single[index].pct : item.pct;
                      const familyVal = activeSiData.family[index] ? activeSiData.family[index].pct : item.pct + 5;
                      return (
                        <tr key={index} className="hover:bg-hcGray-50">
                          <td className="px-4 py-3 font-medium text-hcGray-800">{(item.bound / 10000).toLocaleString('ko-KR')}만원</td>
                          <td className="px-4 py-3"><input type="number" step="0.01" className="w-24 p-1.5 border border-hcGray-200 rounded text-right focus:outline-none focus:border-hcBlue" value={singleVal} onChange={(e) => handleSiChange('single', index, e.target.value)} /> %</td>
                          <td className="px-4 py-3"><input type="number" step="0.01" className="w-24 p-1.5 border border-hcGray-200 rounded text-right focus:outline-none focus:border-green-500" value={familyVal} onChange={(e) => handleSiChange('family', index, e.target.value)} /> %</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-hcGray-50 border-t border-hcGray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-white border border-hcGray-200 text-hcGray-800 rounded-md font-bold hover:bg-hcGray-100 transition-colors">취소</button>
          <button onClick={activeTab === 'sync' ? handleSaveJson : handleSaveSiMap} className="px-5 py-2 bg-hcBlue text-white rounded-md font-bold flex items-center gap-2 hover:bg-hcNavy transition-colors"><Save className="w-4 h-4" /> {activeTab === 'sync' ? '저장 후 적용' : 'SI 설정 저장'}</button>
        </div>
      </div>
    </div>
  );
}

function CustomCityModal({ onClose, onSave, extendedRpiDb = [] }) {
  const [formData, setFormData] = useState({ country: '', city: '', rpi: '', currency: 'USD' });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const wrapperRef = useRef(null);
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'VND', 'SGD', 'SAR', 'KRW', 'CAD', 'AUD', 'AED', 'INR', 'BRL'];

  useEffect(() => {
    function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setShowSuggestions(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const lowerQuery = query.toLowerCase();
    const results = extendedRpiDb.filter(item => item.city.toLowerCase().includes(lowerQuery) || item.country.toLowerCase().includes(lowerQuery));
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (item) => {
    setFormData({ homeCountry: '대한민국', city: item.city, rpi: item.rpi.toString(), currency: item.currency });
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'city' || name === 'country') handleSearch(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.country || !formData.city || !formData.rpi || !formData.currency) { alert('모든 필드를 입력해주세요.'); return; }
    const rpiNum = parseFloat(formData.rpi);
    if (isNaN(rpiNum)) { alert('RPI 지수는 숫자여야 합니다.'); return; }
    setIsSuccess(true);
    setTimeout(() => { onSave({ ...formData, rpi: rpiNum }); alert("저장되었습니다!"); }, 400);
  };

  const getPreviewNormalized = () => {
    const rpiNum = parseFloat(formData.rpi);
    if (isNaN(rpiNum)) return '-';
    return ((rpiNum / 90) * 100).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all duration-300 ${isSuccess ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="p-5 bg-hcNavy text-white flex justify-between items-center relative">
          <div className="flex items-center gap-2"><Plus className="w-5 h-5 text-blue-300" /><h2 className="text-lg font-bold">새 파견 도시 추가 (Admin)</h2></div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-md transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
          <p className="text-sm text-hcGray-800 mb-2 leading-relaxed">도시명을 입력하면 데이터베이스에서 RPI 지수를 찾아 <strong>자동 완성</strong>합니다.</p>
          <div className="space-y-4" ref={wrapperRef}>
            <div className="grid grid-cols-2 gap-3 relative">
              <div>
                <label className="block text-xs font-semibold text-hcGray-800 mb-1">국가명 (Country)</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} autoComplete="off" placeholder="예: 미국, 프랑스" className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-hcGray-800 mb-1">도시명 (City)</label>
                <div className="relative">
                  <input type="text" name="city" value={formData.city} onChange={handleChange} autoComplete="off" placeholder="예: 뉴욕, 파리" className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue" />
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hcGray-400" />
                </div>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hcGray-200 shadow-xl rounded-md z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <div key={idx} onClick={() => handleSelectSuggestion(item)} className="p-3 hover:bg-hcBlue/5 cursor-pointer border-b border-hcGray-50 last:border-0 flex justify-between items-center transition-colors">
                      <div><div className="font-bold text-sm text-hcNavy">{item.city}</div><div className="text-xs text-hcGray-500">{item.country}</div></div>
                      <div className="text-right"><div className="font-mono text-sm font-semibold text-hcBlue">{item.rpi}</div><div className="text-[10px] text-hcGray-400">{item.currency}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-hcGray-100">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-semibold text-hcGray-800">글로벌 표준 RPI 지수</label>
              </div>
              <input type="text" name="rpi" value={formData.rpi} onChange={handleChange} placeholder="예: 110.0" className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-hcBlue transition-all" />
            </div>
            <div className="bg-hcNavy/5 p-3 rounded-md border border-hcNavy/10 flex justify-between items-center">
              <span className="text-xs font-medium text-hcGray-800">서울(90) 대비 상대 지수 예측</span>
              <span className="text-lg font-bold text-hcNavy font-mono">{getPreviewNormalized()}</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">사용 통화 (Currency)</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue">
                {currencies.map(cur => <option key={cur} value={cur}>{cur}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-hcBlue text-white rounded-md font-bold hover:bg-hcNavy transition-colors shadow-sm">
            {isSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />} {isSuccess ? '저장 완료!' : '시스템에 저장 후 적용'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminGuideAccordion() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-hcGray-200 overflow-hidden mb-6 transition-all duration-300">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-hcNavy to-hcBlue text-white hover:opacity-95 transition-opacity">
        <div className="flex items-center gap-3"><FileText className="w-6 h-6 text-yellow-300" /><h3 className="font-bold text-lg tracking-tight">[필독] 누구나 할 수 있는 연 1회 시스템 업데이트 가이드</h3></div>
        <div className="flex items-center gap-2 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">{isOpen ? '매뉴얼 닫기' : '클릭해서 열기'}{isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</div>
      </button>
      {isOpen && (
        <div className="p-8 bg-gray-50 border-t border-hcGray-200 space-y-8">
          <section>
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-600" />1. 시스템 운영 방침 및 데이터 검증</h4>
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 text-hcGray-700 text-sm leading-relaxed space-y-3 shadow-sm">
              <ul className="list-disc pl-5 space-y-2 font-medium">
                <li>외부 실시간 API 의존도를 낮추고 내부 통제 기반의 정적 데이터 적용</li>
                <li>예산 집행의 안정성 확보를 위해 전년도 1년 치 연평균 환율 고정 적용</li>
                <li>이중 지급 방지를 위해 주거비가 제외된 UN ICSC 생계비 지수 사용</li>
              </ul>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2"><Database className="w-5 h-5 text-blue-600" />2. 환율 및 물가지수 동기화 (연 1회)</h4>
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 text-hcGray-700 text-sm leading-relaxed space-y-3 shadow-sm">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>환율 자동 산출:</strong> 관리자 창의 '자동 산출' 버튼 클릭 시 유럽중앙은행 API 기반 직전년도 평균 환율 일괄 업데이트 완료</li>
                <li><strong>마이너 통화 수동 입력:</strong> API가 지원하지 않는 통화(SAR, VND 등)는 알림창 확인 후 개별 확인 및 수동 입력 진행</li>
                <li><strong>엔화 보정:</strong> JPY(엔화)의 경우 당사 회계 표준인 100엔 단위 수치로 시스템 자동 보정 적용</li>
                <li><strong>수정자 이력 기입:</strong> 데이터 저장 시 팝업창에 수정자의 성명과 사번 필수 기입</li>
              </ul>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2"><Settings className="w-5 h-5 text-blue-600" />3. 연도별 SI(생계비) 비율 설정</h4>
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 text-hcGray-700 text-sm leading-relaxed space-y-3 shadow-sm">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>1천만 원 단위 표준화:</strong> 보안 유지를 위해 실제 연봉 대신 5,000만 원부터 1억 5,000만 원까지 1천만 원 단위 고정 구간 렌더링</li>
                <li><strong>새 연도 데이터 생성:</strong> '연도 추가' 입력창에 신규 연도(예: 2027) 입력 시 기존 데이터 복제 및 신규 탭 생성</li>
                <li><strong>비율 개별 세팅:</strong> 각 소득 구간별 단신 부임 및 가족 동반 부임 시 적용될 환산 비율 직관적 기입</li>
              </ul>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-bold text-hcNavy mb-3 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" />4. 신규 파견 도시 추가</h4>
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 text-hcGray-700 text-sm leading-relaxed space-y-3 shadow-sm">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>진입 경로:</strong> 대시보드 좌측 'Host (부임도시)' 드롭다운 메뉴 최하단의 '+ 리스트에 없는 도시 직접 입력' 항목 클릭</li>
                <li><strong>스마트 자동 완성:</strong> 도시명 입력 시 내장된 확장 RPI 데이터베이스에서 원본 지수 및 사용 통화 자동 매핑</li>
                <li><strong>서울 대비 지수 예측:</strong> 입력된 RPI 기준 서울(90) 대비 정규화(Normalized) 지수 실시간 사전 확인</li>
              </ul>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function App() {
  const [adminData, setAdminData] = useState(() => {
    const saved = localStorage.getItem('expatValueAdminData_v5');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse", e); } }
    return UN_ICSC_DATA;
  });

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCustomCityOpen, setIsCustomCityOpen] = useState(false);
  const [customCities, setCustomCities] = useState([]);
  const [customSiMap, setCustomSiMap] = useState({});
  const [formData, setFormData] = useState({ homeCountry: '대한민국', homeCity: '서울', hostCountry: '', hostCity: '', familyType: 'single', baseSalary: '', homeCol: '100.00', hostCol: '', exchangeRate: '', currency: '' });
  const [result, setResult] = useState(null);

  useEffect(() => {
    const savedCustomCities = localStorage.getItem('expatValueCustomCities');
    if (savedCustomCities) { try { setCustomCities(JSON.parse(savedCustomCities) || DEFAULT_CITY_DATA); } catch (e) { console.error("Parse error", e); } }
    const savedCustomSiMap = localStorage.getItem('expatValueCustomSiTables');
    if (savedCustomSiMap) { try { setCustomSiMap(JSON.parse(savedCustomSiMap) || {}); } catch (e) { console.error("Parse error", e); } }
  }, []);

  function handleAddCustomCity(cityData) {
    const updatedCities = [...(customCities || []), cityData];
    setCustomCities(updatedCities);
    localStorage.setItem('expatValueCustomCities', JSON.stringify(updatedCities));
    setFormData(prev => ({ ...prev, hostCity: cityData?.city || '' }));
    setIsCustomCityOpen(false);
  }

  useEffect(() => {
    if (!adminData) return;
    let mergedIndices = { ...(adminData?.colData?.indices || {}) };
    let mergedCurrencies = { ...(adminData?.cityCurrency || {}) };
    if (customCities && Array.isArray(customCities)) {
      customCities.forEach(c => {
        if (c && c.city) { mergedIndices[c.city] = c.rpi; mergedCurrencies[c.city] = c.currency; }
      });
    }
    const rates = adminData?.exchangeData?.rates || {};
    let hostColAdjusted = ''; let exchangeRateValue = ''; let currency = '';

    if (formData?.hostCity && mergedIndices[formData.hostCity]) {
      const rawCol = mergedIndices[formData.hostCity];
      const adjustedCol = (rawCol / 90) * 100;
      hostColAdjusted = adjustedCol.toFixed(2);
      currency = mergedCurrencies[formData.hostCity] || 'KRW';
      exchangeRateValue = rates[currency] ? rates[currency].toString() : '';
    }
    setFormData(prev => ({ ...prev, homeCol: '100.00', hostCol: hostColAdjusted, exchangeRate: exchangeRateValue, currency: currency || 'KRW' }));
  }, [formData?.hostCity, adminData, customCities]);

  const activeCurve = result ? getActiveCurve('single', result.targetYear, customSiMap) : null;

  function handleCalculate() {
    try {
      if (!formData?.baseSalary) { alert('국내 기본연봉을 입력해주세요.'); return; }
      if (!formData?.hostCity) { alert('부임도시를 선택해주세요.'); return; }
      if (!formData?.exchangeRate) { alert('환율 데이터가 로드되지 않았습니다.'); return; }

      const baseSalaryNum = parseInt(formData.baseSalary.replace(/,/g, ''), 10) || 0;
      const exchangeRateNum = parseFloat(formData.exchangeRate) || 1;
      let mergedIndices = { ...(adminData?.colData?.indices || {}) };
      if (customCities && customCities.length > 0) customCities.forEach(c => { mergedIndices[c.city] = c.rpi; });

      const rawHostCol = mergedIndices[formData.hostCity] || 100;
      const normalizedColMultiplier = rawHostCol / 90;
      const targetYear = new Date().getFullYear();
      const singleSiPercentage = calculateSIPercentage(baseSalaryNum, 'single', targetYear, customSiMap) || 0;
      const finalSiPercentage = calculateSIPercentage(baseSalaryNum, formData.familyType || 'single', targetYear, customSiMap) || 0;
      const baseSIAmount = baseSalaryNum * (singleSiPercentage / 100);
      const finalSIAmount = baseSalaryNum * (finalSiPercentage / 100);
      const familyMultiplier = singleSiPercentage > 0 ? (finalSiPercentage / singleSiPercentage).toFixed(4) : "1.0000";
      const overseasLivingCostKRW = finalSIAmount * normalizedColMultiplier;
      const finalLocalCurrencyAmount = overseasLivingCostKRW / exchangeRateNum;

      setResult({
        baseSalary: baseSalaryNum, singleSiPercentage, finalSiPercentage, baseSIAmount, familyMultiplier, finalSIAmount,
        normalizedColMultiplier, rawHostCol, seoulBaseRpi: 90, overseasLivingCostKRW, exchangeRate: exchangeRateNum,
        currency: formData.currency || 'KRW', finalLocalCurrencyAmount, targetYear
      });
    } catch (error) { alert('계산 중 오류가 발생했습니다.\n(에러 상세: ' + error.message + ')'); }
  }

  function handleReset() {
    setFormData({ homeCountry: '대한민국', homeCity: '서울', hostCountry: '', hostCity: '', familyType: 'single', baseSalary: '', homeCol: '100.00', hostCol: '', exchangeRate: '', currency: '' });
    setResult(null);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    if (name === 'hostCity' && value === '__CUSTOM__') { setIsCustomCityOpen(true); return; }
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSalaryChange(e) {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val) val = parseInt(val, 10).toLocaleString('ko-KR');
    setFormData(prev => ({ ...prev, baseSalary: val }));
  }

  return (
    <div className="flex min-h-screen bg-hcGray-50">
      <div className="w-[30%] min-w-[350px] max-w-[420px] shadow-lg z-10 sticky top-0 h-screen overflow-y-auto">
        <Sidebar formData={formData} onChange={handleInputChange} onSalaryChange={handleSalaryChange} onCalculate={handleCalculate} onReset={handleReset} onOpenAdmin={() => { const pwd = window.prompt("관리자 비밀번호를 입력하세요."); if (pwd === "hc2026") setIsAdminOpen(true); else if (pwd !== null) alert("접근 권한이 없습니다."); }} isDataLoading={isDataLoading} customCities={customCities} />
      </div>
      <div className="flex-1 min-h-screen relative flex flex-col">
        <Dashboard formData={formData} result={result} adminData={adminData} isDataLoading={isDataLoading} customSiMap={customSiMap} activeCurve={activeCurve} />
      </div>
      {isAdminOpen && <AdminModal adminData={adminData} setAdminData={setAdminData} customSiMap={customSiMap} setCustomSiMap={(newMap) => { setCustomSiMap(newMap); localStorage.setItem('expatValueCustomSiTables', JSON.stringify(newMap)); }} annualSiMap={ANNUAL_SI_MAP} onClose={() => setIsAdminOpen(false)} />}
      {isCustomCityOpen && <CustomCityModal extendedRpiDb={EXTENDED_RPI_DB} onClose={() => { setIsCustomCityOpen(false); if (formData.hostCity === '__CUSTOM__') setFormData(prev => ({ ...prev, hostCity: '' })); }} onSave={handleAddCustomCity} />}
    </div>
  );
}

export default App;
