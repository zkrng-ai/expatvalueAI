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
        
        <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 p-8 mb-8 animate-pulse">
           <div className="h-6 bg-hcGray-200 rounded w-1/4 mb-4"></div>
           <div className="h-12 bg-hcGray-200 rounded w-1/2"></div>
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
          MERCER 기반 SI 산출 및 미 국무부(U.S. DOS) 기반 공공 물가 지수 동기화 결과
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
              <div className="text-xs opacity-80 mb-1">{formData.homeCity || 'Home'} (Index)</div>
              <div className="font-semibold text-lg">{isReady ? result.homeCol : formData.homeCol || '-'}</div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-50" />
            <div className="text-center">
              <div className="text-xs opacity-80 mb-1">{formData.hostCity || 'Host'} (Index)</div>
              <div className="font-semibold text-lg">{isReady ? result.hostCol : formData.hostCol || '-'}</div>
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
          {isReady && (
            <div className="text-xs font-medium text-hcGray-800 px-3 py-1 bg-hcGray-50 rounded-md border border-hcGray-200">
              직전년도 연평균 환율 적용: 1 {result.currency} = {formatNumber(result.exchangeRate)} KRW
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-hcGray-100 flex-1 overflow-hidden flex flex-col mb-8">
        <div className="p-5 border-b border-hcGray-100 flex items-center gap-2 bg-hcGray-50/50">
          <FileText className="w-5 h-5 text-hcNavy" />
          <h3 className="text-lg font-bold text-hcNavy">산출 근거 (수학적 공식 투명 공개)</h3>
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
                  SI 비율 적용값
                </td>
                <td className="px-6 py-4 text-hcGray-800 font-mono text-xs bg-hcGray-50/30">
                  {isReady ? `기본연봉(${formatNumber(result.baseSalary)}) × 보간 적용 SI비율(${result.siPercentage.toFixed(2)}%)` : '-'}
                </td>
                <td className="px-6 py-4 text-right font-bold text-hcBlue">
                  {isReady ? formatCurrency(result.baseSIAmount, 'KRW') : '-'}
                </td>
              </tr>
              <tr className="hover:bg-hcGray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 block"></span>
                  가족 가산 내역
                </td>
                <td className="px-6 py-4 text-hcGray-800 font-mono text-xs bg-hcGray-50/30">
                  {isReady ? `단신 SI금액 × 가산율(${result.familyMultiplier})` : '-'}
                </td>
                <td className="px-6 py-4 text-right font-bold text-blue-600">
                  {isReady ? formatCurrency(result.finalSIAmount, 'KRW') : '-'}
                </td>
              </tr>
              <tr className="hover:bg-hcGray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 block"></span>
                  서울 대비 상대 물가비율
                </td>
                <td className="px-6 py-4 text-hcGray-800 font-mono text-xs bg-hcGray-50/30">
                  {isReady ? `(Host COL(${result.hostCol}) ÷ Seoul COL(${result.homeCol})) × 100` : '-'}
                </td>
                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                  {isReady ? `${formatNumber(result.relativeColPercentage)} %` : '-'}
                </td>
              </tr>
              <tr className="hover:bg-hcGray-50/50 transition-colors bg-purple-50/10">
                <td className="px-6 py-4 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 block"></span>
                  최종 환율 및 환산
                </td>
                <td className="px-6 py-4 text-hcGray-800 font-mono text-xs bg-purple-50/20">
                  {isReady ? `(가족 가산 내역 × 상대 물가비율) ÷ 환율(${formatNumber(result.exchangeRate)})` : '-'}
                </td>
                <td className="px-6 py-4 text-right font-black text-purple-700 text-base">
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
            <p className="text-sm mt-1 text-hcGray-800">본 지수는 서울(Seoul)을 기준(100)으로 자동 재가공됩니다.</p>
          </div>
        )}
      </div>

      {/* 데이터 거버넌스 정보 영역 */}
      {adminData && (
        <div className="absolute bottom-0 left-0 w-full p-4 bg-hcGray-100 border-t border-hcGray-200 flex justify-between items-center text-xs text-hcGray-800">
          <div>
            <strong>데이터 업데이트 정보</strong>
            <span className="mx-2">|</span>
            <span className="text-hcBlue font-medium">본 지수는 미 국무부(U.S. State Dept.)의 Retail Price Index를 서울 기준으로 재가공하여 산출되었습니다.</span>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <span className="opacity-70">U.S. DOS Index:</span> <strong className="ml-1">{adminData.colData.version}</strong>
              <a href={adminData.colData.sourceUrl} target="_blank" rel="noreferrer" className="ml-2 underline text-hcBlue">Source</a>
            </div>
            <div>
              <span className="opacity-70">Exchange Rates:</span> <strong className="ml-1">{adminData.exchangeData.meta.lastUpdated}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
