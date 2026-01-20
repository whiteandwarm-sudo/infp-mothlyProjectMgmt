
import React, { useState, useMemo } from 'react';
import { Project, MatrixData } from '../types';
import { Plus, Trash2, Archive, X, ChevronDown, Mountain, GripVertical, Clock } from 'lucide-react';

interface MatrixViewProps {
  projects: Project[];
  matrix: MatrixData;
  selectedMonth: string;
  availableMonths: string[];
  onMonthChange: (m: string) => void;
  onCellUpdate: (day: number, projectId: number, value: string) => void;
  onProjectUpdate: (id: number, updates: Partial<Project>) => void;
  onAddProject: () => void;
  onDeleteProject: (id: number) => void;
  onReorder: (draggedId: number, targetId: number) => void;
}

const MatrixView: React.FC<MatrixViewProps> = ({ 
  projects, matrix, selectedMonth, availableMonths, onMonthChange,
  onCellUpdate, onProjectUpdate, onAddProject, onDeleteProject, onReorder
}) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const projectsToShow = useMemo(() => {
    return projects.filter(p => {
      // 已歸檔的項目不再顯示在月度矩陣裡
      if (p.archived) return false;
      
      const creationDate = new Date(p.id);
      const creationMonthStr = `${creationDate.getFullYear()}-${String(creationDate.getMonth() + 1).padStart(2, '0')}`;
      // 僅顯示在創建月份及之後的月份
      return selectedMonth >= creationMonthStr;
    });
  }, [projects, selectedMonth]);

  const activeProjectsCount = projects.filter(p => !p.archived).length;

  const getProjectStartDate = (pid: number) => {
    const keys = Object.keys(matrix).filter(k => k.endsWith(`-${pid}`) && matrix[k].trim() !== '').sort();
    if (keys.length === 0) return null;
    return keys[0].split('-').slice(0, 3).join('-'); 
  };

  const handleDragStart = (id: number) => setDraggedProjectId(id);
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedProjectId !== id) setDropTargetId(id);
  };
  const handleDrop = (targetId: number) => {
    if (draggedProjectId !== null && draggedProjectId !== targetId) onReorder(draggedProjectId, targetId);
    setDraggedProjectId(null);
    setDropTargetId(null);
  };

  return (
    <div className="w-full h-full relative group">
      <div className="w-full h-full overflow-auto hide-scrollbar bg-healing-bg px-6 py-4">
        {projectsToShow.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-soft flex items-center justify-center border border-slate-50/50">
              <Mountain size={48} className="text-[#cbb9d6] opacity-60" />
            </div>
            <div className="text-center space-y-2">
              <p className="serif text-xl text-slate-500 font-medium tracking-widest">當你決定爬山時，你已經在山頂了。</p>
              <p className="text-xs text-slate-300 uppercase tracking-[0.2em]">Every start is a peak in its own right</p>
            </div>
            <button onClick={onAddProject} className="mt-4 px-8 py-3 bg-white text-slate-500 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:bg-slate-50 transition-all text-sm font-medium">開啟新的長箋</button>
            <div className="relative pt-4">
              <button onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)} className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                <span>正在查看 {selectedMonth}</span>
                <ChevronDown size={14} />
              </button>
              {isMonthPickerOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-white shadow-xl rounded-2xl border border-slate-100 py-2 z-[60]">
                  {availableMonths.map(m => (
                    <div key={m} onClick={(e) => { e.stopPropagation(); onMonthChange(m); setIsMonthPickerOpen(false); }} className={`px-4 py-2 hover:bg-slate-50 text-xs transition-colors ${m === selectedMonth ? 'bg-slate-50 font-bold text-slate-800' : 'text-slate-600'}`}>{m}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="min-w-[1000px] inline-block align-middle pb-20">
            <table className="border-separate border-spacing-0 w-full table-fixed">
              <thead>
                <tr className="sticky top-0 z-40 bg-healing-bg/95 backdrop-blur-sm">
                  <th className="w-24 h-14 border-b border-r border-[#EEEDF5] text-xs text-slate-400 uppercase tracking-tighter sticky left-0 z-50 bg-healing-bg font-bold cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}>
                    <div className="flex items-center justify-center space-x-1">
                      <span>{selectedMonth}</span>
                      <ChevronDown size={12} className="text-slate-300" />
                    </div>
                  </th>
                  {projectsToShow.map((project) => (
                    <th 
                      key={project.id} 
                      draggable
                      onDragStart={() => handleDragStart(project.id)}
                      onDragOver={(e) => handleDragOver(e, project.id)}
                      onDrop={() => handleDrop(project.id)}
                      className={`min-w-[120px] px-2 h-14 border-b border-r border-[#EEEDF5] last:border-r-0 relative group/header overflow-hidden cursor-move transition-all ${dropTargetId === project.id ? 'bg-slate-100 border-l-2 border-l-slate-400' : ''}`}
                      onDoubleClick={() => setEditingProject(project)}
                    >
                      <div className="w-full flex items-center justify-center font-bold text-sm text-slate-600 truncate px-1">
                        <GripVertical size={12} className="mr-1 text-slate-300 opacity-0 group-hover/header:opacity-100 transition-opacity" />
                        <span className="truncate">{project.name}</span>
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full opacity-60" style={{ backgroundColor: project.color }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const isToday = day === todayDay && selectedMonth === todayMonthStr;
                  return (
                    <tr key={day} className={`group hover:bg-white/30 transition-colors ${isToday ? 'bg-[#cbb9d6]/20' : ''}`}>
                      <td className={`w-24 min-h-[4.5rem] border-b border-r border-[#EEEDF5] text-center sticky left-0 z-30 text-sm font-medium transition-colors ${isToday ? 'bg-[#cbb9d6] text-white shadow-sm' : 'bg-healing-bg text-slate-400'}`}>{day}</td>
                      {projectsToShow.map((project) => {
                        const dayStr = String(day).padStart(2, '0');
                        const val = matrix[`${selectedMonth}-${dayStr}-${project.id}`] || '';
                        return (
                          <td key={project.id} className={`min-h-[4.5rem] border-b border-r border-[#EEEDF5] last:border-r-0 transition-all align-top p-0 ${val ? 'bg-opacity-10' : ''}`} style={{ backgroundColor: val ? `${project.color}15` : 'transparent' }}>
                            <textarea 
                              value={val}
                              placeholder=""
                              onChange={(e) => onCellUpdate(day, project.id, e.target.value)}
                              className={`w-full min-h-[4.5rem] p-3 text-sm bg-transparent text-slate-600 resize-none leading-relaxed hide-scrollbar focus:bg-white/40 transition-colors`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeProjectsCount < 9 && (
        <button onClick={onAddProject} className="fixed bottom-8 right-8 w-14 h-14 bg-[#cbb9d6] text-white rounded-full shadow-lg hover:shadow-xl hover:opacity-90 hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-50 group/fab" title="添加新項目"><Plus size={28} className="group-hover/fab:rotate-90 transition-transform duration-300" /></button>
      )}

      {editingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-sm rounded-[32px] shadow-2xl p-8 space-y-6 border border-slate-50 scale-in-center">
            <div className="flex justify-between items-center">
              <h3 className="serif text-xl font-bold text-slate-700">管理項目</h3>
              <button onClick={() => setEditingProject(null)} className="text-slate-300 hover:text-slate-500"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">項目名稱</label>
                <input type="text" value={editingProject.name} onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-700 focus:ring-2 ring-slate-100 transition-all" />
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center text-xs text-slate-500 space-x-2">
                  <Clock size={14} className="text-slate-300" />
                  <span className="font-medium">開始時間：</span>
                  <span>{getProjectStartDate(editingProject.id) || "尚未開始"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => { onProjectUpdate(editingProject.id, { name: editingProject.name, archived: true }); setEditingProject(null); }} className="flex items-center justify-center space-x-2 bg-slate-50 text-slate-600 py-3 rounded-2xl hover:bg-slate-100 transition-colors"><Archive size={16} /><span className="text-sm font-medium">歸檔</span></button>
                <button onClick={() => { if (confirm("確定要永久刪除此項目及其所有進度嗎？此操作不可撤銷。")) { onDeleteProject(editingProject.id); setEditingProject(null); } }} className="flex items-center justify-center space-x-2 bg-red-50 text-red-400 py-3 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 size={16} /><span className="text-sm font-medium">刪除</span></button>
              </div>
              <button onClick={() => { onProjectUpdate(editingProject.id, { name: editingProject.name }); setEditingProject(null); }} className="w-full bg-slate-700 text-white py-4 rounded-2xl shadow-md hover:bg-slate-800 transition-colors font-bold text-sm">保存修改</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .scale-in-center { animation: scale-in-center 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes scale-in-center { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default MatrixView;
