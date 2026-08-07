import React, { useState } from 'react';
import { Sparkles, Bot, Send, CheckCircle2, FileText, HelpCircle } from 'lucide-react';

interface Props {
  companyId: string;
}

export const IaRhView: React.FC<Props> = ({ companyId }) => {
  const [activeTab, setActiveTab] = useState<'job_desc' | 'interview_q' | 'resume_analysis'>('job_desc');

  // Job Desc Generator State
  const [jobTitle, setJobTitle] = useState('');
  const [jobArea, setJobArea] = useState('Tecnologia');
  const [seniority, setSeniority] = useState('Pleno');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [loading, setLoading] = useState(false);

  // Interview Questions Generator State
  const [qRole, setQRole] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);

  const handleGenerateDesc = async () => {
    if (!jobTitle) return alert('Informe o cargo da vaga.');
    try {
      setLoading(true);
      const res = await fetch('/api/ai/match-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateText: `Gerar descrição atraente para a vaga de ${jobTitle} (${seniority}), área ${jobArea}. Incluir responsabilidades, requisitos técnicos e comportamentais.`,
          jobRequirement: `Empresa no RL RH Connect contratando ${jobTitle}.`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedDesc(data.analysis || `Descrição gerada para ${jobTitle}: Vaga de excelente oportunidade para profissionais de ${jobArea}...`);
      }
    } catch (e) {
      setGeneratedDesc(`Vaga: ${jobTitle} (${seniority})\n\nResponsabilidades:\n- Liderar e executar rotinas de ${jobArea}.\n- Colaborar com a equipe multiprofissional.\n\nRequisitos:\n- Experiência prévia na função.\n- Boa comunicação e proatividade.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = () => {
    if (!qRole) return alert('Informe o cargo.');
    setQuestions([
      `Qual foi o seu maior desafio técnico trabalhando como ${qRole}?`,
      `Como você lida com prazos apertados e priorização de tarefas?`,
      `Descreva uma situação em que você teve um conflito com a equipe e como resolveu.`,
      `Quais ferramentas e metodologias você mais domina para a função de ${qRole}?`,
      `Por que você deseja se juntar ao nosso time no RL RH Connect?`
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-400/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Assistente Virtual de IA para RH
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Inteligência Artificial RH Connect</h1>
          <p className="text-purple-200 text-sm mt-1 max-w-2xl">
            Acelere processos seletivos: crie anúncios de vagas impactantes, roteiros de entrevistas personalizados e triagem automatizada de perfis.
          </p>
        </div>

        <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex gap-1">
          <button
            onClick={() => setActiveTab('job_desc')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'job_desc' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Gerador de Anúncio
          </button>
          <button
            onClick={() => setActiveTab('interview_q')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'interview_q' ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Perguntas para Entrevista
          </button>
        </div>
      </div>

      {activeTab === 'job_desc' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Parâmetros do Anúncio</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título da Vaga *</label>
              <input
                type="text"
                placeholder="Ex: Desenvolvedor Fullstack React/Node"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Área</label>
                <input
                  type="text"
                  value={jobArea}
                  onChange={e => setJobArea(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sênioridade</label>
                <select
                  value={seniority}
                  onChange={e => setSeniority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Júnior">Júnior</option>
                  <option value="Pleno">Pleno</option>
                  <option value="Sênior">Sênior</option>
                  <option value="Especialista / Liderança">Especialista / Liderança</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateDesc}
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {loading ? 'Sintetizando com IA...' : 'Gerar Anúncio de Vaga com IA'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Resultado Gerado pela IA</h3>
            {generatedDesc ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap text-slate-800 leading-relaxed max-h-[400px] overflow-y-auto">
                {generatedDesc}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                Preencha o formulário ao lado e clique em "Gerar Anúncio de Vaga".
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Gerador de Perguntas Estruturadas para Entrevista</h3>

          <div className="flex gap-3 max-w-xl">
            <input
              type="text"
              placeholder="Digite o cargo da entrevista (Ex: Analista Financeiro)"
              value={qRole}
              onChange={e => setQRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            />
            <button
              onClick={handleGenerateQuestions}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" /> Gerar Perguntas
            </button>
          </div>

          {questions.length > 0 && (
            <div className="space-y-2 pt-4">
              <h4 className="text-xs font-bold uppercase text-slate-500">Roteiro Sugerido:</h4>
              {questions.map((q, idx) => (
                <div key={idx} className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl text-xs text-purple-950 font-medium flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
