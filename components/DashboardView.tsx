
import React, { useState } from 'react';
import { Project, MatrixData, Idea } from '../types';
import { CheckCircle2, Lightbulb, Layout, Archive, RotateCcw, Trash2, Clock, X, ChevronRight } from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  matrix: MatrixData;
  ideas: Idea[];
  onProjectUpdate?: (id: number, updates: Partial<Project>) => void;
  onDeleteProject?: (id: number) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ projects, matrix, ideas, onProjectUpdate, onDeleteProject }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  const getProjectStartDate = (pid: number) => {
    const keys = Object.keys(matrix).filter(k => k.endsWith(`-${pid}`) && matrix[k].trim() !== '').sort();
    if (keys.length === 0) return null;
    return keys[0].split('-').slice(0, 3).join('-');
  };

  const truncateText = (text: string, limit: number = 45) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  const getMilestones = (projectId: number) => {
    return Object.entries(matrix)
      .filter(([key, val]) => key.endsWith(`-${projectId}`) && val.trim() !== '')
      .map(([key, val]) => ({
        dateStr: key.split('-').slice(0, 3).join('-'),
        text: val
      }))
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  };

  const renderProjectCard = (project: Project, isArchived: boolean) => {
    const milestones = getMilestones(project.id);
    const relatedIdeas = ideas.filter(idea => idea.projectIds.includes(project.id));
    const startDate = getProjectStartDate(project.id);

    return (
      <div 
        key={project.id} 
        onClick={() => setSelectedProject(project)}
        className={`bg-white rounded-[32px] p-6 shadow-soft border border-slate-50 flex flex-col hover:shadow-lg transition-all duration-500 cursor-pointer group/card ${isArchived ? 'opacity-80' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 truncate">
            <div 
              className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h3 className="text-xl font-bold text-slate-700 serif truncate">{project.name}</h3>
          </div>
          <div className="flex items-center space-x-1">
            {isArchived && onProjectUpdate && (
              <button 
                onClick={(e) => { e.stopPropagation(); onProjectUpdate(project.id, { archived: false }); }}
                className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                title="喚醒記憶"
              >
                <RotateCcw size={18} />
              </button>
            )}
            <div className="p-2 text-slate-200 group-hover/card:text-slate-400 transition-colors">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {/* 歸檔項目時間線 */}
          {isArchived && (
            <div className="bg-slate-50/50 rounded-2xl p-4 space-y-2 border border-slate-50">
              <div className="flex items-center text-sm text-slate-400 space-x-2 font-medium">
                <Clock size={14} />
                <span>起點：{startDate || "尚未落墨"}</span>
              </div>
              {project.archivedAt && (
                <div className="flex items-center text-sm text-slate-400 space-x-2 font-medium">
                  <Clock size={14} className="rotate-180" />
                  <span>終點：{new Date(project.archivedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center">
              <CheckCircle2 size={14} className="mr-1.5" /> 近期的足跡
            </h4>
            {milestones.length > 0 ? (
              <div className="space-y-3">
                {milestones.slice(0, 3).map((m, idx) => (
                  <div key={idx} className="flex items-start space-x-3 group/item">
                    <span className="text-sm text-slate-300 font-mono mt-1 whitespace-nowrap font-medium">
                      {m.dateStr.slice(5)}
                    </span>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                      {truncateText(m.text)}
                    </p>
                  </div>
                ))}
                {milestones.length > 3 && (
                  <p className="text-sm text-slate-300 pl-14 font-medium italic">
                    餘下 {milestones.length - 3} 處留白
                  </p>
                )}
              </div>
            ) : (
              <p className="text-base text-slate-300 italic pl-2">尚未留下足跡...</p>
            )}
          </div>

          <div className="h-px bg-slate-50 w-full" />

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center">
              <Lightbulb size={14} className="mr-1.5" /> 迴盪的餘音
            </h4>
            {relatedIdeas.length > 0 ? (
              <div className="space-y-3">
                <ul className="space-y-2.5">
                  {relatedIdeas.slice(0, 2).map(idea => (
                    <li key={idea.id} className="text-base text-slate-500 bg-slate-50/70 p-3 rounded-2xl border border-slate-100/50 leading-relaxed">
                      {truncateText(idea.text, 60)}
                    </li>
                  ))}
                </ul>
                {relatedIdeas.length > 2 && (
                  <p className="text-sm text-slate-300 font-medium italic">
                    更有 {relatedIdeas.length - 2} 段往日餘溫
                  </p>
                )}
              </div>
            ) : (
              <p className="text-base text-slate-300 italic pl-2">尚無回響...</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto px-6 py-8 hide-scrollbar bg-healing-bg relative">
      {activeProjects.length === 0 && archivedProjects.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-400">
          <Layout size={64} className="mb-4" />
          <p className="serif text-2xl italic tracking-widest">空白的宣紙，正等待第一筆落墨...</p>
        </div>
      ) : (
        <div className="space-y-16 pb-24 max-w-7xl mx-auto">
          {activeProjects.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold flex items-center">
                <Layout size={16} className="mr-2.5" /> 正在書寫的篇章
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeProjects.map(p => renderProjectCard(p, false))}
              </div>
            </section>
          )}

          {archivedProjects.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold flex items-center">
                <Archive size={16} className="mr-2.5" /> 封存在記憶的箋紙
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {archivedProjects.map(p => renderProjectCard(p, true))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* 詳情 Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-md px-4 py-10" onClick={() => setSelectedProject(null)}>
          <div 
            className="bg-white w-full max-w-2xl max-h-full rounded-[48px] shadow-2xl overflow-hidden flex flex-col border border-white animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-10 pb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: selectedProject.color }} />
                <h2 className="serif text-2xl md:text-3xl font-bold text-slate-700">{selectedProject.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-2.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={32} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-10 pb-16 space-y-12 hide-scrollbar">
              {/* 時間資訊 */}
              {selectedProject.archived && (
                <div className="flex items-center space-x-8 text-sm text-slate-400 bg-slate-50/50 p-5 rounded-3xl border border-slate-50 font-medium">
                  <div className="flex items-center space-x-2.5">
                    <Clock size={16} />
                    <span>起筆於：{getProjectStartDate(selectedProject.id) || "尚未落墨"}</span>
                  </div>
                  {selectedProject.archivedAt && (
                    <div className="flex items-center space-x-2.5">
                      <Clock size={16} className="rotate-180" />
                      <span>封存於：{new Date(selectedProject.archivedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 進度列表 */}
              <div className="space-y-8">
                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center">
                  <CheckCircle2 size={16} className="mr-2.5" /> 往日的長流 (Timeline)
                </h3>
                <div className="space-y-6">
                  {getMilestones(selectedProject.id).length > 0 ? (
                    getMilestones(selectedProject.id).map((m, idx) => (
                      <div key={idx} className="flex space-x-6 group">
                        <span className="text-sm font-mono text-slate-300 mt-1.5 whitespace-nowrap font-medium">{m.dateStr}</span>
                        <div className="flex-1 bg-healing-bg p-5 rounded-3xl border border-slate-100 group-hover:border-[#cbb9d6]/30 transition-colors shadow-sm">
                          <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap font-medium">{m.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-base text-slate-300 italic py-6 text-center">尚未寫下任何長箋...</p>
                  )}
                </div>
              </div>

              {/* 靈感列表 */}
              <div className="space-y-8">
                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center">
                  <Lightbulb size={16} className="mr-2.5" /> 採集到的星火 (Inspiration)
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {ideas.filter(i => i.projectIds.includes(selectedProject.id)).length > 0 ? (
                    ideas.filter(i => i.projectIds.includes(selectedProject.id)).map(idea => (
                      <div key={idea.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100/50 shadow-sm">
                        <p className="text-slate-700 text-base leading-relaxed mb-4 font-medium">{idea.text}</p>
                        <span className="text-sm text-slate-300 font-mono font-bold tracking-wider">
                          {new Date(idea.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-base text-slate-300 italic py-6 text-center">暫無採集到星火...</p>
                  )}
                </div>
              </div>
              
              {/* 操作按鈕 */}
              {selectedProject.archived && onDeleteProject && (
                <div className="pt-8 flex justify-center">
                  <button 
                    onClick={() => {
                      if(confirm("確定永久遺忘嗎？此段回憶將不復存在。")) {
                        onDeleteProject(selectedProject.id);
                        setSelectedProject(null);
                      }
                    }}
                    className="flex items-center space-x-2.5 text-red-300 hover:text-red-500 text-sm font-bold transition-colors"
                  >
                    <Trash2 size={18} />
                    <span>永久遺忘此篇章</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
