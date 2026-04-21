import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdminModal from './components/AdminModal';
import { STATE_DEPT_DATA } from './data/state_dept_indices';
import { CITY_CURRENCY_MAP, FALLBACK_EXCHANGE_RATES } from './data/constants';
import { calculateSIPercentage, calculateFamilySIAmount, calculateAdjustedCol } from './utils/calculator';

function App() {
  const [adminData, setAdminData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

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

  // Data Fetching Logic (Try-Catch with Fallback)
  const fetchExternalData = async (force = false) => {
    setIsDataLoading(true);
    
    try {
      if (!force) {
        const cached = sessionStorage.getItem('expatValueAdminData');
        if (cached) {
          setAdminData(JSON.parse(cached));
          setIsDataLoading(false);
          return;
        }
      }

      let bokData;
      
      // VITE_API_KEY_ENARA 키 유무를 먼저 검사하여 불필요한 빨간색 Network Error(콘솔 에러) 방지
      const apiKey = import.meta.env.VITE_API_KEY_ENARA;
      
      if (!apiKey || apiKey === 'your_enara_or_bok_api_key_here') {
        console.log("✅ [System] API Key 미설정: Vercel 환경 변수가 없어 내장된 안전한 Fallback(기준) 데이터를 로드합니다.");
        bokData = FALLBACK_EXCHANGE_RATES;
      } else {
        try {
          const apiUrl = `https://api.bok.or.kr/ecos/${apiKey}/json`;
          const res = await axios.get(apiUrl, { timeout: 3000 });
          bokData = res.data;
        } catch (e) {
          console.warn("⚠️ [System] BOK ECOS API 호출 실패. 안전한 Fallback 데이터를 사용합니다.", e);
          bokData = FALLBACK_EXCHANGE_RATES;
        }
      }

      const newData = {
        colData: STATE_DEPT_DATA,
        exchangeData: bokData,
        cityCurrency: CITY_CURRENCY_MAP
      };

      sessionStorage.setItem('expatValueAdminData', JSON.stringify(newData));
      setAdminData(newData);

    } catch (error) {
      console.error("데이터 동기화 치명적 오류:", error);
      alert("데이터를 초기화하는데 실패했습니다.");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchExternalData();
  }, []);

  // Form Auto-fill Logic
  useEffect(() => {
    if (!adminData) return;

    const indices = adminData.colData.indices;
    const rates = adminData.exchangeData.rates;
    const seoulBase = indices['서울'] || 115.0;

    let hostColAdjusted = '';
    let exchangeRateValue = '';
    let currency = '';

    if (formData.hostCity && indices[formData.hostCity]) {
      const rawCol = indices[formData.hostCity];
      const adjustedCol = calculateAdjustedCol(rawCol, seoulBase);
      hostColAdjusted = adjustedCol.toFixed(2);
      
      currency = adminData.cityCurrency[formData.hostCity] || 'KRW';
      exchangeRateValue = rates[currency] ? rates[currency].toString() : '1';
    }

    setFormData(prev => ({
      ...prev,
      homeCol: '100.00',
      hostCol: hostColAdjusted,
      exchangeRate: exchangeRateValue,
      currency: currency || 'KRW'
    }));
    
  }, [formData.hostCity, adminData]);

  const handleCalculate = () => {
    if (!formData.baseSalary || !formData.homeCol || !formData.hostCol || !formData.exchangeRate) {
      alert('모든 필수 입력값을 채워주세요.');
      return;
    }

    const baseSalaryNum = parseInt(formData.baseSalary.replace(/,/g, ''), 10) || 0;
    const homeColNum = parseFloat(formData.homeCol) || 100;
    const hostColNum = parseFloat(formData.hostCol) || 100;
    const exchangeRateNum = parseFloat(formData.exchangeRate) || 1;
    
    const siPercentage = calculateSIPercentage(baseSalaryNum);
    const baseSIAmount = baseSalaryNum * (siPercentage / 100);

    const familyMultiplier = formData.familyType === 'family' ? 1.15 : 1.0;
    const finalSIAmount = calculateFamilySIAmount(baseSIAmount, formData.familyType);

    const relativeColPercentage = (hostColNum / homeColNum) * 100;
    const overseasLivingCostKRW = finalSIAmount * (relativeColPercentage / 100);

    const finalLocalCurrencyAmount = overseasLivingCostKRW / exchangeRateNum;

    setResult({
      baseSalary: baseSalaryNum,
      siPercentage: siPercentage,
      baseSIAmount: baseSIAmount,
      familyMultiplier: familyMultiplier,
      finalSIAmount: finalSIAmount,
      homeCol: homeColNum.toFixed(2),
      hostCol: hostColNum.toFixed(2),
      relativeColPercentage: relativeColPercentage,
      overseasLivingCostKRW: overseasLivingCostKRW,
      exchangeRate: exchangeRateNum,
      currency: formData.currency || 'KRW',
      finalLocalCurrencyAmount: finalLocalCurrencyAmount
    });
  };

  const handleReset = () => {
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalaryChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      val = parseInt(val, 10).toLocaleString('ko-KR');
    }
    setFormData(prev => ({
      ...prev,
      baseSalary: val
    }));
  };

  return (
    <div className="flex h-screen bg-hcGray-50">
      <div className="w-[30%] min-w-[350px] max-w-[420px] h-full shadow-lg z-10">
        <Sidebar 
          formData={formData} 
          onChange={handleInputChange} 
          onSalaryChange={handleSalaryChange} 
          onCalculate={handleCalculate} 
          onReset={handleReset} 
          onOpenAdmin={() => setIsAdminOpen(true)}
          isDataLoading={isDataLoading}
        />
      </div>
      <div className="flex-1 h-full relative">
        <Dashboard 
          formData={formData} 
          result={result} 
          adminData={adminData} 
          isDataLoading={isDataLoading}
        />
      </div>
      {isAdminOpen && (
        <AdminModal 
          adminData={adminData} 
          setAdminData={setAdminData} 
          onClose={() => setIsAdminOpen(false)} 
          onForceUpdate={() => {
            setIsAdminOpen(false);
            fetchExternalData(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
