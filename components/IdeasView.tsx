
import React, { useState, useMemo } from 'react';
import { Project, Idea } from '../types';
import { Plus, Trash2, Send, Tag, Lightbulb, X, EyeOff, Edit3, BookOpen, Check, Search, Filter, Eye, SlidersHorizontal } from 'lucide-react';

interface IdeasViewProps {
  ideas: Idea[];
  projects: Project[];
  onAddIdea: (text: string, projectIds: number[]) => void;
  onUpdateIdea: (id: string, updates: Partial<Idea>) => void;
  onDeleteIdea: (id: string) => void;
}

const IdeasView: React.FC<IdeasViewProps> = ({ ideas, projects, onAddIdea, onUpdateIdea, onDeleteIdea }) => {
  const [inputText, setInputText] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 搜索與篩選狀態
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProjectId, setFilterProjectId] = useState<number | 'all' | 'global'>('all');
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddIdea(inputText, selectedProjectIds);
    setInputText('');
    setSelectedProjectIds([]);
  };

  const toggleProject = (id: number, currentIds: number[], setter: (ids: number[]) => void) => {
    setter(currentIds.includes(id) ? currentIds.filter(pId => pId !== id) : [...currentIds, id]);
  };

  const formatDateTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${YYYY}-${MM}-${DD} ${HH}:${mm}`;
  };

  const handleSaveEdit = () => {
    if (!viewingIdea) return;
    onUpdateIdea(viewingIdea.id, { text: viewingIdea.text, projectIds: viewingIdea.projectIds });
    setIsEditing(false);
  };

  const closeViewer = () => {
    setViewingIdea(null);
    setIsEditing(false);
  };

  // 核心篩選邏輯
  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      // 1. 隱藏狀態篩選
      const matchesHidden = showHiddenOnly ? !!idea.hidden : !idea.hidden;
      if (!matchesHidden) return false;

      // 2. 搜索關鍵字
      const matchesSearch = idea.text.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 3. 項目關聯篩選
      if (filterProjectId === 'all') return true;
      if (filterProjectId === 'global') return idea.projectIds.length === 0;
      return idea.projectIds.includes(filterProjectId);
    });
  }, [ideas, searchQuery, filterProjectId, showHiddenOnly]);

  const hasActiveFilters = searchQuery !== '' || filterProjectId !== 'all' || showHiddenOnly;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-healing-bg">
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 md:p-6 pb-24">
        {/* Input Section */}
        <div className="max-w-3xl w-full mx-auto mb-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-5 md:p-6 shadow-soft space-y-4 border border-slate-50">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="捕捉此刻路過的靈光..."
              className="w-full min-h-[80px] md:min-h-[100px] text-lg bg-transparent resize-none text-slate-700 placeholder:text-slate-200 leading-relaxed"
            />
            <div className="flex flex-col space-y-4 pt-2 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar max-w-[80%] py-1">
                  <button
                    type="button"
                    onClick={() => setSelectedProjectIds([])}
                    className={`text-sm px-3 py-1.5 rounded-full transition-all flex-shrink-0 font-medium ${
                      selectedProjectIds.length === 0 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    曠野
                  </button>
                  {projects.map(p => {
                    const isSelected = selectedProjectIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProject(p.id, selectedProjectIds, setSelectedProjectIds)}
                        className={`text-sm px-3 py-1.5 rounded-full transition-all flex-shrink-0 flex items-center space-x-1 font-medium ${
                          isSelected 
                          ? 'text-white shadow-sm' 
                          : 'bg-slate-50 text-slate-400'
                        }`}
                        style={{ backgroundColor: isSelected ? p.color : '' }}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-200'}`} />
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-slate-700 text-white p-3 rounded-2xl hover:bg-slate-800 disabled:bg-slate-200 transition-all shadow-md flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Weakened Search & Filter Section */}
        <div className="max-w-3xl w-full mx-auto mb-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-300 font-bold">Corridor of Whispers</h2>
            <button 
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              className={`p-2 rounded-xl transition-all ${isControlsOpen || hasActiveFilters ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-400'}`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {isControlsOpen && (
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-5 mb-6 space-y-4 border border-slate-100/50 animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="檢索往日的私語..."
                    className="w-full bg-white/50 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-slate-600 focus:ring-1 ring-slate-100"
                  />
                </div>
                <button
                  onClick={() => setShowHiddenOnly(!showHiddenOnly)}
                  className={`p-2 rounded-xl transition-all flex items-center space-x-2 border ${
                    showHiddenOnly 
                    ? 'bg-slate-700 text-white border-slate-700' 
                    : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  {showHiddenOnly ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span className="text-sm font-bold">深藏</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar py-1">
                <button
                  onClick={() => setFilterProjectId('all')}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-all flex-shrink-0 font-bold tracking-widest ${
                    filterProjectId === 'all' ? 'bg-slate-500 text-white' : 'bg-white text-slate-300 border border-slate-50'
                  }`}
                >
                  眾聲
                </button>
                <button
                  onClick={() => setFilterProjectId('global')}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-all flex-shrink-0 font-bold tracking-widest ${
                    filterProjectId === 'global' ? 'bg-slate-500 text-white' : 'bg-white text-slate-300 border border-slate-50'
                  }`}
                >
                  曠野
                </button>
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFilterProjectId(p.id)}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-all flex-shrink-0 flex items-center space-x-2 border font-medium ${
                      filterProjectId === p.id ? 'text-white border-transparent' : 'bg-white text-slate-300 border-slate-50'
                    }`}
                    style={{ backgroundColor: filterProjectId === p.id ? p.color : '' }}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* List Indicator */}
        {showHiddenOnly && (
          <div className="max-w-3xl w-full mx-auto mb-6 bg-slate-100/50 py-2 px-6 rounded-2xl flex items-center justify-center animate-fade-in">
            <span className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center">
              <EyeOff size={12} className="mr-2" /> 正在閱覽深藏的箋紙
            </span>
          </div>
        )}

        {/* Ideas Grid */}
        <div className="max-w-3xl w-full mx-auto columns-1 md:columns-2 gap-6 px-1">
          {filteredIdeas.map((idea) => {
            const linkedProjects = projects.filter(p => idea.projectIds.includes(p.id));
            return (
              <div 
                key={idea.id} 
                onClick={() => setViewingIdea({ ...idea })}
                className={`break-inside-avoid mb-6 bg-white/70 backdrop-blur-sm rounded-[32px] p-6 shadow-sm border border-slate-100 group hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 cursor-pointer select-none overflow-hidden ${idea.hidden ? 'opacity-60 border-dashed border-slate-200' : ''}`}
              >
                <div className="flex flex-col space-y-1.5 mb-4">
                  <span className="text-sm text-slate-300 font-mono tracking-tighter uppercase font-medium">
                    {formatDateTime(idea.timestamp)}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {linkedProjects.map(p => (
                      <div key={p.id} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} title={p.name} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap line-clamp-6">
                  {idea.text}
                </p>
                <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                   <BookOpen size={16} className="text-slate-200" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-24 opacity-30 select-none">
            {searchQuery ? (
               <div className="space-y-4">
                 <Search size={48} className="mx-auto mb-4" />
                 <p className="text-base italic">未曾發現相符的回音...</p>
               </div>
            ) : (
              <div className="space-y-4">
                <Lightbulb size={48} className="mx-auto mb-4" />
                <p className="text-base italic">思緒如微風，正等待一次駐足...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeless Reader & Editor Modal */}
      {viewingIdea && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onClick={closeViewer}>
          <div className="absolute inset-0 bg-[#FDFCF8]/95 backdrop-blur-md animate-fade-in" />
          
          <div 
            className="bg-[#FCF9F2] w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] flex flex-col border border-white/60 relative overflow-hidden animate-book-open"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Toolbar */}
            <div className="flex-none p-6 md:p-8 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <BookOpen size={20} className="text-slate-200" />
                <span className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-bold">拾光讀本 (The Reader)</span>
              </div>
              <button onClick={closeViewer} className="p-2 text-slate-300 hover:text-slate-500 transition-colors bg-white/50 rounded-full">
                <X size={28} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-8 md:px-20 pb-8">
              {/* Header Meta */}
              <div className="flex flex-col items-center space-y-6 mb-12">
                 <div className="flex flex-wrap justify-center gap-2">
                    {projects.filter(p => viewingIdea.projectIds.includes(p.id)).map(p => (
                      <span key={p.id} className="text-xs px-4 py-1.5 rounded-full text-white font-medium shadow-sm" style={{ backgroundColor: p.color }}>
                        {p.name}
                      </span>
                    ))}
                    {viewingIdea.projectIds.length === 0 && (
                      <span className="text-xs px-4 py-1.5 rounded-full bg-white text-slate-400 font-medium italic border border-slate-50">曠野靈感</span>
                    )}
                 </div>
                 <span className="text-sm text-slate-300 font-mono tracking-[0.3em] uppercase">{formatDateTime(viewingIdea.timestamp)}</span>
                 <div className="w-16 h-px bg-slate-100/50" />
              </div>

              {/* Text Body / Editor */}
              <div className="relative">
                {isEditing ? (
                  <div className="space-y-8 animate-fade-in">
                    <textarea
                      autoFocus
                      value={viewingIdea.text}
                      onChange={(e) => setViewingIdea({ ...viewingIdea, text: e.target.value })}
                      className="w-full min-h-[250px] md:min-h-[350px] text-xl bg-white/60 p-8 rounded-[40px] border-none text-slate-700 focus:ring-2 ring-slate-100 transition-all resize-none serif leading-relaxed shadow-inner"
                    />
                    
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-2">重新關聯記憶</label>
                      <div className="flex flex-wrap gap-2 px-2">
                        {projects.map(p => {
                          const isSelected = viewingIdea.projectIds.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => toggleProject(p.id, viewingIdea.projectIds, (ids) => setViewingIdea({...viewingIdea, projectIds: ids}))}
                              className={`text-sm px-4 py-2.5 rounded-2xl transition-all flex items-center space-x-2 font-medium ${
                                isSelected ? 'text-white shadow-md' : 'bg-white text-slate-300 border border-slate-100 hover:border-slate-200'
                              }`}
                              style={{ backgroundColor: isSelected ? p.color : '' }}
                            >
                              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-100'}`} />
                              <span>{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <button 
                        onClick={handleSaveEdit}
                        className="flex items-center space-x-2 bg-slate-700 text-white px-10 py-4 rounded-full shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                      >
                        <Check size={20} />
                        <span className="font-bold text-base tracking-widest">封存這段流光</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in-up">
                    <div className="serif text-xl md:text-2xl text-slate-600 leading-[2.2] text-left whitespace-pre-wrap max-w-prose mx-auto">
                      {viewingIdea.text}
                    </div>
                    
                    {/* Footnote Decoration */}
                    <div className="mt-16 flex justify-center opacity-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-1.5" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-1.5" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-1.5" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Static Action Footer */}
            {!isEditing && (
              <div className="flex-none p-8 md:p-10 border-t border-slate-100/50 flex items-center justify-center space-x-12 opacity-70 bg-[#FCF9F2]">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <div className="p-2"><Edit3 size={20} /></div>
                  <span className="text-xs font-bold tracking-tighter">修潤</span>
                </button>
                <button 
                  onClick={() => {
                    const isHidden = !viewingIdea.hidden;
                    onUpdateIdea(viewingIdea.id, { hidden: isHidden });
                    closeViewer();
                  }}
                  className={`flex flex-col items-center space-y-1 ${viewingIdea.hidden ? 'text-slate-700' : 'text-slate-400 hover:text-slate-600 transition-colors'}`}
                >
                  <div className="p-2">{viewingIdea.hidden ? <Eye size={20} /> : <EyeOff size={20} />}</div>
                  <span className="text-xs font-bold tracking-tighter">{viewingIdea.hidden ? '重見天日' : '深藏'}</span>
                </button>
                <button 
                  onClick={() => {
                    if (confirm("這段靈感將被永久遺忘？")) {
                      onDeleteIdea(viewingIdea.id);
                      closeViewer();
                    }
                  }}
                  className="flex flex-col items-center space-y-1 text-slate-300 hover:text-red-400 transition-colors"
                >
                  <div className="p-2"><Trash2 size={20} /></div>
                  <span className="text-xs font-bold tracking-tighter">遺忘</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .animate-book-open {
          animation: bookOpen 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.9s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes bookOpen {
          from { opacity: 0; transform: scale(0.94) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .line-clamp-6 {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .max-prose {
          max-width: 65ch;
        }
      `}</style>
    </div>
  );
};

export default IdeasView;
