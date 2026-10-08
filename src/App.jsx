import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InitialDataForm from './components/InitialDataForm';
import GroupRubricCard from './components/GroupRubricCard';
import FinalizingForm from './components/FinalizingForm';
import SuccessModal from './components/SuccessModal';
import AdminAuthModal from './components/AdminAuthModal';
import AdminPage from './pages/AdminPage';

import { RUBRIC_CRITERIA } from './data/mockData';
import { getEvaluations, saveEvaluation, fetchEvaluationsFromServer } from './utils/storage';
import { getAxes, fetchAxesFromServer } from './utils/axesStorage';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [isAdminMode, setIsAdminModeState] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });

  const [viewMode, setViewModeState] = useState(() => {
    return sessionStorage.getItem('admin_view_mode') || 'evaluator';
  });

  const setIsAdminMode = (status) => {
    if (status) {
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      sessionStorage.removeItem('admin_authenticated');
    }
    setIsAdminModeState(status);
  };

  const setViewMode = (mode) => {
    sessionStorage.setItem('admin_view_mode', mode);
    setViewModeState(mode);
  };

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [axesList, setAxesList] = useState(() => getAxes());

  // Evaluator Form States
  const [evaluatorName, setEvaluatorName] = useState('');
  const [selectedAxisId, setSelectedAxisId] = useState('');
  const [groupEvaluations, setGroupEvaluations] = useState({});
  const [overallRating, setOverallRating] = useState(0);
  const [highlightGroupId, setHighlightGroupId] = useState('');

  // UI & Storage States
  const [evaluationsList, setEvaluationsList] = useState([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Sync data with Server on Mount and Polling every 4 seconds
  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, 4000);
    return () => clearInterval(interval);
  }, [viewMode]);

  const syncWithServer = async () => {
    // 1. Sync evaluations from server
    const serverEvals = await fetchEvaluationsFromServer();
    setEvaluationsList(serverEvals);

    // 2. Sync axes & groups from server
    const serverAxes = await fetchAxesFromServer();
    setAxesList(serverAxes);
  };

  const selectedAxis = axesList.find((axis) => axis.id === selectedAxisId);
  const currentGroups = selectedAxis ? selectedAxis.groups : [];

  const handleUpdateRubric = (groupId, criterionId, ratingValue) => {
    const targetGroup = currentGroups.find(g => g.id === groupId);
    if (!targetGroup) return;

    setGroupEvaluations((prev) => {
      const existing = prev[groupId] || {
        groupCode: targetGroup.code,
        groupName: targetGroup.name,
        rubric: {},
        observation: ''
      };

      return {
        ...prev,
        [groupId]: {
          ...existing,
          rubric: {
            ...existing.rubric,
            [criterionId]: ratingValue
          }
        }
      };
    });
  };

  const handleUpdateObservation = (groupId, text) => {
    const targetGroup = currentGroups.find(g => g.id === groupId);
    if (!targetGroup) return;

    setGroupEvaluations((prev) => {
      const existing = prev[groupId] || {
        groupCode: targetGroup.code,
        groupName: targetGroup.name,
        rubric: {},
        observation: ''
      };

      return {
        ...prev,
        [groupId]: {
          ...existing,
          observation: text
        }
      };
    });
  };

  const checkFormValidity = () => {
    if (!evaluatorName.trim()) return false;
    if (!selectedAxisId || currentGroups.length === 0) return false;
    if (overallRating === 0) return false;
    if (!highlightGroupId) return false;

    for (const group of currentGroups) {
      const groupData = groupEvaluations[group.id];
      if (!groupData || !groupData.rubric) return false;

      for (const criterion of RUBRIC_CRITERIA) {
        if (!groupData.rubric[criterion.id]) return false;
      }
    }

    return true;
  };

  const isFormValid = checkFormValidity();

  const handleResetForm = () => {
    setEvaluatorName('');
    setSelectedAxisId('');
    setGroupEvaluations({});
    setOverallRating(0);
    setHighlightGroupId('');
    setIsSuccessOpen(false);
  };

  const handleSubmitEvaluation = async (e) => {
    if (e) e.preventDefault();

    if (!isFormValid) {
      alert('Por favor, preencha todos os campos obrigatórios e avalie todas as rubricas dos grupos.');
      return;
    }

    const selectedHighlightGroup = currentGroups.find(g => g.id === highlightGroupId);

    const evaluationPayload = {
      evaluatorName: evaluatorName.trim(),
      axisId: selectedAxis.id,
      axisName: selectedAxis.name,
      groupEvaluations: groupEvaluations,
      overallRating: overallRating,
      highlightGroupId: highlightGroupId,
      highlightGroupName: selectedHighlightGroup ? `${selectedHighlightGroup.code} - ${selectedHighlightGroup.name}` : ''
    };

    try {
      await saveEvaluation(evaluationPayload);
      await syncWithServer();
      setIsSuccessOpen(true);
    } catch (err) {
      alert('Ocorreu um erro ao salvar a avaliação.');
    }
  };

  const handleAdminAuthenticate = () => {
    setIsAuthOpen(false);
    setIsAdminMode(true);
    setViewMode('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    setViewMode('evaluator');
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_view_mode');
    sessionStorage.removeItem('admin_active_tab');
  };

  // RENDER ADMIN DASHBOARD PAGE
  if (viewMode === 'admin' && isAdminMode) {
    return (
      <AdminPage
        evaluations={evaluationsList}
        axesList={axesList}
        onRefreshData={syncWithServer}
        onBackToForm={() => {
          syncWithServer();
          setViewMode('evaluator');
        }}
        onLogoutAdmin={handleAdminLogout}
      />
    );
  }

  // RENDER EVALUATOR FORM PAGE
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between pb-12">
      
      {/* Header */}
      <Header
        isAdminMode={isAdminMode}
        onOpenAuth={() => {
          if (isAdminMode) {
            setViewMode('admin');
          } else {
            setIsAuthOpen(true);
          }
        }}
        onOpenAdmin={() => setViewMode('admin')}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 w-full space-y-6">
        
        {/* Institutional Banner */}
        <div className="bg-gradient-banner rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden border-b-4 border-[#c1d117]">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
            <Sparkles className="w-40 h-40" />
          </div>
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#c1d117] text-slate-900 text-[10px] font-extrabold uppercase tracking-wider">
                Expo Inspire
              </span>
              <span className="text-[11px] text-purple-200 font-semibold">
                Instituto Cacau Show
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Formulário de Avaliação Mobile
            </h2>
            <p className="text-xs text-purple-100/90 leading-relaxed max-w-lg">
              Preencha os dados abaixo. As rubricas estão estruturadas em matriz de botões de seleção.
            </p>
          </div>
        </div>

        {/* Step 1: Initial Data */}
        <InitialDataForm
          evaluatorName={evaluatorName}
          setEvaluatorName={setEvaluatorName}
          selectedAxisId={selectedAxisId}
          setSelectedAxisId={setSelectedAxisId}
          selectedAxis={selectedAxis}
          axesList={axesList}
        />

        {/* Step 2: Group Rubrics */}
        {selectedAxis && currentGroups.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 px-1">
              <div className="w-8 h-8 rounded-xl bg-[#806fb0] text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Avaliação dos Grupos do Eixo
                </h2>
                <p className="text-xs text-slate-500">
                  {currentGroups.length} {currentGroups.length === 1 ? 'grupo' : 'grupos'} para avaliar neste eixo
                </p>
              </div>
            </div>

            {currentGroups.map((group, index) => (
              <GroupRubricCard
                key={group.id}
                group={group}
                groupIndex={index}
                groupData={groupEvaluations[group.id]}
                onUpdateRubric={handleUpdateRubric}
                onUpdateObservation={handleUpdateObservation}
              />
            ))}
          </div>
        )}

        {/* Step 3: Finalizing Form */}
        {selectedAxis && currentGroups.length > 0 && (
          <FinalizingForm
            overallRating={overallRating}
            setOverallRating={setOverallRating}
            highlightGroupId={highlightGroupId}
            setHighlightGroupId={setHighlightGroupId}
            groups={currentGroups}
            onSubmit={handleSubmitEvaluation}
            isFormValid={isFormValid}
          />
        )}

      </main>

      {/* Admin Quick Bar (When Admin Mode is active) */}
      {isAdminMode && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900 text-white p-3 shadow-2xl flex items-center justify-between max-w-3xl mx-auto sm:rounded-t-2xl border-t-2 border-[#c1d117] animate-fade-in">
          <div className="flex items-center space-x-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c1d117] animate-pulse" />
            <span className="font-bold text-slate-200">Modo Admin Ativo</span>
          </div>

          <button
            type="button"
            onClick={() => setViewMode('admin')}
            className="px-4 py-2 rounded-xl bg-[#806fb0] hover:bg-[#685796] text-white font-extrabold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm active-press ring-2 ring-[#c1d117]/50"
          >
            <ShieldCheck className="w-4 h-4 text-[#c1d117]" />
            <span>Abrir Dashboard & Gestão de Eixos</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        onReset={handleResetForm}
      />

      <AdminAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticate={handleAdminAuthenticate}
      />

    </div>
  );
}
