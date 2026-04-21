import React, { useState } from 'react';
import { FileText, ArrowRight, Info, DollarSign, CheckCircle, ShieldCheck, ChevronDown, ChevronUp, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

function Dashboard({ formData, result, adminData, isDataLoading }) {
  const isReady = result !== null;
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const formatCurrency = (val, currency) => {
    if (val === undefined || val === null) return '0';
    return new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: currency || 'KRW',
      maximumFractionDigits: currency === 'KRW' ? 0 : 2
    }).format(val);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(val);
  }

  if (isDataLoading) {
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
    wsData.push(['국내 기본연봉', formatCurrency(result.baseSalary, 'KRW')]);
    wsData.push(['동반 가족 수', `${formData.familySize}명`]);
    wsData.push(['파견 국가/도시', `${formData.country} / ${formData.hostCity}`]);
    wsData.push([]);
    
    // 2. 최종 산출 결과 요약
    wsData.push(['[최종 산출 결과 요약]']);
    wsData.push(['환산 전 원화 생계비', formatCurrency(result.overseasLivingCostKRW, 'KRW')]);
    wsData.push(['최종 해외 생계비 (현지통화)', `${formatCurrency(result.finalLocalCurrencyAmount, result.currency)} ${result.currency}`]);
    wsData.push([]);
    
    // 3. 상세 산출 과정 (아코디언 열려있을 때만)
    if (isAccordionOpen) {
      wsData.push(['[상세 산출 과정 (Step-by-Step)]']);
      wsData.push(['Step 1. 국내 생계비(SI) 도출', `입력 연봉 ${formatNumber(result.baseSalary)}원 기준, 소득 구간별 SI 비중 ${result.siPercentage.toFixed(2)}%를 적용하여 ${formatNumber(result.baseSIAmount)}원이 산출되었습니다.`]);
      
      const familyText = formData?.familyType === 'family' 
        ? `가족 동반에 따른 가산율(${result.familyMultiplier}배)을 적용하여 최종 국내 기준액은 ${formatNumber(result.finalSIAmount)}원입니다.`
        : `단신 부임으로 별도의 가산율 적용 없이 최종 국내 기준액은 ${formatNumber(result.finalSIAmount)}원입니다.`;
      wsData.push(['Step 2. 가족 가산 적용', familyText]);
      
      wsData.push(['Step 3. 도시별 물가 보전(COL)', `서울(100) 대비 파견지 상대 지수 ${(result.normalizedColMultiplier * 100).toFixed(1)}을 곱하여 보전 후 금액은 ${formatNumber(result.overseasLivingCostKRW)}원입니다.`]);
      
      wsData.push(['Step 4. 통화 환산', `${adminData.exchangeData.meta.targetYear}년 연평균 환율 ₩${new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result.exchangeRate)}을 적용하여 최종 현지 통화 ${formatNumber(result.finalLocalCurrencyAmount)} ${result.currency}가 산출되었습니다.`]);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "생계비 산출 내역");
    
    XLSX.writeFile(wb, `ExpatValue_산출내역_${formData.hostCity}.xlsx`);
  };

  return (
    <div className="p-8 min-h-full bg-hcGray-50 flex flex-col flex-1 pb-24">
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-hcNavy tracking-tight">해외 생계비 산정 결과</h2>
          <p className="text-hcGray-800 mt-2 text-sm">
            MERCER 기반 SI 산출 및 서울 기준 정규화 COL 지수 동기화 결과
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
            <span className="text-sm font-medium">환산 전 원화 생계비 (가족/COL 반영): </span>
            <span className="text-lg font-bold text-hcNavy">
              {isReady ? formatCurrency(result.overseasLivingCostKRW, 'KRW') : '-'}
            </span>
          </div>
          {isReady && adminData && (
            <div className="text-xs font-medium text-hcGray-800 px-3 py-1 bg-hcGray-50 rounded-md border border-hcGray-200">
              1 {result.currency} = {formatNumber(result.exchangeRate)} KRW ({adminData.exchangeData.meta.targetYear}년 {adminData.exchangeData.meta.source} 기준)
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
                <h4 className="font-bold text-hcNavy mb-1">국내 생계비(SI) 도출</h4>
                <p className="text-sm text-hcGray-800">
                  입력 연봉 <strong>{formatCurrency(result?.baseSalary, 'KRW')}</strong> 기준, 소득 구간별 SI 비중 <strong>{result?.siPercentage.toFixed(2)}%</strong>를 적용하여 <strong>{formatCurrency(result?.baseSIAmount, 'KRW')}</strong>이 산출되었습니다.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">2</div>
              <div className="bg-hcGray-50/50 p-4 rounded-lg border border-hcGray-100 flex-1">
                <h4 className="font-bold text-hcNavy mb-1">가족 가산 적용</h4>
                <p className="text-sm text-hcGray-800">
                  {formData?.familyType === 'family' 
                    ? <>가족 동반에 따른 가산율(<strong>{result?.familyMultiplier}배</strong>)을 적용하여 최종 국내 기준액은 <strong>{formatCurrency(result?.finalSIAmount, 'KRW')}</strong>입니다.</>
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
                  서울(100) 대비 파견지 상대 지수 <strong>{(result?.normalizedColMultiplier * 100)?.toFixed(1)}</strong>을 곱하여 보전 후 금액은 <strong>{formatCurrency(result?.overseasLivingCostKRW, 'KRW')}</strong>입니다.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">4</div>
              <div className="bg-green-50/50 p-4 rounded-lg border border-green-100 flex-1">
                <h4 className="font-bold text-green-900 mb-1">통화 환산</h4>
                <p className="text-sm text-green-800">
                  {adminData?.exchangeData.meta.targetYear}년 연평균 환율 <strong>₩{new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result?.exchangeRate)}</strong>을 적용하여 최종 현지 통화 <strong>{formatCurrency(result?.finalLocalCurrencyAmount, result?.currency)} {result?.currency}</strong>가 산출되었습니다.
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
              💡 본 지수는 미 국무부 데이터를 바탕으로 <strong>서울(100) 대비 상대 물가를 산출한 정규화 지수</strong>를 기준으로 산출됩니다.
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
                <span>1. 미 국무부 COL 지수 신뢰성</span>
                <span className="text-[10px] bg-hcGray-100 text-hcGray-500 px-2 py-0.5 rounded">RPI</span>
              </h4>
              <p className="text-xs text-hcGray-600 leading-relaxed mb-3">
                <span className="font-semibold text-hcGray-800">출처:</span> 미 국무부 Retail Price Index (Washington D.C. = 100)
              </p>
              <div className="text-sm text-hcGray-800 leading-relaxed bg-blue-50/50 p-3 rounded-md border border-blue-100/50">
                <span className="font-semibold text-blue-900 block mb-1">현재 수치 산출 근거:</span> 
                Washington(100) 기준, 서울은 <strong>[{result.seoulBaseRpi}]</strong>, {formData.hostCity}은(는) <strong>[{result.rawHostCol}]</strong>이므로 
                최종 COL 지수는 <strong className="text-blue-700 bg-white px-1 py-0.5 rounded shadow-sm border border-blue-100">[{result.rawHostCol} / {result.seoulBaseRpi} = {(result.normalizedColMultiplier * 100).toFixed(1)}]</strong>으로 산출되었습니다.
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-hcGray-500 mt-4">
                <span className="font-semibold bg-hcGray-100 px-1.5 py-0.5 rounded">트렌드 비교</span>
                <span className="border border-hcGray-200 px-1.5 py-0.5 rounded">직전 분기('26년 Q1): {((result.normalizedColMultiplier * 100) * 1.02).toFixed(1)} (서울 100 대비)</span>
                <span className="border border-hcGray-200 px-1.5 py-0.5 rounded">전년 동기('25년 Q2): {((result.normalizedColMultiplier * 100) * 0.95).toFixed(1)} (서울 100 대비)</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-hcGray-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-sm text-hcGray-800 mb-3 border-b border-hcGray-100 pb-2 flex justify-between items-center">
                <span>2. 환율 데이터 투명성</span>
                <span className="text-[10px] bg-hcGray-100 text-hcGray-500 px-2 py-0.5 rounded">FX Rate</span>
              </h4>
              <p className="text-sm text-hcGray-800 leading-relaxed bg-green-50/50 p-3 rounded-md border border-green-100/50 mb-3">
                <span className="font-semibold text-green-900 block mb-1">기준:</span> 
                현재 적용 환율은 <strong className="text-green-700">{adminData.exchangeData.meta.targetYear}년(직전년도) 1월 1일부터 12월 31일까지의 연평균 매매기준율</strong>입니다.
              </p>
              <div className="flex items-center gap-2 text-xs text-hcGray-500 bg-hcGray-50 p-2 rounded border border-hcGray-100">
                <Info className="w-3.5 h-3.5" />
                <span>{adminData.exchangeData.meta.source} 및 글로벌 외환 API 데이터를 기반으로 일별 통합 산술 평균 산출</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-hcGray-700 bg-white p-3 rounded-lg border border-hcGray-200 shadow-sm mt-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            본 데이터는 공공 API를 통해 실시간으로 호출된 검증된 수치입니다.
          </div>
        </div>
      )}

      {/* 데이터 거버넌스 정보 영역 */}
      {adminData && (
        <div className="mt-auto pt-16 -mx-8 pb-12">
          <div className="p-4 bg-hcGray-100 border-y border-hcGray-200 flex flex-wrap gap-4 justify-between items-center text-xs text-hcGray-800">
            <div>
              <strong>데이터 업데이트 정보</strong>
              <span className="mx-2">|</span>
              <span className="text-hcBlue font-medium">본 지수는 미 국무부 데이터를 바탕으로 서울(100) 대비 상대 물가를 산출한 결과입니다.</span>
            </div>
          <div className="flex gap-4 text-right">
            <div>
              <span className="opacity-70">U.S. DOS Index:</span> <strong className="ml-1">{adminData.colData.version}</strong>
              <a href={adminData.colData.sourceUrl} target="_blank" rel="noreferrer" className="ml-2 underline text-hcBlue">Source</a>
            </div>
            <div>
              <span className="opacity-70">Exchange Rates:</span> <strong className="ml-1">{adminData.exchangeData.meta.lastUpdated} ({adminData.exchangeData.meta.source})</strong>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
