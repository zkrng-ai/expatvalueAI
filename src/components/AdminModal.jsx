import React, { useState } from 'react';
import { X, Save, Database, RefreshCw } from 'lucide-react';

function AdminModal({ adminData, setAdminData, onClose, onForceUpdate }) {
  const [jsonText, setJsonText] = useState(JSON.stringify(adminData, null, 2));
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setAdminData(parsed);
      sessionStorage.setItem('expatValueAdminData', JSON.stringify(parsed));
      onClose();
    } catch (e) {
      setError('JSON 형식이 올바르지 않습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-w-[95%] flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-5 bg-hcNavy text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <h2 className="text-lg font-bold">Admin Setting (공공 데이터 동기화 관리)</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="flex justify-between items-start">
            <p className="text-sm text-hcGray-800 flex-1">
              <strong>미 국무부(U.S. DOS)</strong> 데이터 구조와 <strong>e-나라지표 환율</strong>을 관리합니다. <br/>
              자동 업데이트가 실패했거나, 수동으로 최신 버전(Override)을 적용하고 싶을 때 직접 편집하세요.
            </p>
            <button 
              onClick={onForceUpdate}
              className="px-4 py-2 bg-hcGray-100 hover:bg-hcGray-200 border border-hcGray-200 text-hcGray-800 rounded-md text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> API 강제 동기화 시도
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
        <div className="p-4 bg-hcGray-50 border-t border-hcGray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-white border border-hcGray-200 text-hcGray-800 rounded-md font-bold hover:bg-hcGray-100">취소</button>
          <button onClick={handleSave} className="px-5 py-2 bg-hcBlue text-white rounded-md font-bold flex items-center gap-2 hover:bg-hcNavy">
            <Save className="w-4 h-4" /> 데이터 강제 업데이트 (Override)
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminModal;
