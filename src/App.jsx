import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, FileText, Search, User, CheckCircle, Copy, AlertCircle, Loader2, Sparkles, Building, ChevronRight, Zap } from 'lucide-react';

export default function MockInterviewApp() {
  const [activeTab, setActiveTab] = useState('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [background, setBackground] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  const [resultsData, setResultsData] = useState({
    questions: '',
    gemInstructions: ''
  });

  const [copiedSection, setCopiedSection] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const analyzeResumeGap = async () => {
    if (!jobDescription || !resumeText) {
      setAnalysisError('Please provide both a Job Description and your Resume to analyze the fit.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError('');
    const promptText = `Analyze the following Student Resume against the Target Job Description to find gaps.\n\nJob Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nProvide ATS Score, Missing Keywords, and a Bullet Point Optimizer in plain text. No bolding.`;
    
    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      if (!response.ok) throw new Error('Failed to analyze resume.');
      const data = await response.json();
      setResumeAnalysis(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
    } catch (err) {
      setAnalysisError('An error occurred during resume analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateInterviewPrep = async () => {
    if (!company || !jobDescription || !resumeText) {
      setError('Please provide at least a Company Name, Job Description, and your Resume.');
      return;
    }
    setLoading(true);
    setError('');
    const promptText = `You are an elite career coach. Target Company: ${company}. Job Title: ${jobTitle}. \nJob Description: ${jobDescription}\nResume: ${resumeText}\nGenerate a Mock Interview Schedule and Gem Instructions. Use <QUESTIONS> and <GEM_INSTRUCTIONS> tags. No bolding.`;
    
    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      if (!response.ok) throw new Error('Failed to generate.');
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const questionsMatch = aiText.match(/<QUESTIONS>([\s\S]*?)<\/QUESTIONS>/);
      const gemMatch = aiText.match(/<GEM_INSTRUCTIONS>([\s\S]*?)<\/GEM_INSTRUCTIONS>/);
      setResultsData({
        questions: questionsMatch ? questionsMatch[1].trim() : aiText,
        gemInstructions: gemMatch ? gemMatch[1].trim() : "Instructions generated above."
      });
      setActiveTab('results');
    } catch (err) {
      setError('An error occurred. Please check your API key in Vercel.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const renderScheduleLine = (line, i) => {
    const cleanLine = line.trim();
    if (cleanLine === '') return <div key={i} className="h-4"></div>;
    return <div key={i} className="my-2">{cleanLine}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-emerald-800 text-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex items-center space-x-3">
          <Sparkles className="h-6 w-6" />
          <h1 className="text-xl font-bold">UH Career Hub</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded">{error}</div>}

        {activeTab === 'input' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b flex items-center">
                <Building className="h-5 w-5 text-emerald-700 mr-2" />
                <h2 className="text-lg font-semibold">Target Opportunity</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <input type="text" className="w-full rounded border p-2.5 focus:ring-2 focus:ring-emerald-500" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input type="text" className="w-full rounded border p-2.5 focus:ring-2 focus:ring-emerald-500" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Job Description *</label>
                  <textarea rows="4" className="w-full rounded border p-3 focus:ring-2 focus:ring-emerald-500" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b flex items-center">
                <User className="h-5 w-5 text-emerald-700 mr-2" />
                <h2 className="text-lg font-semibold">Your Profile & Resume</h2>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium mb-1">Paste Resume *</label>
                <textarea rows="6" className="w-full rounded border p-3 font-mono text-sm mb-4" value={resumeText} onChange={(e) => setResumeText(e.target.value)}></textarea>
                
                <button onClick={analyzeResumeGap} disabled={isAnalyzing} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded border border-indigo-200 flex items-center">
                  {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Analyze Resume Fit
                </button>
                {resumeAnalysis && <div className="mt-4 p-4 bg-indigo-50 border rounded whitespace-pre-wrap">{resumeAnalysis}</div>}
              </div>
            </div>

            <div className="flex justify-end pb-10">
              <button onClick={generateInterviewPrep} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg flex items-center">
                {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Generate Interview Prep
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-8">
               <div className="flex justify-between mb-4">
                 <h2 className="text-xl font-bold text-emerald-900">Interview Schedule</h2>
                 <button onClick={() => copyToClipboard(resultsData.questions, 'q')} className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded border border-emerald-200">
                   {copiedSection === 'q' ? 'Copied!' : 'Copy Schedule'}
                 </button>
               </div>
               <div className="text-slate-800 whitespace-pre-wrap font-sans">
                 {resultsData.questions.split('\n').map((line, i) => renderScheduleLine(line, i))}
               </div>
            </div>
            <button onClick={() => setActiveTab('input')} className="text-emerald-700 font-medium">← Back to Input</button>
          </div>
        )}
      </main>
    </div>
  );
}