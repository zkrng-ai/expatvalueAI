import React, { useState } from 'react';
import { X, Save, Database, RefreshCw, Settings, Plus, Trash2 } from 'lucide-react';
import { ANNUAL_SI_MAP } from '../utils/calculator';

function AdminModal({ adminData, setAdminData, customSiMap = {}, setCustomSiMap, onClose, onForceUpdate }) {
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'si'
  const [jsonText, setJsonText] = useState(JSON.stringify(adminData, null, 2));
  const [error, setError] = useState('');

  // SI State
  const [localSiMap, setLocalSiMap] = useState({ ...customSiMap });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [newYearInput, setNewYearInput] = useState('');

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setAdminData(parsed);
      sessionStorage.setItem('expatValueAdminData', JSON.stringify(parsed));
      onClose();
    } catch (e) {
      setError('JSON 형식이 올바르지 않습니다.');
    }
  };

  const handleSaveSiMap = () => {
    setCustomSiMap(localSiMap);
    onClose();
  };

  const handleAddYear = () => {
    if (!newYearInput || isNaN(newYearInput)) return;
    if (!localSiMap[newYearInput] && !ANNUAL_SI_MAP[newYearInput]) {
      // Create a copy of 2026 data as template
      const template = ANNUAL_SI_MAP[2026];
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
        newMap[selectedYear] = JSON.parse(JSON.stringify(ANNUAL_SI_MAP[selectedYear] || ANNUAL_SI_MAP[2026]));
      }
      newMap[selectedYear][familyType][index].pct = parseFloat(value) || 0;
      return newMap;
    });
  };

  const availableYears = Array.from(new Set([
    ...Object.keys(ANNUAL_SI_MAP),
    ...Object.keys(localSiMap)
  ])).sort((a, b) => b - a);

  const activeSiData = localSiMap[selectedYear] || ANNUAL_SI_MAP[selectedYear] || ANNUAL_SI_MAP[2026];

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
            <div className="flex flex-col gap-4 h-full">
              <div className="flex justify-between items-start">
                <p className="text-sm text-hcGray-800 flex-1">
                  <strong>미 국무부(U.S. DOS)</strong> 데이터 구조와 <strong>e-나라지표 환율</strong>을 관리합니다. <br/>
                  자동 업데이트가 실패했거나, 수동으로 최신 버전(Override)을 적용하고 싶을 때 직접 편집하세요.
                </p>
                <button 
                  onClick={onForceUpdate}
                  className="px-4 py-2 bg-hcGray-100 hover:bg-hcGray-200 border border-hcGray-200 text-hcGray-800 rounded-md text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> API 강제 동기화
                </button>
              </div>
              
              <textarea
                className="w-full h-[400px] p-4 bg-hcGray-50 border border-hcGray-200 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hcBlue"
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setError('');
                }}
              />
              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            </div>
          )}

          {activeTab === 'si' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">연도별 생계비(SI) 비율 관리</h3>
                  <p className="text-xs text-blue-800">
                    MERCER 기반의 연간 소득구간별 단신/가족 비율을 설정합니다. 계산 엔진은 여기서 설정된 독립된 곡선을 바탕으로 보간 연산을 수행합니다.
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
                      <Trash2 className="w-3 h-3" /> 이 연도 커스텀 삭제
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
                          {(item.bound / 10000).toLocaleString('ko-KR')}만 원
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

export default AdminModal;
