
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Layout, 
  Lightbulb, 
  Settings, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Scroll,
  Wind
} from 'lucide-react';
import { Project, Idea, MatrixData, Tab, AppState } from './types';
import { DEFAULT_PROJECTS, STORAGE_KEY, MORANDI_COLORS } from './constants';
import MatrixView from './components/MatrixView';
import DashboardView from './components/DashboardView';
import IdeasView from './components/IdeasView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('matrix');
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [matrix, setMatrix] = useState<MatrixData>({});
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        const migratedMatrix: MatrixData = {};
        Object.entries(parsed.matrix || {}).forEach(([key, value]) => {
          if (!key.startsWith('20')) {
            migratedMatrix[`${currentMonthStr}-${key.padStart(2, '0')}`] = value;
          } else {
            migratedMatrix[key] = value;
          }
        });
        
        const migratedIdeas = (parsed.ideas || []).map((idea: any) => {
          if (idea.projectId !== undefined) {
            const { projectId, ...rest } = idea;
            return { ...rest, projectIds: projectId !== null ? [projectId] : [], hidden: false };
          }
          return { ...idea, hidden: !!idea.hidden };
        });

        setProjects(parsed.projects || DEFAULT_PROJECTS);
        setMatrix(migratedMatrix);
        setIdeas(migratedIdeas);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const state: AppState = { projects, matrix, ideas };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [projects, matrix, ideas, isLoaded]);

  const updateProject = (id: number, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const newArchived = updates.archived !== undefined ? updates.archived : p.archived;
        const archivedAt = (newArchived && !p.archived) ? Date.now() : (newArchived ? p.archivedAt : undefined);
        return { ...p, ...updates, archivedAt };
      }
      return p;
    }));
  };

  const addProject = () => {
    const activeProjects = projects.filter(p => !p.archived);
    if (activeProjects.length >= 9) {
      alert("最多只能添加 9 個進行中的項目喔");
      return;
    }
    const newProject: Project = {
      id: Date.now(),
      name: `項目 ${projects.length + 1}`,
      color: MORANDI_COLORS[projects.length % MORANDI_COLORS.length],
      archived: false
    };
    setProjects(prev => [...prev, newProject]);
  };

  const deleteProject = (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const reorderProjects = (draggedId: number, targetId: number) => {
    setProjects(prev => {
      const newProjects = [...prev];
      const draggedIdx = newProjects.findIndex(p => p.id === draggedId);
      const targetIdx = newProjects.findIndex(p => p.id === targetId);
      if (draggedIdx > -1 && targetIdx > -1) {
        const [removed] = newProjects.splice(draggedIdx, 1);
        newProjects.splice(targetIdx, 0, removed);
      }
      return newProjects;
    });
  };

  const updateMatrixCell = (day: number, projectId: number, value: string) => {
    const dayStr = String(day).padStart(2, '0');
    const key = `${selectedMonth}-${dayStr}-${projectId}`;
    setMatrix(prev => ({ ...prev, [key]: value }));
  };

  const addIdea = (text: string, projectIds: number[]) => {
    const newIdea: Idea = {
      id: crypto.randomUUID(),
      text,
      projectIds,
      timestamp: Date.now(),
      hidden: false
    };
    setIdeas(prev => [newIdea, ...prev]);
  };

  const updateIdea = (id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    months.add(currentMonthStr);
    Object.keys(matrix).forEach(key => {
      const monthPart = key.split('-').slice(0, 2).join('-');
      if (monthPart.length === 7) months.add(monthPart);
    });
    return Array.from(months).sort().reverse();
  }, [matrix, currentMonthStr]);

  const importData = (json: string) => {
    try {
      const parsed: AppState = JSON.parse(json);
      setProjects(parsed.projects || DEFAULT_PROJECTS);
      setMatrix(parsed.matrix || {});
      setIdeas(parsed.ideas || []);
      alert("數據導入成功");
    } catch (e) {
      alert("無效的 JSON 格式");
    }
  };

  const exportData = () => {
    const state: AppState = { projects, matrix, ideas };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `拾光長箋_備份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden text-slate-800">
      <header className="flex-none px-6 pt-8 pb-4 bg-healing-bg border-b border-slate-100 flex items-center justify-between z-50">
        <div>
          <h1 className="serif text-3xl font-bold tracking-wider text-slate-700">拾光長箋</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-medium">Timeless Epistles · Capture the Micro-light</p>
        </div>
        <nav className="flex items-center space-x-1 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl shadow-soft">
          <TabButton active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} icon={<Calendar size={18} />} label="拾光矩陣" />
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Scroll size={18} />} label="歲月長卷" />
          <TabButton active={activeTab === 'ideas'} onClick={() => setActiveTab('ideas')} icon={<Sparkles size={18} />} label="靈光碎影" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Wind size={18} />} label="設置" />
        </nav>
      </header>
      <main className="flex-1 overflow-hidden relative bg-healing-bg">
        {activeTab === 'matrix' && (
          <MatrixView 
            projects={projects} 
            matrix={matrix} 
            selectedMonth={selectedMonth}
            availableMonths={availableMonths}
            onMonthChange={setSelectedMonth}
            onCellUpdate={updateMatrixCell} 
            onProjectUpdate={updateProject} 
            onAddProject={addProject}
            onDeleteProject={deleteProject}
            onReorder={reorderProjects}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardView 
            projects={projects} 
            matrix={matrix} 
            ideas={ideas.filter(i => !i.hidden)} 
            onProjectUpdate={updateProject} 
            onDeleteProject={deleteProject} 
          />
        )}
        {activeTab === 'ideas' && (
          <IdeasView 
            ideas={ideas} 
            projects={projects.filter(p => !p.archived)} 
            onAddIdea={addIdea} 
            onUpdateIdea={updateIdea}
            onDeleteIdea={deleteIdea} 
          />
        )}
        {activeTab === 'settings' && <SettingsView onImport={importData} onExport={exportData} />}
      </main>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${active ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
    {icon}
    <span className="text-sm font-medium hidden md:inline">{label}</span>
  </button>
);

export default App;
