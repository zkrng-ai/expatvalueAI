import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Save, ExternalLink, Search, CheckCircle } from 'lucide-react';
import { EXTENDED_RPI_DB } from '../data/extended_rpi_data';

function CustomCityModal({ onClose, onSave }) {
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
    const results = EXTENDED_RPI_DB.filter(
      item => 
        item.city.toLowerCase().includes(lowerQuery) || 
        item.country.toLowerCase().includes(lowerQuery)
    );
    
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (item) => {
    setFormData({
      country: item.country,
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
                  placeholder="예: 프랑스" 
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
                    placeholder="예: 파리" 
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
                <span>데이터를 찾을 수 없습니다. 미 국무부 사이트에서 조회 후 직접 입력해주세요.</span>
              </div>
            )}

            <div className="pt-2 border-t border-hcGray-100">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-semibold text-hcGray-800">미 국무부 원본 RPI 지수 (수동 수정 가능)</label>
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
            {isSuccess ? '저장 완료!' : '시스템에 저장 및 적용'}
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

export default CustomCityModal;
