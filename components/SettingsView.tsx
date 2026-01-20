
import React, { useRef } from 'react';
import { Download, Upload, Info, Heart } from 'lucide-react';

interface SettingsViewProps {
  onImport: (json: string) => void;
  onExport: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onImport, onExport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onImport(content);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  return (
    <div className="w-full h-full overflow-y-auto p-8 hide-scrollbar">
      <div className="max-w-2xl mx-auto space-y-12 pb-20">
        {/* Intro */}
        <section className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-soft flex items-center justify-center mx-auto mb-6 border border-slate-50">
            <Heart size={32} className="text-morandi-pink fill-morandi-pink/20" />
          </div>
          <h2 className="serif text-2xl font-bold text-slate-700">關於《拾光長箋》</h2>
          <p className="text-sm text-slate-500 leading-relaxed px-10">
            這是一款專為 INFP 開發的微啟動工具。<br/>
            旨在消除「開始」的恐懼，將宏大的目標拆解為每日的微小筆記。<br/>
            不追求完美的成就，只記錄當下的流動。
          </p>
        </section>

        {/* Data Security */}
        <section className="bg-white rounded-[40px] p-8 shadow-soft border border-slate-50 space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Info size={18} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-700">數據安全與備份</h3>
          </div>
          
          <p className="text-xs text-slate-400">
            您的所有數據均保存在瀏覽器的 LocalStorage 中。為了防止數據丟失（例如清除緩存），請定期導出備份並存放至您的 iCloud Drive 或 Google Drive。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={onExport}
              className="flex items-center justify-center space-x-3 bg-slate-700 text-white py-4 rounded-3xl hover:bg-slate-800 transition-all shadow-md group"
            >
              <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
              <span className="font-medium">導出備份 (.json)</span>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-3 bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-3xl hover:bg-slate-50 transition-all group"
            >
              <Upload size={20} className="group-hover:-translate-y-0.5 transition-transform" />
              <span className="font-medium">導入數據備份</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange}
            />
          </div>
        </section>

        {/* Design Philosophy */}
        <div className="text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] tracking-widest uppercase font-bold text-slate-400 mb-1">Created with Mindfulness</p>
          <p className="text-[10px] text-slate-300">Version 1.0 · Designed for Gentle Souls</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
