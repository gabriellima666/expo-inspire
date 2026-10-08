import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, FileSpreadsheet, FileJson, FileText, Copy, 
  Trash2, Filter, Search, ArrowLeft, Database, Award, 
  Trophy, Star, Users, CheckCircle2, ChevronDown, ChevronUp, Layers,
  Plus, Edit3, Save, X, RotateCcw, AlertTriangle, Sparkles
} from 'lucide-react';
import { RUBRIC_CRITERIA } from '../data/mockData';
import { exportToCSV, exportToJSON, exportToTXT, generateCSVContent } from '../utils/exporter';
import { clearEvaluations } from '../utils/storage';
import { getAxes, saveAxes, resetAxesToDefault } from '../utils/axesStorage';

export default function AdminPage({ evaluations, axesList: externalAxesList, onRefreshData, onBackToForm, onLogoutAdmin }) {
  // Navigation Tabs: 'dashboard' | 'axes' (persisted in sessionStorage)
  const [activeTab, setActiveTabState] = useState(() => {
    return sessionStorage.getItem('admin_active_tab') || 'dashboard';
  });

  const setActiveTab = (tab) => {
    sessionStorage.setItem('admin_active_tab', tab);
    setActiveTabState(tab);
  };

  // Axes and Groups state
  const [axesList, setAxesList] = useState(() => (externalAxesList && externalAxesList.length > 0) ? externalAxesList : getAxes());

  // Keep axes synced if externalAxesList or getAxes updates
  useEffect(() => {
    if (externalAxesList && Array.isArray(externalAxesList) && externalAxesList.length > 0) {
      setAxesList(externalAxesList);
    } else {
      setAxesList(getAxes());
    }
  }, [externalAxesList, activeTab]);
  
  // Modal / Form states for Axis Editing & Group Editing
  const [editingAxis, setEditingAxis] = useState(null);
  const [isCreatingAxis, setIsCreatingAxis] = useState(false);
  const [newAxisName, setNewAxisName] = useState('');
  const [newAxisDesc, setNewAxisDesc] = useState('');

  const [editingGroup, setEditingGroup] = useState(null);
  const [creatingGroupAxisId, setCreatingGroupAxisId] = useState(null);
  const [newGroupCode, setNewGroupCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Dashboard Filters
  const [filterAxisId, setFilterAxisId] = useState('');
  const [filterGroupId, setFilterGroupId] = useState('');
  const [searchEvaluator, setSearchEvaluator] = useState('');
  
  // UI feedback states
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [adminFeedbackMessage, setAdminFeedbackMessage] = useState('');

  // Save axes change helper
  const handlePersistAxes = (updatedList, msg = 'Alterações salvas com sucesso!') => {
    setAxesList(updatedList);
    saveAxes(updatedList);
    if (onRefreshData) onRefreshData();
    setAdminFeedbackMessage(msg);
    setTimeout(() => setAdminFeedbackMessage(''), 3500);
  };

  // --- AXIS ACTIONS ---
  const handleSaveNewAxis = (e) => {
    e.preventDefault();
    if (!newAxisName.trim()) return;

    const newId = 'eixo-' + Date.now();
    const newAxisObj = {
      id: newId,
      name: newAxisName.trim(),
      description: newAxisDesc.trim(),
      groups: []
    };

    const updated = [...axesList, newAxisObj];
    handlePersistAxes(updated, 'Novo eixo temático criado!');
    setIsCreatingAxis(false);
    setNewAxisName('');
    setNewAxisDesc('');
  };

  const handleUpdateAxis = (e) => {
    e.preventDefault();
    if (!editingAxis || !editingAxis.name.trim()) return;

    const updated = axesList.map(axis => {
      if (axis.id === editingAxis.id) {
        return {
          ...axis,
          name: editingAxis.name.trim(),
          description: editingAxis.description.trim()
        };
      }
      return axis;
    });

    handlePersistAxes(updated, 'Eixo atualizado com sucesso!');
    setEditingAxis(null);
  };

  const confirmDeleteAxis = (axisId) => {
    const axis = axesList.find(a => a.id === axisId);
    setDeleteTarget({
      type: 'axis',
      axisId: axisId,
      title: `Eixo "${axis?.name || ''}" e todos os seus grupos`
    });
  };

  // --- GROUP ACTIONS ---
  const handleSaveNewGroup = (e) => {
    e.preventDefault();
    if (!creatingGroupAxisId || !newGroupName.trim()) return;

    const targetAxis = axesList.find(a => a.id === creatingGroupAxisId);
    if (!targetAxis) return;

    const newId = 'g' + Date.now().toString().slice(-4);
    const code = newGroupCode.trim() || `GRUPO ${targetAxis.groups.length + 101}`;

    const newGroupObj = {
      id: newId,
      code: code,
      name: newGroupName.trim()
    };

    const updated = axesList.map(axis => {
      if (axis.id === creatingGroupAxisId) {
        return {
          ...axis,
          groups: [...axis.groups, newGroupObj]
        };
      }
      return axis;
    });

    handlePersistAxes(updated, 'Novo grupo adicionado!');
    setCreatingGroupAxisId(null);
    setNewGroupCode('');
    setNewGroupName('');
  };

  const handleUpdateGroup = (e) => {
    e.preventDefault();
    if (!editingGroup || !editingGroup.name.trim()) return;

    const updated = axesList.map(axis => {
      if (axis.id === editingGroup.axisId) {
        return {
          ...axis,
          groups: axis.groups.map(g => {
            if (g.id === editingGroup.groupId) {
              return {
                ...g,
                code: editingGroup.code.trim() || g.code,
                name: editingGroup.name.trim()
              };
            }
            return g;
          })
        };
      }
      return axis;
    });

    handlePersistAxes(updated, 'Grupo atualizado!');
    setEditingGroup(null);
  };

  const confirmDeleteGroup = (axisId, groupId) => {
    const axis = axesList.find(a => a.id === axisId);
    const group = axis?.groups.find(g => g.id === groupId);
    setDeleteTarget({
      type: 'group',
      axisId: axisId,
      groupId: groupId,
      title: `Grupo "${group?.code || ''} - ${group?.name || ''}"`
    });
  };

  // --- EXECUTE CONFIRMED DELETE ---
  const executeConfirmedDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'axis') {
      const updated = axesList.filter(a => a.id !== deleteTarget.axisId);
      handlePersistAxes(updated, 'Eixo excluído com sucesso!');
    } else if (deleteTarget.type === 'group') {
      const updated = axesList.map(axis => {
        if (axis.id === deleteTarget.axisId) {
          return {
            ...axis,
            groups: axis.groups.filter(g => g.id !== deleteTarget.groupId)
          };
        }
        return axis;
      });
      handlePersistAxes(updated, 'Grupo excluído com sucesso!');
    } else if (deleteTarget.type === 'all_evals') {
      clearEvaluations();
      if (onRefreshData) onRefreshData();
      setAdminFeedbackMessage('Todas as avaliações foram limpas do banco de dados.');
      setTimeout(() => setAdminFeedbackMessage(''), 3500);
    }

    setDeleteTarget(null);
  };

  const handleResetAxes = () => {
    const def = resetAxesToDefault();
    setAxesList(def);
    if (onRefreshData) onRefreshData();
    setAdminFeedbackMessage('Estrutura padrão de eixos restaurada!');
    setTimeout(() => setAdminFeedbackMessage(''), 3500);
  };

  // Filter options
  const selectedAxis = axesList.find(a => a.id === filterAxisId);
  const availableGroups = useMemo(() => {
    if (selectedAxis) return selectedAxis.groups;
    return axesList.flatMap(a => a.groups);
  }, [selectedAxis, axesList]);

  // Filter logic
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(item => {
      if (filterAxisId && item.axisId !== filterAxisId) return false;

      if (filterGroupId) {
        const hasGroup = item.groupEvaluations && Boolean(item.groupEvaluations[filterGroupId]);
        if (!hasGroup) return false;
      }

      if (searchEvaluator.trim()) {
        const searchLower = searchEvaluator.toLowerCase();
        const evaluatorMatch = item.evaluatorName.toLowerCase().includes(searchLower);
        const groupMatch = Object.values(item.groupEvaluations || {}).some(g => 
          g.groupName?.toLowerCase().includes(searchLower) || g.groupCode?.toLowerCase().includes(searchLower)
        );
        if (!evaluatorMatch && !groupMatch) return false;
      }

      return true;
    });
  }, [evaluations, filterAxisId, filterGroupId, searchEvaluator]);

  const totalCount = filteredEvaluations.length;
  
  const avgOverallRating = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = filteredEvaluations.reduce((acc, curr) => acc + (Number(curr.overallRating) || 0), 0);
    return (sum / totalCount).toFixed(1);
  }, [filteredEvaluations, totalCount]);

  const highlightGroupStats = useMemo(() => {
    const stats = {};
    filteredEvaluations.forEach(item => {
      if (item.highlightGroupName) {
        stats[item.highlightGroupName] = (stats[item.highlightGroupName] || 0) + 1;
      }
    });
    let topGroup = 'Nenhum';
    let maxCount = 0;
    Object.entries(stats).forEach(([name, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        topGroup = name;
      }
    });
    return { topGroup, maxCount };
  }, [filteredEvaluations]);

  const rubricStats = useMemo(() => {
    const breakdown = {
      comunicacao: { Excelente: 0, 'Muito Bom': 0, Bom: 0, 'A melhorar': 0, total: 0 },
      dominio: { Excelente: 0, 'Muito Bom': 0, Bom: 0, 'A melhorar': 0, total: 0 },
      semiotica: { Excelente: 0, 'Muito Bom': 0, Bom: 0, 'A melhorar': 0, total: 0 },
      postura: { Excelente: 0, 'Muito Bom': 0, Bom: 0, 'A melhorar': 0, total: 0 }
    };

    filteredEvaluations.forEach(item => {
      if (item.groupEvaluations) {
        Object.values(item.groupEvaluations).forEach(group => {
          if (filterGroupId && group.groupId !== filterGroupId) return;

          const rubric = group.rubric || {};
          RUBRIC_CRITERIA.forEach(crit => {
            const rawVal = rubric[crit.id];
            if (rawVal) {
              let ratingKey = 'Bom';
              if (rawVal.includes('Excelente')) ratingKey = 'Excelente';
              else if (rawVal.includes('Muito Bom')) ratingKey = 'Muito Bom';
              else if (rawVal.includes('Bom')) ratingKey = 'Bom';
              else if (rawVal.includes('melhorar')) ratingKey = 'A melhorar';

              if (breakdown[crit.id][ratingKey] !== undefined) {
                breakdown[crit.id][ratingKey] += 1;
                breakdown[crit.id].total += 1;
              }
            }
          });
        });
      }
    });

    return breakdown;
  }, [filteredEvaluations, filterGroupId]);

  // Export handlers
  const handleExportCSV = () => {
    const success = exportToCSV(filteredEvaluations);
    if (success) {
      setDownloadSuccess('Arquivo CSV baixado com sucesso!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    }
  };

  const handleExportJSON = () => {
    const success = exportToJSON(filteredEvaluations);
    if (success) {
      setDownloadSuccess('Arquivo JSON baixado com sucesso!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    }
  };

  const handleExportTXT = () => {
    const success = exportToTXT(filteredEvaluations);
    if (success) {
      setDownloadSuccess('Relatório TXT baixado com sucesso!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    }
  };

  const handleCopyClipboard = () => {
    const csvContent = generateCSVContent(filteredEvaluations);
    if (csvContent) {
      navigator.clipboard.writeText(csvContent).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 4000);
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between pb-16 animate-fade-in relative">
      
      {/* Admin Top Navigation */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b-2 border-[#c1d117]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#806fb0] flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5 text-[#c1d117]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  Painel Administrador
                </h1>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-[#c1d117] text-slate-900">
                  Expo Inspire
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instituto Cacau Show
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onBackToForm}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#c1d117]" />
              <span>Voltar ao Formulário</span>
            </button>
            <button
              type="button"
              onClick={onLogoutAdmin}
              className="px-3 py-2 bg-slate-800 hover:bg-rose-900/80 text-rose-300 rounded-xl font-semibold text-xs transition-all cursor-pointer"
            >
              Sair
            </button>
          </div>

        </div>

        {/* ADMIN MODE NAVIGATION TABS */}
        <div className="bg-slate-800 border-t border-slate-700/80">
          <div className="max-w-6xl mx-auto px-4 flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-[#c1d117] text-[#c1d117] bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Dashboard & Relatórios ({evaluations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('axes')}
              className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'axes'
                  ? 'border-[#c1d117] text-[#c1d117] bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Gestão de Eixos e Grupos ({axesList.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 w-full space-y-6">
        
        {/* Global Feedback Banner */}
        {adminFeedbackMessage && (
          <div className="bg-emerald-600 text-white p-3.5 px-4 rounded-2xl shadow-md text-xs font-bold flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#c1d117] shrink-0" />
            <span>{adminFeedbackMessage}</span>
          </div>
        )}

        {/* TAB 1: DASHBOARD & RELATÓRIOS */}
        {activeTab === 'dashboard' && (
          <>
            {/* FILTERS & SEARCH SECTION */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Filter className="w-4 h-4 text-[#806fb0]" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Filtros do Dashboard e Tabela
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Eixo Temático
                  </label>
                  <select
                    value={filterAxisId}
                    onChange={(e) => {
                      setFilterAxisId(e.target.value);
                      setFilterGroupId('');
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#806fb0] outline-none cursor-pointer"
                  >
                    <option value="">-- Todos os Eixos ({axesList.length}) --</option>
                    {axesList.map(axis => (
                      <option key={axis.id} value={axis.id}>
                        {axis.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Grupo Específico
                  </label>
                  <select
                    value={filterGroupId}
                    onChange={(e) => setFilterGroupId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#806fb0] outline-none cursor-pointer"
                  >
                    <option value="">-- Todos os Grupos ({availableGroups.length}) --</option>
                    {availableGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.code} — {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Buscar por Avaliador ou Grupo
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchEvaluator}
                      onChange={(e) => setSearchEvaluator(e.target.value)}
                      placeholder="Ex: Carlos Eduardo..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#806fb0] outline-none"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* SUMMARY KPI CARDS */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Avaliações</span>
                  <Users className="w-4 h-4 text-[#806fb0]" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {totalCount}
                </div>
                <p className="text-[10px] text-slate-500">
                  {totalCount === evaluations.length ? 'Todas as submissões' : `Filtradas de ${evaluations.length}`}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Média Evento</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-[#806fb0]">
                  {avgOverallRating} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Nota média geral do evento
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Grupo Destaque</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xs font-bold text-slate-900 truncate" title={highlightGroupStats.topGroup}>
                  {highlightGroupStats.topGroup}
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  {highlightGroupStats.maxCount > 0 ? `${highlightGroupStats.maxCount} voto(s) eleito` : 'Sem votos'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Eixos Cadastrados</span>
                  <Layers className="w-4 h-4 text-[#806fb0]" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {axesList.length} <span className="text-xs text-slate-400 font-normal">eixo(s)</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {axesList.reduce((acc, a) => acc + a.groups.length, 0)} grupos no total
                </p>
              </div>

            </section>

            {/* MULTI-FORMAT EXPORT BAR */}
            <section className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold flex items-center space-x-2">
                    <Download className="w-4 h-4 text-[#c1d117]" />
                    <span>Exportar Dados no Formato Desejado</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Baixe as respostas filtradas em CSV, JSON, TXT ou copie direto para o Excel.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={totalCount === 0}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active-press"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Baixar CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    disabled={totalCount === 0}
                    className="px-3.5 py-2 rounded-xl bg-[#806fb0] hover:bg-[#685796] disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active-press"
                  >
                    <FileJson className="w-4 h-4 text-[#c1d117]" />
                    <span>Baixar JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportTXT}
                    disabled={totalCount === 0}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 transition-all border border-slate-700 cursor-pointer active-press"
                  >
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Baixar TXT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyClipboard}
                    disabled={totalCount === 0}
                    className="px-3.5 py-2 rounded-xl bg-[#c1d117] hover:bg-[#a8b712] disabled:opacity-50 text-slate-900 font-extrabold text-xs flex items-center space-x-1.5 transition-all cursor-pointer active-press"
                  >
                    <Copy className="w-4 h-4 text-slate-900" />
                    <span>Copiar CSV</span>
                  </button>
                </div>
              </div>

              {downloadSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{downloadSuccess}</span>
                </div>
              )}

              {copySuccess && (
                <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dados copiados para a área de transferência! Pressione Ctrl+V no Excel ou Google Sheets.</span>
                </div>
              )}
            </section>

            {/* RUBRIC BREAKDOWN VISUAL STATS */}
            <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Award className="w-4 h-4 text-[#806fb0]" />
                <span>Desempenho Geral das Rubricas (% por Critério)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RUBRIC_CRITERIA.map(criterion => {
                  const stat = rubricStats[criterion.id] || { Excelente: 0, 'Muito Bom': 0, Bom: 0, 'A melhorar': 0, total: 0 };
                  const t = stat.total || 1;

                  const pctExc = Math.round((stat.Excelente / t) * 100);
                  const pctMBom = Math.round((stat['Muito Bom'] / t) * 100);
                  const pctBom = Math.round((stat.Bom / t) * 100);
                  const pctMelhor = Math.round((stat['A melhorar'] / t) * 100);

                  return (
                    <div key={criterion.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{criterion.label}</span>
                        <span className="text-[10px] font-semibold text-slate-500">{stat.total} respostas</span>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span className="font-semibold text-emerald-700">Excelente ({stat.Excelente})</span>
                            <span className="font-bold">{pctExc}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${pctExc}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span className="font-semibold text-blue-700">Muito Bom ({stat['Muito Bom']})</span>
                            <span className="font-bold">{pctMBom}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#806fb0] h-full rounded-full transition-all duration-500" style={{ width: `${pctMBom}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span className="font-semibold text-amber-700">Bom ({stat.Bom})</span>
                            <span className="font-bold">{pctBom}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctBom}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span className="font-semibold text-rose-700">A melhorar ({stat['A melhorar']})</span>
                            <span className="font-bold">{pctMelhor}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctMelhor}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* DETAILED RESPONSES TABLE */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Tabela de Respostas ({filteredEvaluations.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lista detalhada de todas as submissões registradas
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteTarget({ type: 'all_evals', title: 'Todas as avaliações do banco de dados' })}
                  disabled={evaluations.length === 0}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Banco de Dados</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Avaliador</th>
                      <th className="py-3 px-4">Data / Hora</th>
                      <th className="py-3 px-4">Eixo</th>
                      <th className="py-3 px-4">Grupos Avaliados</th>
                      <th className="py-3 px-4 text-center">Nota Evento</th>
                      <th className="py-3 px-4">Grupo Destaque</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredEvaluations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400">
                          Nenhuma avaliação encontrada com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredEvaluations.map((item) => {
                        const isExpanded = expandedId === item.id;
                        const groupCount = item.groupEvaluations ? Object.keys(item.groupEvaluations).length : 0;

                        return (
                          <React.Fragment key={item.id}>
                            <tr className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900">
                                {item.evaluatorName}
                              </td>
                              <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                {new Date(item.timestamp).toLocaleString('pt-BR')}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-700">
                                {item.axisName}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-purple-50 text-[#806fb0] font-bold text-[11px]">
                                  {groupCount} grupo(s)
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-extrabold text-amber-600">
                                ★ {item.overallRating} / 5
                              </td>
                              <td className="py-3 px-4 font-bold text-indigo-700 truncate max-w-[200px]">
                                🏆 {item.highlightGroupName || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>{isExpanded ? 'Ocultar' : 'Detalhes'}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-purple-50/30">
                                <td colSpan={7} className="p-4 border-b border-slate-200">
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                                    <h4 className="text-xs font-bold text-[#806fb0] uppercase tracking-wider">
                                      Detalhamento da Avaliação por Grupo
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {Object.values(item.groupEvaluations || {}).map((g, gIdx) => (
                                        <div key={gIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                                          <div className="font-extrabold text-slate-900">
                                            {g.groupCode} — {g.groupName}
                                          </div>
                                          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                                            {Object.entries(g.rubric || {}).map(([cKey, cVal]) => (
                                              <div key={cKey}>
                                                <span className="capitalize text-slate-400">{cKey}:</span>{' '}
                                                <span className="font-bold text-slate-800">{cVal}</span>
                                              </div>
                                            ))}
                                          </div>
                                          {g.observation && (
                                            <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200 mt-1">
                                              "{g.observation}"
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* TAB 2: GESTÃO DE EIXOS E GRUPOS */}
        {activeTab === 'axes' && (
          <div className="space-y-6">
            
            {/* Header Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[#806fb0]" />
                  <span>Gerenciador de Eixos Temáticos e Grupos</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adicione, edite ou remova os eixos e grupos que aparecem no formulário do avaliador
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetAxes}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Voltar aos eixos padrão mockados"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Restaurar Padrões</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreatingAxis(true)}
                  className="px-4 py-2 bg-[#806fb0] hover:bg-[#685796] text-white rounded-xl font-extrabold text-xs transition-all flex items-center space-x-1.5 shadow-sm active-press cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#c1d117]" />
                  <span>Novo Eixo Temático</span>
                </button>
              </div>
            </div>

            {/* FORM: Criar Novo Eixo */}
            {isCreatingAxis && (
              <form onSubmit={handleSaveNewAxis} className="bg-purple-50/70 rounded-2xl p-5 border border-purple-200 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                  <h3 className="text-sm font-bold text-[#806fb0] flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#c1d117]" />
                    <span>Cadastrar Novo Eixo Temático</span>
                  </h3>
                  <button type="button" onClick={() => setIsCreatingAxis(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome do Eixo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAxisName}
                      onChange={(e) => setNewAxisName(e.target.value)}
                      placeholder="Ex: Empreendedorismo e Negócios"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#806fb0] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descrição Resumida
                    </label>
                    <input
                      type="text"
                      value={newAxisDesc}
                      onChange={(e) => setNewAxisDesc(e.target.value)}
                      placeholder="Ex: Projetos focados em novos modelos de mercado..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#806fb0] outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingAxis(false)}
                    className="px-3 py-2 bg-white text-slate-600 rounded-xl text-xs font-bold border border-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#806fb0] hover:bg-[#685796] text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5 text-[#c1d117]" />
                    <span>Salvar Eixo</span>
                  </button>
                </div>
              </form>
            )}

            {/* LIST OF AXES & THEIR GROUPS */}
            <div className="space-y-4">
              {axesList.map((axis) => {
                const isEditingThisAxis = editingAxis && editingAxis.id === axis.id;

                return (
                  <div key={axis.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden animate-fade-in">
                    
                    {/* Axis Header */}
                    <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {isEditingThisAxis ? (
                        <form onSubmit={handleUpdateAxis} className="flex-1 space-y-3 w-full">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={editingAxis.name}
                              onChange={(e) => setEditingAxis({ ...editingAxis, name: e.target.value })}
                              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={editingAxis.description}
                              onChange={(e) => setEditingAxis({ ...editingAxis, description: e.target.value })}
                              placeholder="Descrição..."
                              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button type="submit" className="px-3 py-1.5 bg-[#806fb0] text-white rounded-lg text-xs font-bold flex items-center space-x-1">
                              <Save className="w-3 h-3 text-[#c1d117]" />
                              <span>Salvar</span>
                            </button>
                            <button type="button" onClick={() => setEditingAxis(null)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">
                              Cancelar
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {axis.name}
                            </h3>
                            <span className="bg-purple-100 text-[#806fb0] font-bold text-[11px] px-2 py-0.5 rounded-full border border-purple-200">
                              {axis.groups.length} grupos
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {axis.description || 'Sem descrição cadastrada.'}
                          </p>
                        </div>
                      )}

                      {!isEditingThisAxis && (
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setEditingAxis({ id: axis.id, name: axis.name, description: axis.description || '' })}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#806fb0]" />
                            <span>Editar Eixo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmDeleteAxis(axis.id)}
                            className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir Eixo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCreatingGroupAxisId(axis.id);
                              setNewGroupCode(`GRUPO ${axis.groups.length + 101}`);
                              setNewGroupName('');
                            }}
                            className="px-3 py-1.5 bg-[#c1d117] hover:bg-[#a8b712] text-slate-900 rounded-xl text-xs font-extrabold flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-900" />
                            <span>+ Novo Grupo</span>
                          </button>
                        </div>
                      )}

                    </div>

                    {/* FORM: Add New Group */}
                    {creatingGroupAxisId === axis.id && (
                      <form onSubmit={handleSaveNewGroup} className="p-4 bg-emerald-50/70 border-b border-emerald-200 space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            Adicionar Grupo ao Eixo: {axis.name}
                          </span>
                          <button type="button" onClick={() => setCreatingGroupAxisId(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Código do Grupo</label>
                            <input
                              type="text"
                              value={newGroupCode}
                              onChange={(e) => setNewGroupCode(e.target.value)}
                              placeholder="Ex: GRUPO 104"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome / Projeto do Grupo <span className="text-rose-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={newGroupName}
                              onChange={(e) => setNewGroupName(e.target.value)}
                              placeholder="Ex: InovaEdu - Plataforma de Tutoria Virtual"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <button type="button" onClick={() => setCreatingGroupAxisId(null)} className="px-3 py-1.5 bg-white text-slate-600 rounded-xl text-xs font-bold border border-slate-200">
                            Cancelar
                          </button>
                          <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1">
                            <Save className="w-3.5 h-3.5" />
                            <span>Salvar Grupo</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* List of Groups inside Axis */}
                    <div className="p-4 sm:p-5">
                      {axis.groups.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic">
                          Nenhum grupo cadastrado neste eixo. Clique em "+ Novo Grupo" para adicionar.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {axis.groups.map(group => {
                            const isEditingThisGroup = editingGroup && editingGroup.groupId === group.id;

                            if (isEditingThisGroup) {
                              return (
                                <form key={group.id} onSubmit={handleUpdateGroup} className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2 col-span-1 md:col-span-2">
                                  <span className="text-[11px] font-bold text-amber-900">Editar Grupo</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input
                                      type="text"
                                      value={editingGroup.code}
                                      onChange={(e) => setEditingGroup({ ...editingGroup, code: e.target.value })}
                                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                                    />
                                    <input
                                      type="text"
                                      required
                                      value={editingGroup.name}
                                      onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                                      className="sm:col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={() => setEditingGroup(null)} className="px-3 py-1 bg-white text-slate-600 rounded-lg text-xs font-bold border">
                                      Cancelar
                                    </button>
                                    <button type="submit" className="px-3 py-1 bg-[#806fb0] text-white rounded-lg text-xs font-bold flex items-center space-x-1">
                                      <Save className="w-3 h-3 text-[#c1d117]" />
                                      <span>Atualizar</span>
                                    </button>
                                  </div>
                                </form>
                              );
                            }

                            return (
                              <div key={group.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-slate-100/70 transition-colors">
                                <div className="space-y-0.5 min-w-0">
                                  <span className="inline-block px-2 py-0.2 bg-slate-900 text-white font-extrabold text-[10px] rounded">
                                    {group.code}
                                  </span>
                                  <div className="text-xs font-bold text-slate-800 truncate" title={group.name}>
                                    {group.name}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingGroup({ axisId: axis.id, groupId: group.id, code: group.code, name: group.name })}
                                    className="p-1.5 text-slate-500 hover:text-[#806fb0] hover:bg-white rounded-lg transition-colors cursor-pointer"
                                    title="Editar grupo"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => confirmDeleteGroup(axis.id, group.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                    title="Excluir grupo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* CUSTOM CONFIRMATION MODAL FOR DELETIONS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Confirmar Exclusão
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tem certeza que deseja excluir o item <span className="font-bold text-slate-900">{deleteTarget.title}</span>?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeConfirmedDelete}
                className="w-1/2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
