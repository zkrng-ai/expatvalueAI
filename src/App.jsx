import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdminModal from './components/AdminModal';
import CustomCityModal from './components/CustomCityModal';
import { STATE_DEPT_DATA } from './data/state_dept_indices';
import { CITY_CURRENCY_MAP, FALLBACK_EXCHANGE_RATES } from './data/constants';
import { calculateSIPercentage, calculateFamilySIAmount, calculateAdjustedCol } from './utils/calculator';

function App() {
  const [adminData, setAdminData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCustomCityOpen, setIsCustomCityOpen] = useState(false);
  const [customCities, setCustomCities] = useState([]);

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
        setCustomCities(JSON.parse(savedCustomCities));
      } catch (e) {
        console.error("Failed to parse custom cities", e);
      }
    }
  }, []);

  const handleAddCustomCity = (cityData) => {
    const updatedCities = [...customCities, cityData];
    setCustomCities(updatedCities);
    localStorage.setItem('expatValueCustomCities', JSON.stringify(updatedCities));
    
    // Auto-select the newly added city
    setFormData(prev => ({
      ...prev,
      hostCity: cityData.city
    }));
    
    setIsCustomCityOpen(false);
  };

  // Data Fetching Logic (Using Vercel Serverless Function)
  const fetchExternalData = async (force = false) => {
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
        exchangeData = res.data;
      } catch (e) {
        console.warn("⚠️ [System] 백엔드(/api/exchange-rate) 호출 실패. 로컬 환경이거나 배포 에러입니다. 안전한 Fallback 데이터를 사용합니다.", e);
        
        const targetYear = new Date().getFullYear() - 1;
        exchangeData = {
          ...FALLBACK_EXCHANGE_RATES,
          meta: {
            ...FALLBACK_EXCHANGE_RATES.meta,
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
      console.error("데이터 동기화 치명적 오류:", error);
      alert("데이터를 초기화하는데 실패했습니다.");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchExternalData();
  }, []);

  // Form Auto-fill Logic with Custom Cities Merge
  useEffect(() => {
    if (!adminData) return;

    // Merge custom cities dynamically
    let mergedIndices = { ...adminData.colData.indices };
    let mergedCurrencies = { ...adminData.cityCurrency };

    customCities.forEach(c => {
      mergedIndices[c.city] = c.rpi;
      mergedCurrencies[c.city] = c.currency;
    });

    const rates = adminData.exchangeData.rates;
    // Force SEOUL_BASE_RPI to 48.6 absolutely everywhere
    const SEOUL_BASE_RPI = 48.6;

    let hostColAdjusted = '';
    let exchangeRateValue = '';
    let currency = '';

    if (formData.hostCity && mergedIndices[formData.hostCity]) {
      const rawCol = mergedIndices[formData.hostCity];
      const adjustedCol = (rawCol / SEOUL_BASE_RPI) * 100;
      hostColAdjusted = adjustedCol.toFixed(2);
      
      currency = mergedCurrencies[formData.hostCity] || 'KRW';
      exchangeRateValue = rates[currency] ? rates[currency].toString() : ''; // if missing, let it be empty instead of 1 to fail validation gracefully or show UI
    }

    setFormData(prev => ({
      ...prev,
      homeCol: '100.00',
      hostCol: hostColAdjusted,
      exchangeRate: exchangeRateValue,
      currency: currency || 'KRW'
    }));
    
  }, [formData.hostCity, adminData, customCities]);

  const handleCalculate = () => {
    if (!formData.baseSalary) {
      alert('국내 기본연봉을 입력해주세요.');
      return;
    }
    if (!formData.hostCity) {
      alert('부임도시를 선택해주세요.');
      return;
    }
    if (!formData.exchangeRate) {
      alert('환율 데이터가 로드되지 않았습니다. 잠시 후 다시 시도하거나 데이터를 확인해주세요.');
      return;
    }

    const SEOUL_BASE_RPI = 48.6;

    const baseSalaryNum = parseInt(formData.baseSalary.replace(/,/g, ''), 10) || 0;
    const exchangeRateNum = parseFloat(formData.exchangeRate) || 1;
    
    // Merge custom cities to fetch raw indices
    let mergedIndices = { ...(adminData?.colData.indices || {}) };
    customCities.forEach(c => { mergedIndices[c.city] = c.rpi; });

    const rawHostCol = mergedIndices[formData.hostCity] || 100;
    const normalizedColMultiplier = rawHostCol / SEOUL_BASE_RPI; // 예: 82.61 / 48.6 = 1.69979...
    
    const siPercentage = calculateSIPercentage(baseSalaryNum);
    const baseSIAmount = baseSalaryNum * (siPercentage / 100);

    const familyMultiplier = formData.familyType === 'family' ? 1.15 : 1.0;
    const finalSIAmount = calculateFamilySIAmount(baseSIAmount, formData.familyType);

    // 해외 생계비 = 국내 생계비 * 1.70
    const overseasLivingCostKRW = finalSIAmount * normalizedColMultiplier;

    // 최종 현지 통화액 = (해외 생계비 / 환율)
    const finalLocalCurrencyAmount = overseasLivingCostKRW / exchangeRateNum;

    setResult({
      baseSalary: baseSalaryNum,
      siPercentage: siPercentage,
      baseSIAmount: baseSIAmount,
      familyMultiplier: familyMultiplier,
      finalSIAmount: finalSIAmount,
      normalizedColMultiplier: normalizedColMultiplier, // 1.70
      rawHostCol: rawHostCol, // 82.61 - for fact check UI only
      seoulBaseRpi: SEOUL_BASE_RPI, // 48.6 - for fact check UI only
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
    if (name === 'hostCity' && value === '__CUSTOM__') {
      setIsCustomCityOpen(true);
      return;
    }
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
          customCities={customCities}
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
      {isCustomCityOpen && (
        <CustomCityModal 
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
