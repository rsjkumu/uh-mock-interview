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

  // FEATURE 1: RESUME GAP ANALYSIS
  const analyzeResumeGap = async () => {
    if (!jobDescription || !resumeText) {
      setAnalysisError('Please provide both a Job Description and your Resume to analyze the fit.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    
    const promptText = `
You are an expert ATS (Applicant Tracking System) and career coach.
Analyze the following Student Resume against the Target Job Description to find gaps.
Job Description: ${jobDescription}
Resume: ${resumeText}
Output in plain text. Do NOT use markdown bolding. Use uppercase letters for section headers.
    `;

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) throw new Error('Failed to analyze resume.');

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setResumeAnalysis(aiText.trim());
    } catch (err) {
      console.error(err);
      setAnalysisError('An error occurred during resume analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // FEATURE 2: GENERATE INTERVIEW PREP
  const generateInterviewPrep = async () => {
    if (!company || !jobDescription || !resumeText) {
      setError('Please provide at least a Company Name, Job Description, and your Resume.');
      return;
    }

    setLoading(true);
    setError('');
    
    const promptText = `
You are an elite career counselor assisting a University of Hawaii student. 
Target Company: ${company}
Target Job Title: ${jobTitle || 'Not specified'}
Job Description: ${jobDescription}
Student's Resume: ${resumeText}
TASK: Generate a Mock Interview Schedule and Gemini Gem Instructions.
Use tags <QUESTIONS> and <GEM_INSTRUCTIONS> to separate. No bolding.
    `;

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) throw new Error('Failed to generate response.');

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const questionsMatch = aiText.match(/<QUESTIONS>([\s\S]*?)<\/QUESTIONS>/);
      const gemMatch = aiText.match(/<GEM_INSTRUCTIONS>([\s\S]*?)<\/GEM_INSTRUCTIONS>/);

      if (questionsMatch && gemMatch) {
        setResultsData({
          questions: questionsMatch[1].replace(/\*\*/g, '').trim(),
          gemInstructions: gemMatch[1].trim()
        });
        setActiveTab('results');
      } else {
        setResultsData({ questions: aiText, gemInstructions: "Formatting error." });
        setActiveTab('results');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const copyRichTextToClipboard = (elementId, section) => {
    const element = document.getElementById(elementId);
    const range = document.createRange();
    range.selectNodeContents(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const renderScheduleLine = (line, i) => {
    const cleanLine = line.trim();
    if (cleanLine === '') return <div key={i} style={{ height: '16px' }}></div>;
    return <div key={i} style={{ marginTop: '8px' }}>{cleanLine}</div>;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setResumeText(event.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">UH Career Hub</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded border-l-4 border-red-500">{error}</div>}

        {activeTab === 'input' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Target Opportunity</h2>
              <input type="text" className="w-full mb-4 p-2 border rounded" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
              <textarea rows="4" className="w-full p-2 border rounded" placeholder="Job Description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Resume</h2>
              <textarea rows="6" className="w-full p-2 border rounded font-mono" placeholder="Paste Resume" value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
              <button onClick={analyzeResumeGap} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">Analyze Resume</button>
              {resumeAnalysis && <div className="mt-4 p-4 bg-indigo-50 border rounded">{resumeAnalysis}</div>}
            </div>

            <button onClick={generateInterviewPrep} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg">
              {loading ? "Generating..." : "Generate Interview Prep"}
            </button>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded border">
              <div id="interview-schedule-content">{resultsData.questions.split('\n').map((line, i) => renderScheduleLine(line, i))}</div>
            </div>
            <button onClick={() => setActiveTab('input')} className="text-emerald-700 font-medium">← Start Over</button>
          </div>
        )}
      </main>
    </div>
  );
}