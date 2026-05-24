'use client';

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Send,
  ChevronDown,
  Terminal,
  Clock,
  MemoryStick,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const LANGUAGE_OPTIONS = [
  { value: 'python', label: 'Python 3', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'go', label: 'Go', icon: '🔷' },
] as const;

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
};

interface TestCaseResult {
  id: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  memoryUsed: number;
  status: 'success' | 'error' | 'timeout' | 'memory_limit';
  testCases?: TestCaseResult[];
}

interface CodeEditorProps {
  languages: string[];
  boilerplateCode?: Record<string, string>;
  testCases?: { id: string; input: string; expected: string; isHidden: boolean; order: number }[];
  onCodeChange?: (language: string, code: string) => void;
  onSubmit?: (language: string, code: string) => void;
  initialLanguage?: string;
  initialCode?: string;
}

export default function CodeEditor({
  languages,
  boilerplateCode,
  testCases = [],
  onCodeChange,
  onSubmit,
  initialLanguage,
  initialCode,
}: CodeEditorProps) {
  const availableLanguages = LANGUAGE_OPTIONS.filter((l) => languages.includes(l.value));
  const [language, setLanguage] = useState(initialLanguage || availableLanguages[0]?.value || 'python');
  const [code, setCode] = useState(initialCode || boilerplateCode?.[language] || '');
  const [customInput, setCustomInput] = useState('');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'testcases'>('output');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      setLanguage(newLang);
      const newCode = boilerplateCode?.[newLang] || '';
      setCode(newCode);
      setShowLangDropdown(false);
      setResult(null);
      onCodeChange?.(newLang, newCode);
    },
    [boilerplateCode, onCodeChange]
  );

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || '';
      setCode(newCode);
      onCodeChange?.(language, newCode);
    },
    [language, onCodeChange]
  );

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    setActiveTab('output');

    // Simulate execution (in production, this calls POST /coding/execute)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const simulatedResult: ExecutionResult = {
      stdout: simulateExecution(language, code, customInput),
      stderr: '',
      exitCode: 0,
      executionTime: Math.floor(Math.random() * 200) + 50,
      memoryUsed: Math.floor(Math.random() * 20) + 5,
      status: 'success',
    };

    setResult(simulatedResult);
    setIsRunning(false);
  }, [language, code, customInput]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setActiveTab('testcases');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const visibleTests = testCases.filter((tc) => !tc.isHidden);
    const testResults: TestCaseResult[] = visibleTests.map((tc) => ({
      id: tc.id,
      input: tc.input,
      expected: tc.expected,
      actual: tc.expected,
      passed: true,
    }));

    const hiddenCount = testCases.filter((tc) => tc.isHidden).length;
    if (hiddenCount > 0) {
      testResults.push({
        id: 'hidden',
        input: `${hiddenCount} hidden test case(s)`,
        expected: '—',
        actual: '—',
        passed: true,
      });
    }

    setResult({
      stdout: '',
      stderr: '',
      exitCode: 0,
      executionTime: Math.floor(Math.random() * 300) + 100,
      memoryUsed: Math.floor(Math.random() * 30) + 10,
      status: 'success',
      testCases: testResults,
    });

    setIsSubmitting(false);
    onSubmit?.(language, code);
  }, [testCases, language, code, onSubmit]);

  const handleReset = useCallback(() => {
    setCode(boilerplateCode?.[language] || '');
    setResult(null);
    setCustomInput('');
  }, [boilerplateCode, language]);

  const currentLang = availableLanguages.find((l) => l.value === language);

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-background text-sm font-medium hover:bg-muted transition-colors"
            >
              <span>{currentLang?.icon}</span>
              <span>{currentLang?.label}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-1 w-48 rounded-md border bg-background shadow-lg z-50"
                >
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => handleLanguageChange(lang.value)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${
                        lang.value === language ? 'bg-primary/10 text-primary font-medium' : ''
                      }`}
                    >
                      <span>{lang.icon}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isRunning || isSubmitting || !code.trim()}
            className="gap-1.5"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting || !code.trim()}
            className="gap-1.5"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[300px]">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[language] || language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            tabSize: language === 'python' || language === 'go' ? 4 : 2,
            automaticLayout: true,
            wordWrap: 'on',
            suggest: { showWords: false },
          }}
        />
      </div>

      {/* Output Panel */}
      <div className="border-t">
        {/* Tabs */}
        <div className="flex items-center gap-0 border-b bg-muted/20">
          <button
            onClick={() => setActiveTab('output')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'output'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" /> Output
            </span>
          </button>
          <button
            onClick={() => setActiveTab('testcases')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'testcases'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Test Cases
              {result?.testCases && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                  {result.testCases.filter((t) => t.passed).length}/{result.testCases.length}
                </Badge>
              )}
            </span>
          </button>

          {/* Execution stats */}
          {result && (
            <div className="ml-auto flex items-center gap-3 px-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {result.executionTime}ms
              </span>
              <span className="flex items-center gap-1">
                <MemoryStick className="h-3 w-3" /> {result.memoryUsed}MB
              </span>
              <Badge
                variant={result.status === 'success' ? 'default' : 'destructive'}
                className="text-[10px] h-4"
              >
                {result.status === 'success' ? 'Accepted' : result.status.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="h-[180px] overflow-auto">
          {activeTab === 'output' && (
            <div className="p-3">
              {isRunning && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Running...
                </div>
              )}
              {!isRunning && !result && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Custom Input</label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter input for your program..."
                    className="w-full h-20 p-2 rounded-md border bg-muted/30 text-sm font-mono resize-none focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              )}
              {!isRunning && result && (
                <div className="space-y-2">
                  {result.stdout && (
                    <pre className="text-sm font-mono whitespace-pre-wrap text-green-400 bg-zinc-900 rounded-md p-3">
                      {result.stdout}
                    </pre>
                  )}
                  {result.stderr && (
                    <pre className="text-sm font-mono whitespace-pre-wrap text-red-400 bg-zinc-900 rounded-md p-3">
                      {result.stderr}
                    </pre>
                  )}
                  {!result.stdout && !result.stderr && (
                    <p className="text-sm text-muted-foreground">No output</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'testcases' && (
            <div className="p-3">
              {isSubmitting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Running test cases...
                </div>
              )}
              {!isSubmitting && result?.testCases && (
                <div className="space-y-2">
                  {result.testCases.map((tc, i) => (
                    <div
                      key={tc.id}
                      className={`flex items-start gap-3 p-3 rounded-md border ${
                        tc.passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      {tc.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium mb-1">
                          Test Case {i + 1} — {tc.passed ? 'Passed' : 'Failed'}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Input</span>
                            <span className="text-foreground">{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Expected</span>
                            <span className="text-foreground">{tc.expected}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Output</span>
                            <span className={tc.passed ? 'text-green-500' : 'text-red-500'}>{tc.actual}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isSubmitting && !result?.testCases && (
                <div className="space-y-2">
                  {testCases
                    .filter((tc) => !tc.isHidden)
                    .map((tc, i) => (
                      <div key={tc.id} className="p-3 rounded-md border bg-muted/20">
                        <div className="text-xs font-medium mb-1">Test Case {i + 1}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Input</span>
                            <span>{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Expected</span>
                            <span>{tc.expected}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  {testCases.filter((tc) => tc.isHidden).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      + {testCases.filter((tc) => tc.isHidden).length} hidden test case(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function simulateExecution(language: string, code: string, input: string): string {
  if (!code.trim()) return '';

  if (language === 'python') {
    if (code.includes('print')) {
      const match = code.match(/print\(["'](.+?)["']\)/);
      if (match) return match[1];
      if (code.includes('input()') || code.includes('sys.stdin')) {
        return input || '(waiting for input)';
      }
      return 'Hello, World!';
    }
    return '>>> Program executed successfully';
  }

  if (language === 'javascript') {
    if (code.includes('console.log')) {
      const match = code.match(/console\.log\(["'](.+?)["']\)/);
      if (match) return match[1];
      return 'Hello, World!';
    }
    return '> Program executed successfully';
  }

  return `[${language}] Program executed successfully`;
}
