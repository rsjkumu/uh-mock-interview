import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, FileText, Search, User, CheckCircle, Copy, AlertCircle, Loader2, Sparkles, Building, ChevronRight, Zap } from 'lucide-react';

// The main application component
export default function MockInterviewApp() {
  const [activeTab, setActiveTab] = useState('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [background, setBackground] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  // Results State
  const [resultsData, setResultsData] = useState({
    questions: '',
    gemInstructions: ''
  });

  const [copiedSection, setCopiedSection] = useState('');
  
  // New Feature State: Resume Gap Analysis
  const [resumeAnalysis, setResumeAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Handle Resume Gap Analysis (New Gemini API Call)
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

Job Description:
${jobDescription}

Resume:
${resumeText}

Please provide a concise analysis:
1. ATS FIT SCORE: Give an estimated match percentage (e.g., 75%).
2. MISSING KEYWORDS: List 3 to 5 critical skills or keywords present in the job description but missing or underrepresented in the resume.
3. BULLET POINT OPTIMIZER: Take 1 weak or generic bullet point from the resume and rewrite it using the STAR method to better align with the job description requirements.

Output in plain text. Do NOT use markdown bolding (like ** or <strong>). Use uppercase letters for section headers as shown above.
    `;

    try {
      const apiKey = ""; // API key is injected by the execution environment
      const payload = {
        contents: [{ parts: [{ text: promptText }] }]
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        contents: [{
            parts: [{ text: prompt }]
        }]
    })
});

      if (!response.ok) throw new Error('Failed to analyze resume.');

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setResumeAnalysis(aiText.trim());
    } catch (err) {
      console.error(err);
      setAnalysisError('An error occurred during resume analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Form Submission and API Call
  const generateInterviewPrep = async () => {
    if (!company || !jobDescription || !resumeText) {
      setError('Please provide at least a Company Name, Job Description, and your Resume.');
      return;
    }

    setLoading(true);
    setError('');
    
    // Construct the highly specific prompt
    const promptText = `
You are an elite career counselor and executive interview coach assisting a University of Hawaii student. 
Your goal is to prepare them for an upcoming job interview.

Here is the context provided by the student:
Target Company: ${company}
Target Job Title: ${jobTitle || 'Not specified'}
Student Background/Notes: ${background || 'None provided'}

Job Description:
${jobDescription}

Student's Resume:
${resumeText}

TASK 1: COMPANY INTELLIGENCE & INTERVIEW SCHEDULE
Use Google Search to find recent news, strategic goals, or known interview styles/culture for "${company}". Pay special attention if it is a local Hawaii business. 
Based on the company intel, the Job Description, and the Student's Resume, create a complete "Mock Job Interview Schedule" using the EXACT template structure below. 
You MUST generate at least 5 specific, tailored questions for Topics A, B, C, and D. Ensure all questions are numbered, indented, and tabbed correctly.
CRITICAL FORMATTING RULE: Do NOT use any bolding (do not use ** or <strong> tags) anywhere in your response for the Intelligence or the Schedule. Output plain text.

[START SCHEDULE TEMPLATE]
I. Opening
A. Establish Rapport: Hello, Mr./Ms. [Candidate Last Name]. My name is [Interviewer Name], and as the [Position Title] of ${company}, I would like to see if you are a good fit for ${company}.
B. Purpose: I will ask you some questions about yourself, your work history, your possible role here at our company, and your future plans.
C. Motivation: I will use the information gathered from this interview to share with my colleagues as we make our final hiring decisions from a pool of qualified candidates for the ${jobTitle || '[Job Title]'} position.
D. Timeline: The interview should take around 15-30 minutes.

Transition: Let me begin by asking you some questions about yourself.

II. Body
A. Topic: General questions about the candidate (for the position).
    1. Tell me about yourself.
    2. [Tailored Question 2]
    3. [Tailored Question 3]
    4. [Tailored Question 4]
    5. [Tailored Question 5]

Transition: Now, I want to find out about some of your previous jobs.

B. Topic: Let me ask you some questions about your work history.
    1. [Tailored Question 1]
    2. [Tailored Question 2]
    3. [Tailored Question 3]
    4. [Tailored Question 4]
    5. [Tailored Question 5]

Transition: Next, I will ask you some questions about the job you are interviewing for and our company.

C. Topic: Questions about the job and our company.
    1. [Tailored Question 1]
    2. [Tailored Question 2]
    3. [Tailored Question 3]
    4. [Tailored Question 4]
    5. [Tailored Question 5]

Transition: Finally, I would like to ask you some questions about your future.

D. Topic: Questions about your future.
    1. [Tailored Question 1]
    2. [Tailored Question 2]
    3. [Tailored Question 3]
    4. [Tailored Question 4]
    5. [Tailored Question 5]

Transition: Well, learning more about you has been a pleasure. We will be making our final hiring decision by next Monday.

III. Closing
A. Interviewee Questions: You seem like an excellent candidate for our company. Do you have any questions for me at this time?
B. Maintain Rapport: I appreciate the time you took for this interview. Is there anything else you think would be helpful for me to know as I decide on a candidate for this position?
C. Action to be taken: I should have all the information I need in order to make a decision; however, would it be all right to call you at home if I have any more questions?
D. Thanks again for your time. I will notify you of our decision as soon as we make one.
[END SCHEDULE TEMPLATE]

TASK 2: GEMINI GEM SYSTEM INSTRUCTIONS
Create a comprehensive "System Instruction" prompt that the student can copy and paste into a custom "Gemini Gem" (or standard Gemini Live) to act as an interactive Mock Interviewer.
This instruction MUST include:
- The persona the AI should adopt (Hiring Manager at ${company}).
- The ENTIRE Mock Job Interview Schedule you generated in Task 1 (Opening, Body A-D, Closing).
- Strict instructions: 1) Start by reading the Opening verbatim. 2) Ask the questions ONE AT A TIME. 3) Wait for the user to respond to each question. 4) Evaluate the response (checking for the STAR method and professionalism) and provide brief constructive feedback before asking the next question. 5) Use the exact Transitions provided in the schedule between topics. 6) Read the Closing script when finished.

