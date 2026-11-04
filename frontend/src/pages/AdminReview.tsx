import React, { useState } from 'react';
import { db } from '../services/db';
import { AIQuestionGenerator } from '../services/aiGenerator';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/sound';
import { SUPPORTED_LANGUAGES, ALL_TOPICS } from '../data/languages';
import { Question, Difficulty, QuestionTopic } from '../types';
import { CodeBlock } from '../components/CodeBlock';
import { 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Trash2, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Plus,
  Eye,
  FileCheck
} from 'lucide-react';

export const AdminReview: React.FC = () => {
  const { settings } = useTheme();
  const [questions, setQuestions] = useState<Question[]>(() => db.getAllQuestions());
  const [reports, setReports] = useState(() => db.getReports());

  const [genLang, setGenLang] = useState('python');
  const [genTopic, setGenTopic] = useState<QuestionTopic>('Functions');
  const [genDifficulty, setGenDifficulty] = useState<Difficulty>('Intermediate');
  const [genCount, setGenCount] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    sound.playClick();
    db.updateQuestionStatus(id, 'approved');
    setQuestions(db.getAllQuestions());
  };

  const handleRetire = (id: string) => {
    sound.playClick();
    db.updateQuestionStatus(id, 'retired');
    setQuestions(db.getAllQuestions());
  };

  const handleGenerateCandidateBatch = async () => {
    sound.playClick();
    setGenerating(true);
    setGenSuccessMsg(null);

    try {
      const generated = await AIQuestionGenerator.generateQuestions(
        {
          language_id: genLang,
          topic: genTopic,
          difficulty: genDifficulty,
          count: genCount,
          apiKey: settings.gemini_api_key,
        },
        questions
      );

      // Save as candidate questions for audit review
      const marked = generated.map(q => ({ ...q, status: 'candidate' as const }));
      db.addQuestionsToBank(marked);
      setQuestions(db.getAllQuestions());
      setGenSuccessMsg(`Generated ${marked.length} valid candidate questions under strict schema rules!`);
      setTimeout(() => setGenSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const candidateQuestions = questions.filter(q => q.status === 'candidate');
  const approvedQuestions = questions.filter(q => q.status === 'approved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#39C6D8] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Quality & AI Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B2540] dark:text-white mt-1">
            Question Bank & AI Audit
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Review candidate AI questions, enforce deduplication, and inspect user reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] text-xs font-semibold">
            <span className="text-gray-400">Approved: </span>
            <span className="text-emerald-500 font-bold">{approvedQuestions.length}</span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-gray-400">Candidates: </span>
            <span className="text-amber-500 font-bold">{candidateQuestions.length}</span>
          </div>
        </div>
      </div>

      {/* AI Candidate Generation Workbench */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7657F6]/15 text-[#7657F6] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#39C6D8]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2540] dark:text-white">Generate Candidate Batch</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Synthesizes structured candidate questions conforming strictly to the 4-option distinct schema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Language</label>
            <select
              value={genLang}
              onChange={e => setGenLang(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-xs font-semibold text-[#1B2540] dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Topic</label>
            <select
              value={genTopic}
              onChange={e => setGenTopic(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-xs font-semibold text-[#1B2540] dark:text-white"
            >
              {ALL_TOPICS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Difficulty</label>
            <select
              value={genDifficulty}
              onChange={e => setGenDifficulty(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-xs font-semibold text-[#1B2540] dark:text-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Batch Size</label>
            <select
              value={genCount}
              onChange={e => setGenCount(parseInt(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-xs font-semibold text-[#1B2540] dark:text-white"
            >
              <option value={1}>1 Question</option>
              <option value={2}>2 Questions</option>
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
            </select>
          </div>
        </div>

        {genSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{genSuccessMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleGenerateCandidateBatch}
            disabled={generating}
            className="px-6 py-2.5 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating Candidate Schema...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Generate & Validate Candidates</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Candidate Questions Awaiting Approval */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1B2540] dark:text-white flex items-center gap-2">
          <span>Candidate Questions Awaiting Approval</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
            {candidateQuestions.length} pending
          </span>
        </h2>

        {candidateQuestions.length > 0 ? (
          <div className="space-y-4">
            {candidateQuestions.map(q => (
              <div
                key={q.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#141E34] border border-amber-500/30 shadow-card space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                      Candidate • {q.language_id} • {q.topic} • {q.difficulty}
                    </span>
                    <p className="text-base font-bold text-[#1B2540] dark:text-white mt-1">
                      {q.prompt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(q.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRetire(q.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Retire</span>
                    </button>
                  </div>
                </div>

                {q.code && <CodeBlock code={q.code} language={q.language_id} />}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {q.options.map(opt => (
                    <div
                      key={opt.label}
                      className={`p-2.5 rounded-xl border ${
                        opt.label === q.answer
                          ? 'border-emerald-500 bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-[#233354] bg-gray-50 dark:bg-[#0E1526]'
                      }`}
                    >
                      <span className="font-mono mr-1.5 font-bold">{opt.label}.</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#0E1526] text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-[#7657F6]">Model Metadata: </span>
                  <span>{q.model_metadata?.model || 'synthesizer'} • Generated: {q.model_metadata?.generated_at || 'Just now'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] text-center text-xs text-gray-400">
            No pending candidate questions. Use the generator workbench above to synthesize new batches.
          </div>
        )}
      </div>

      {/* User Reports & Feedback Log */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1B2540] dark:text-white flex items-center gap-2">
          <span>User Question Reports</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500">
            {reports.length} reports
          </span>
        </h2>

        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map(rep => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#141E34] border border-rose-500/30 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-rose-500 uppercase">{rep.reason.replace('_', ' ')}</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5 font-medium">{rep.details || 'No additional details.'}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">Question ID: {rep.question_id}</p>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(rep.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] text-center text-xs text-gray-400">
            Zero reported issues. All live questions verified.
          </div>
        )}
      </div>
    </div>
  );
};

