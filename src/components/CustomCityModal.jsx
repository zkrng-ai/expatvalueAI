import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';

function CustomCityModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    rpi: '',
    currency: 'USD'
  });

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'VND', 'SGD', 'SAR', 'KRW', 'CAD', 'AUD'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    onSave({
      ...formData,
      rpi: rpiNum
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 bg-hcNavy text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg font-bold">새 파견 도시 추가 (Admin)</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
          <p className="text-sm text-hcGray-800 mb-2">
            추가된 도시는 브라우저에 저장되며, 기존 서울 기준 정규화 수식과 환율 로직이 완벽하게 연동됩니다.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">국가명 (Country)</label>
              <input 
                type="text" 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                placeholder="예: 프랑스" 
                className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">도시명 (City)</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="예: 파리" 
                className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-hcGray-800 mb-1">미 국무부 원본 RPI 지수 (Washington=100 기준)</label>
              <input 
                type="text" 
                name="rpi" 
                value={formData.rpi} 
                onChange={handleChange} 
                placeholder="예: 110.0" 
                className="w-full p-2.5 bg-hcGray-50 border border-hcGray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
              />
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

          <button type="submit" className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-hcBlue text-white rounded-md font-bold hover:bg-hcNavy transition-colors">
            <Save className="w-4 h-4" /> 시스템에 저장 및 적용
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomCityModal;