FORMATTING REQUIREMENTS:
You MUST separate your response exactly like this:
<QUESTIONS>
[Your company insights, followed by the complete Interview Schedule formatted nicely in Markdown]
</QUESTIONS>
<GEM_INSTRUCTIONS>
[The exact text to be pasted into the Gem System Instructions, containing the embedded schedule and behavioral rules]
</GEM_INSTRUCTIONS>
    `;

    try {
      // Access API key from the environment
      const apiKey = import.meta.env.VITE_API_KEY; // API key is injected by the execution environment
      
      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        tools: [{ google_search: {} }], // Enable Real-Time Search Grounding
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        contents: [{
            parts: [{ text: prompt }]
        }]
    })
});

      if (!response.ok) {
        throw new Error('Failed to generate response from AI.');
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse the custom tags we requested in the prompt
      const questionsMatch = aiText.match(/<QUESTIONS>([\s\S]*?)<\/QUESTIONS>/);
      const gemMatch = aiText.match(/<GEM_INSTRUCTIONS>([\s\S]*?)<\/GEM_INSTRUCTIONS>/);

      if (questionsMatch && gemMatch) {
        setResultsData({
          // Clean up any rogue markdown formatting just in case
          questions: questionsMatch[1].replace(/\*\*/g, '').replace(/<strong>/g, '').replace(/<\/strong>/g, '').trim(),
          gemInstructions: gemMatch[1].trim()
        });
        setActiveTab('results');
      } else {
        // Fallback if the AI didn't format perfectly
        setResultsData({
          questions: aiText,
          gemInstructions: "Formatting error. Please review the output above for instructions."
        });
        setActiveTab('results');
      }

    } catch (err) {
      console.error(err);
      setError('An error occurred while generating your interview prep. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Plain text copy for the Gem Instructions
  const copyToClipboard = (text, section) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    } catch (err) {
      console.error('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  // Rich text copy for the Interview Schedule (preserves Google Docs indents)
  const copyRichTextToClipboard = (elementId, section) => {
    const element = document.getElementById(elementId);
    if (window.getSelection && document.createRange) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand('copy');
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(''), 2000);
      } catch (err) {
        console.error('Unable to copy rich text', err);
      }
      selection.removeAllRanges();
    }
  };

  // Helper to render lines with precise Google Docs style hanging indents
  const renderScheduleLine = (line, i) => {
    const cleanLine = line.trim();
    if (cleanLine === '') return <div key={i} style={{ height: '16px' }}></div>;
    
    // Default styling for normal paragraphs (like the Company Intelligence at the top)
    let style = { paddingLeft: '0px', textIndent: '0px', marginTop: '8px', marginBottom: '8px', lineHeight: '1.5' };
    let isBold = false;

    // I. Opening, II. Body
    if (/^[IVX]+\.\s/.test(cleanLine)) {
      style = { paddingLeft: '0px', textIndent: '0px', marginTop: '24px', marginBottom: '12px', fontWeight: 'bold' };
    } 
    // A. Topic, or Template Labels
    else if (/^[A-Z]\.\s/.test(cleanLine) || /^(Establish Rapport|Purpose|Motivation|Timeline|Transition|Interviewee Questions|Maintain Rapport|Action to be taken):/i.test(cleanLine)) {
      // 40px indent, -40px hanging out for the bullet/label
      style = { paddingLeft: '40px', textIndent: '-40px', marginTop: '8px', marginBottom: '8px' };
      
      // Make the label part bold if it's a template label
      if (/^(Establish Rapport|Purpose|Motivation|Timeline|Transition|Interviewee Questions|Maintain Rapport|Action to be taken):/i.test(cleanLine)) {
         const colonIndex = cleanLine.indexOf(':');
         return (
           <div key={i} style={style}>
             <strong>{cleanLine.substring(0, colonIndex + 1)}</strong>{cleanLine.substring(colonIndex + 1)}
           </div>
         );
      }
    } 
    // 1. Questions
    else if (/^[0-9]+\.\s/.test(cleanLine)) {
      // 80px indent, -40px hanging out for the number
      style = { paddingLeft: '80px', textIndent: '-40px', marginTop: '8px', marginBottom: '8px' };
    } 
    // a. Follow ups
    else if (/^[a-z]\.\s/.test(cleanLine)) {
      style = { paddingLeft: '120px', textIndent: '-40px', marginTop: '4px', marginBottom: '4px' };
    }

    return <div key={i} style={style}>{cleanLine}</div>;
  };

  // Simulated File Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // For prototype purposes, we read standard text files. 
    // In production, you would use pdf.js to parse PDF buffers.
    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target.result);
    };
    reader.readAsText(file);
    // Alternatively, just alert users they can paste if it's not a txt
    if (!file.name.endsWith('.txt')) {
      alert("For this prototype, please upload .txt files or paste your resume text directly into the box.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* UH Themed Header */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full">
              <Sparkles className="h-6 w-6 text-emerald-800" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">UH Career Hub</h1>
              <p className="text-emerald-200 text-xs font-medium tracking-wider uppercase">AI Mock Interview Prep</p>
            </div>
          </div>
          <div className="hidden sm:flex space-x-1 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'input' ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-700'}`}
            >
              Setup Prep
            </button>
            <button 
              onClick={() => activeTab === 'results' && setActiveTab('results')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'results' ? 'bg-emerald-900 text-white' : 'text-emerald-400 cursor-not-allowed opacity-50'}`}
              disabled={activeTab !== 'results'}
            >
              Your Results
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* INPUT TAB */}
        {activeTab === 'input' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center">
                <Building className="h-5 w-5 text-emerald-700 mr-2" />
                <h2 className="text-lg font-semibold text-slate-800">Target Opportunity</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. Bank of Hawaii, Hawaiian Airlines..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">AI will search for real-time intel on this company.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. Data Analyst Intern"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span>Job Description <span className="text-red-500">*</span></span>
                    <span className="text-xs font-normal text-slate-400">Paste full description here</span>
                  </label>
                  <textarea 
                    rows="4" 
                    className="w-full rounded-md border border-slate-300 p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-y"
                    placeholder="Paste the requirements, duties, and qualifications here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center">
                <User className="h-5 w-5 text-emerald-700 mr-2" />
                <h2 className="text-lg font-semibold text-slate-800">Your Profile & Resume</h2>
              </div>
              <div className="p-6 grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specific Background or Concerns (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. 'I am worried about my lack of management experience', 'Highlight my Python skills'"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-slate-700">Your Resume <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Upload .txt resume"
                      />
                      <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-3 rounded border border-slate-200 flex items-center transition-colors">
                        <FileText className="h-3 w-3 mr-1" /> Upload .txt
                      </button>
                    </div>
                  </div>
                  <textarea 
                    rows="6" 
                    className="w-full rounded-md border border-slate-300 p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-y font-mono text-sm"
                    placeholder="Paste your resume text here, or use the upload button above..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  ></textarea>
                  
                  {/* ✨ New AI Feature: Resume Gap Analysis */}
                  <div className="mt-3">
                    <button
                      onClick={analyzeResumeGap}
                      disabled={isAnalyzing || !jobDescription || !resumeText}
                      className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 px-4 rounded-md border border-indigo-200 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold w-full sm:w-auto justify-center shadow-sm"
                    >
                      {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <span className="mr-2 text-base">✨</span>}
                      {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume Fit (AI Gap Analysis)'}
                    </button>
                    {analysisError && <p className="text-red-500 text-xs mt-2">{analysisError}</p>}
                    
                    {resumeAnalysis && (
                      <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg shadow-inner text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div className="flex items-center mb-3 text-indigo-900 font-bold text-base">
                          <Zap className="h-5 w-5 mr-2 text-indigo-600" /> Resume Gap Analysis Results
                        </div>
                        {resumeAnalysis}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
              <button 
                onClick={generateInterviewPrep}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing & Searching Web...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Interview Prep & Gem</span>
                  </>
                )}
              </button>
            </div>
            
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            
            {/* Step 1: Intelligence & Questions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-emerald-600 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                  <h2 className="text-lg font-semibold text-emerald-900">Intelligence & Interview Schedule</h2>
                </div>
                <button 
                  onClick={() => copyRichTextToClipboard('interview-schedule-content', 'schedule')}
                  className="flex items-center text-sm bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 py-1.5 px-3 rounded shadow-sm transition-colors"
                >
                  {copiedSection === 'schedule' ? <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" /> : <Copy className="h-4 w-4 mr-1.5" />}
                  {copiedSection === 'schedule' ? 'Copied to Clipboard!' : 'Copy to Google Docs'}
                </button>
              </div>
              <div className="p-8">
                <div id="interview-schedule-content" className="text-slate-800" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {resultsData.questions.split('\n').map((line, i) => renderScheduleLine(line, i))}
                </div>
              </div>
            </div>

            {/* Step 2: Gemini Gem Instructions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                  <h2 className="text-lg font-semibold text-blue-900">Your Interactive Gemini Gem Instructions</h2>
                </div>
                <button 
                  onClick={() => copyToClipboard(resultsData.gemInstructions, 'gem')}
                  className="flex items-center text-sm bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 py-1.5 px-3 rounded shadow-sm transition-colors"
                >
                  {copiedSection === 'gem' ? <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" /> : <Copy className="h-4 w-4 mr-1.5" />}
                  {copiedSection === 'gem' ? 'Copied!' : 'Copy Instructions'}
                </button>
              </div>
              <div className="p-6 grid md:grid-cols-3 gap-6">
                
                <div className="md:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" />
                    How to use this Gem
                  </h3>
                  <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
                    <li>Go to <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">gemini.google.com</a>.</li>
                    <li>Click <strong>"Gems"</strong> on the left sidebar, then <strong>"New Gem"</strong>.</li>
                    <li>Give your Gem a name (e.g., "{company} Mock Interview").</li>
                    <li>Give your Gem a Short Description in the Description box (e.g., "Mock Job Interview Schedule Creator, Resume Optimizer, Gem - System Instructions for Mock Job Interview Practice.").</li>
                    <li><strong>Copy the text on the right</strong> and paste it into the "Instructions" box.</li>
                    <li>Click <strong>Create</strong>, open the Gem, and say "Hello, I am ready to begin the interview."</li>
                  </ol>
                </div>

                <div className="md:col-span-2">
                  <div className="relative group">
                    <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm font-mono border border-slate-700 shadow-inner">
                      {resultsData.gemInstructions}
                    </pre>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setActiveTab('input')}
                className="text-slate-500 hover:text-emerald-700 font-medium flex items-center transition-colors"
              >
                Start a New Session <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}