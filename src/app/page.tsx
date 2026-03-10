"use client";

import React, { useState } from "react";
import { Loader2, ShieldCheck, FileText, Briefcase, ChevronRight, Info, Zap, Target, Users, TrendingUp, AlertTriangle, CheckCircle2, ArrowUpRight } from "lucide-react";
import { extractTextFromPDF } from "@/lib/extractPdf";

type GapItem = {
  gap: string;
  severity: 'Critical' | 'Moderate' | 'Minor';
  recommendation: string;
};

type AnalysisResult = {
  profileSummary: {
    careerIntent: string;
    coreDomain: string;
    seniorityLevel: string;
    yearsOfExperience: number;
  };
  fitScore: number;
  identifiedSkills: string[];
  missingRequirements: string[];
  gapAnalysis: GapItem[];
  candidateInsight: string;
  reasoning: string;
};

export default function JobMatchingAgent() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [privacyFirst, setPrivacyFirst] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [isExtractingJD, setIsExtractingJD] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setText: (text: string) => void, setExtracting: (val: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      const text = await extractTextFromPDF(file);
      if (text) {
        setText(text);
      } else {
        alert("Could not extract text from this PDF. Try pasting the text manually.");
      }
    } catch (error) {
      console.error(error);
      alert("Error reading PDF. Please try pasting the text manually.");
    } finally {
      setExtracting(false);
      e.target.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescriptionText) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescriptionText, privacyFirst }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        alert("Agent Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error reaching the Agent. Ensure Ollama is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return 'shadow-[0_0_40px_rgba(52,211,153,0.3)]';
    if (score >= 60) return 'shadow-[0_0_40px_rgba(251,191,36,0.3)]';
    return 'shadow-[0_0_40px_rgba(244,63,94,0.3)]';
  };

  const getSeverityStyle = (severity: string) => {
    if (severity === 'Critical') return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
    if (severity === 'Moderate') return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
    return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-500/30">
      {/* Dashboard Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              JSO
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight block leading-tight">Career Intelligence</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">User Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-neutral-400">
            <span className="hover:text-white cursor-pointer transition-colors">Candidates</span>
            <span className="text-white border-b-2 border-blue-500 pb-0.5">Matching Engine</span>
            <span className="hover:text-white cursor-pointer transition-colors">Agency Network</span>
            <span className="hover:text-white cursor-pointer transition-colors">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Top: Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Left: Input Panel */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-400" /> Intelligence Agent
              </h1>
              <p className="text-neutral-400 text-sm">Upload a resume and job description. The agent will perform a deep career intelligence analysis.</p>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white">Privacy-First Mode</p>
                  <p className="text-xs text-neutral-500">Auto-scrub PII before analysis</p>
                </div>
              </div>
              <button
                onClick={() => setPrivacyFirst(!privacyFirst)}
                className={`w-11 h-6 rounded-full transition-colors relative ${privacyFirst ? 'bg-emerald-500' : 'bg-neutral-700'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${privacyFirst ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                    <FileText className="w-4 h-4 text-blue-400" /> Candidate Resume
                  </label>
                  <label className="cursor-pointer text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 border border-neutral-700 hover:border-neutral-500">
                    {isExtractingResume ? <Loader2 className="w-3 h-3 animate-spin" /> : "Upload PDF"}
                    <input type="file" accept=".pdf" className="hidden" disabled={isExtractingResume} onChange={(e) => handleFileUpload(e, setResumeText, setIsExtractingResume)} />
                  </label>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-36 bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none placeholder:text-neutral-600 transition-all"
                  placeholder="Paste the candidate's raw resume text here..."
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                    <Briefcase className="w-4 h-4 text-purple-400" /> Job Description
                  </label>
                  <label className="cursor-pointer text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 border border-neutral-700 hover:border-neutral-500">
                    {isExtractingJD ? <Loader2 className="w-3 h-3 animate-spin" /> : "Upload PDF"}
                    <input type="file" accept=".pdf" className="hidden" disabled={isExtractingJD} onChange={(e) => handleFileUpload(e, setJobDescriptionText, setIsExtractingJD)} />
                  </label>
                </div>
                <textarea
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  className="w-full h-36 bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none resize-none placeholder:text-neutral-600 transition-all"
                  placeholder="Paste the target job description here..."
                />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!resumeText || !jobDescriptionText || isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-medium transition-all shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:shadow-[0_0_35px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 disabled:shadow-none"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Agent Analyzing...</> : <><Zap className="w-5 h-5" /> Run Intelligence Analysis</>}
            </button>
          </div>

          {/* Right: Score + Profile Summary */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {!result && !isLoading && (
              <div className="h-full bg-neutral-900/40 border border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-neutral-500 space-y-4 min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center">
                  <ChevronRight className="w-8 h-8 text-neutral-600" />
                </div>
                <p className="text-center">Awaiting intelligence analysis.<br /><span className="text-xs text-neutral-600">Paste a resume and job description, then click the button.</span></p>
              </div>
            )}

            {isLoading && (
              <div className="h-full bg-neutral-900/40 border border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-blue-400 space-y-4 min-h-[400px]">
                <Loader2 className="w-12 h-12 animate-spin" />
                <div className="text-center">
                  <p className="font-medium animate-pulse">Agent Processing...</p>
                  <p className="text-xs text-neutral-500 mt-1">Analyzing profile, matching skills, and generating gap analysis</p>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <>
                {/* Score Header Card */}
                <div className={`bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden ${getScoreGlow(result.fitScore)}`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Intelligence Report</p>
                      <h2 className="text-xl font-semibold">Career Match Analysis</h2>
                    </div>
                    <div className="text-right">
                      <div className={`text-5xl font-light tracking-tighter ${getScoreColor(result.fitScore)}`}>
                        {result.fitScore}<span className="text-2xl text-neutral-500">%</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-1">JSO Fit Score</p>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="mt-4 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${result.fitScore >= 80 ? 'bg-emerald-500' : result.fitScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${result.fitScore}%` }}
                    />
                  </div>
                </div>

                {/* Profile Ingestion Card */}
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
                  <h3 className="text-sm font-medium text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-400" /> Profile Ingestion
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Domain</p>
                      <p className="text-sm font-medium text-white mt-0.5">{result.profileSummary.coreDomain}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Seniority</p>
                      <p className="text-sm font-medium text-white mt-0.5">{result.profileSummary.seniorityLevel}</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Experience</p>
                      <p className="text-sm font-medium text-white mt-0.5">{result.profileSummary.yearsOfExperience} years</p>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 col-span-1">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Career Intent</p>
                      <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{result.profileSummary.careerIntent}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom: Detailed Analysis Panels (only when result exists) */}
        {result && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Skills Match */}
            <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Matched Skills</span>
                <span className="text-neutral-600 text-xs ml-auto">{result.identifiedSkills.length} found</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.identifiedSkills.length > 0 ? result.identifiedSkills.map((skill, i) => (
                  <span key={i} className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-md">
                    {skill}
                  </span>
                )) : <span className="text-xs text-neutral-500">None identified</span>}
              </div>

              <h3 className="text-sm font-medium uppercase tracking-wider mt-6 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400">Missing Skills</span>
                <span className="text-neutral-600 text-xs ml-auto">{result.missingRequirements.length} gaps</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingRequirements.length > 0 ? result.missingRequirements.map((skill, i) => (
                  <span key={i} className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-md">
                    {skill}
                  </span>
                )) : <span className="text-xs text-neutral-500">No critical gaps</span>}
              </div>
            </div>

            {/* Gap Analysis */}
            <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Gap Analysis & Recommendations
              </h3>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {result.gapAnalysis.length > 0 ? result.gapAnalysis.map((item, i) => (
                  <div key={i} className={`border rounded-lg p-3 ${getSeverityStyle(item.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{item.gap}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-70">{item.severity}</span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed flex items-start gap-1">
                      <ArrowUpRight className="w-3 h-3 mt-0.5 shrink-0" /> {item.recommendation}
                    </p>
                  </div>
                )) : <p className="text-xs text-neutral-500">No significant gaps detected.</p>}
              </div>
            </div>

            {/* Reasoning + HR Insight */}
            <div className="lg:col-span-4 space-y-6">
              {/* Agent Reasoning */}
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Agent Reasoning
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {result.reasoning}
                </p>
              </div>

              {/* Bidirectional: HR Consultant Insight */}
              <div className="bg-neutral-900/40 border border-violet-500/20 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> HR Consultant Insight
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {result.candidateInsight}
                </p>
              </div>
            </div>

            {/* Disclaimer (Full Width) */}
            <div className="lg:col-span-12 bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-neutral-300">Algorithmic Fairness & Transparency</h4>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  This analysis is generated by an AI Agent evaluating provided text only. It does not factor in subjective nuances, non-documented experiences, or potential biases in JD phrasing. This tool assists human decision-making — it never auto-rejects candidates. Scoring logic is fully transparent and explained above.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
