import React from 'react';
import { FileText, ArrowRight, Info, DollarSign } from 'lucide-react';

function Dashboard({ formData, result, adminData, isDataLoading }) {
  const isReady = result !== null;

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
      <div className="p-8 h-full bg-hcGray-50 flex flex-col overflow-y-auto">
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

  return (
    <div className="p-8 h-full bg-hcGray-50 flex flex-col overflow-y-auto relative pb-24">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-hcNavy tracking-tight">해외 생계비 산정 결과</h2>
        <p className="text-hcGray-800 mt-2 text-sm">
          MERCER 기반 SI 산출 및 서울 기준 정규화 COL 지수 동기화 결과
        </p>
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
              <div className="font-semibold text-lg text-green-300">{isReady ? result.homeCol : formData.homeCol || '-'}</div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-50" />
            <div className="text-center">
              <div className="text-xs opacity-80 mb-1">{formData.hostCity || 'Host'} (정규화 COL)</div>
              <div className="font-semibold text-2xl text-yellow-300">{isReady ? result.hostCol : formData.hostCol || '-'}</div>
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

      <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 flex-1 overflow-hidden flex flex-col mb-8">
        <div className="p-5 border-b border-hcGray-100 flex items-center gap-2 bg-hcGray-50/50">
          <FileText className="w-5 h-5 text-hcNavy" />
          <h3 className="text-lg font-bold text-hcNavy">산출 수식 검증 (직관적 숫자 표기)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-hcGray-50 text-hcGray-800 font-semibold border-b border-hcGray-200 text-xs">
              <tr>
                <th className="px-6 py-4 w-1/4">항목</th>
                <th className="px-6 py-4 w-1/2">적용 수식 (Formula)</th>
                <th className="px-6 py-4 text-right w-1/4">산출액 / 비율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hcGray-100 text-hcGray-900">
              <tr className="hover:bg-hcGray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-hcBlue block"></span>
                  SI 비율 적용
                </td>
                <td className="px-6 py-4 text-hcGray-800 font-mono text-xs bg-hcGray-50/30">
                  {isReady ? `${formatNumber(result.baseSalary)} × ${result.siPercentage.toFixed(2)}%` : '-'}
                </td>
                <td className="px-6 py-4 text-right font-bold text-hcBlue">
                  {isReady ? formatCurrency(result.baseSIAmount, 'KRW') : '-'}
                </td>
              </tr>
              <tr className="hover:bg-hcGray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 block"></span>
                  가족 가산
                </td>
                <td className="px-6 py-4 text-hcGray-800 font-mono text-xs bg-hcGray-50/30">
                  {isReady ? `${formatNumber(result.baseSIAmount)} × ${result.familyMultiplier}` : '-'}
                </td>
                <td className="px-6 py-4 text-right font-bold text-blue-600">
                  {isReady ? formatCurrency(result.finalSIAmount, 'KRW') : '-'}
                </td>
              </tr>
              <tr className="hover:bg-hcGray-50/50 transition-colors bg-purple-50/10">
                <td className="px-6 py-4 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 block"></span>
                  최종 산식 (정규화 COL 및 환율)
                </td>
                <td className="px-6 py-4 text-hcGray-800 font-mono text-base font-bold bg-purple-50/20 text-purple-900">
                  {isReady ? `(${formatNumber(result.finalSIAmount)} × ${(result.relativeColPercentage / 100).toFixed(2)}) ÷ ${formatNumber(result.exchangeRate)}` : '-'}
                </td>
                <td className="px-6 py-4 text-right font-black text-purple-700 text-lg">
                  {isReady ? formatCurrency(result.finalLocalCurrencyAmount, result.currency) : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {!isReady && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-hcGray-800">
            <DollarSign className="w-12 h-12 text-hcGray-200 mb-3" />
            <p className="font-medium">모든 정보를 입력한 후 '생계비 산정 실행' 버튼을 클릭해주세요.</p>
            <p className="text-sm mt-1 text-hcGray-800 bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200 mt-4 text-center">
              💡 본 지수는 미 국무부 데이터를 바탕으로 <strong>서울(100) 대비 상대 물가를 산출한 정규화 지수</strong>를 기준으로 산출됩니다.
            </p>
          </div>
        )}
      </div>

      {/* 데이터 거버넌스 정보 영역 */}
      {adminData && (
        <div className="absolute bottom-0 left-0 w-full p-4 bg-hcGray-100 border-t border-hcGray-200 flex justify-between items-center text-xs text-hcGray-800">
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
      )}
    </div>
  );
}

export default Dashboard;
