import React from 'react';
import { Calculator, MapPin, Users, Coins, Globe, Settings } from 'lucide-react';

function Sidebar({ formData, onChange, onSalaryChange, onCalculate, onReset, onOpenAdmin, isDataLoading, customCities }) {
  
  const presets = {
    '대한민국': ['서울', '부산'],
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
            <MapPin className="w-4 h-4" /> 파견국 및 부임국
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">Home (파견국)</label>
              <select name="homeCity" value={formData.homeCity} onChange={onChange} className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue">
                {displayGroups['대한민국']?.map(city => (
                  <option key={`home-${city}`} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">Host (부임도시)</label>
              <select name="hostCity" value={formData.hostCity} onChange={onChange} className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue">
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
            <input type="text" name="baseSalary" value={formData.baseSalary} onChange={onSalaryChange} placeholder="0" className="w-full p-3 pr-10 bg-white border border-hcGray-200 rounded-md text-right font-bold text-lg focus:outline-none focus:ring-2 focus:ring-hcBlue shadow-inner" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-hcGray-800 font-medium">원</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-hcNavy flex items-center gap-2 border-b border-hcGray-100 pb-2">
            <Users className="w-4 h-4" /> 부양 가족 형태
          </h3>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer text-sm font-medium ${formData.familyType === 'single' ? 'bg-hcNavy text-white border-hcNavy' : 'bg-white text-hcGray-800 border-hcGray-200 hover:bg-hcGray-50'}`}>
              <input type="radio" name="familyType" value="single" checked={formData.familyType === 'single'} onChange={onChange} className="hidden" />
              단신 부임
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer text-sm font-medium ${formData.familyType === 'family' ? 'bg-hcNavy text-white border-hcNavy' : 'bg-white text-hcGray-800 border-hcGray-200 hover:bg-hcGray-50'}`}>
              <input type="radio" name="familyType" value="family" checked={formData.familyType === 'family'} onChange={onChange} className="hidden" />
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
              <input type="text" readOnly value={formData.homeCol} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-24 text-xs font-semibold text-hcGray-800">Host Index</label>
              <input type="text" readOnly value={formData.hostCol} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-24 text-xs font-semibold text-hcGray-800">연평균 환율</label>
              <input type="text" readOnly value={formData.exchangeRate} className="flex-1 p-2 bg-hcGray-100 border border-hcGray-200 rounded-md text-sm text-right cursor-not-allowed" />
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

export default Sidebar;
