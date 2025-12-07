import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

// Language configurations with Judge0 language IDs
const LANGUAGES = {
  python: { id: 71, name: 'Python', ext: 'py' },
  cpp: { id: 54, name: 'C++', ext: 'cpp' },
  c: { id: 50, name: 'C', ext: 'c' },
  java: { id: 62, name: 'Java', ext: 'java' },
  javascript: { id: 63, name: 'JavaScript', ext: 'js' },
  typescript: { id: 74, name: 'TypeScript', ext: 'ts' },
  go: { id: 60, name: 'Go', ext: 'go' },
  rust: { id: 73, name: 'Rust', ext: 'rs' },
  ruby: { id: 72, name: 'Ruby', ext: 'rb' },
  php: { id: 68, name: 'PHP', ext: 'php' },
  csharp: { id: 51, name: 'C#', ext: 'cs' },
  kotlin: { id: 78, name: 'Kotlin', ext: 'kt' },
  swift: { id: 83, name: 'Swift', ext: 'swift' },
  bash: { id: 46, name: 'Bash', ext: 'sh' },
  sql: { id: 82, name: 'SQL', ext: 'sql' },
};

type LanguageKey = keyof typeof LANGUAGES;

interface CodeRunnerProps {
  code: string;
  language: LanguageKey;
  title?: string;
  stdin?: string;
}

// Free public Judge0 API (rate limited but works for demos)
const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = ''; // Users should add their own key for production

export default function CodeRunner({
  code,
  language,
  title,
  stdin = ''
}: CodeRunnerProps): JSX.Element {
  const [editableCode, setEditableCode] = useState(code);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>('');

  const langConfig = LANGUAGES[language];

  const runCode = useCallback(async () => {
    if (!RAPIDAPI_KEY) {
      // Fallback: Use Pyodide for Python if no API key
      if (language === 'python') {
        runPythonLocally();
        return;
      }
      setError('API key required for this language. See CLAUDE.md for setup.');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // Submit code
      const submitResponse = await fetch(`${JUDGE0_API}/submissions?base64_encoded=true&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          source_code: btoa(editableCode),
          language_id: langConfig.id,
          stdin: btoa(stdin),
        }),
      });

      const result = await submitResponse.json();

      if (result.stdout) {
        setOutput(atob(result.stdout));
      } else if (result.stderr) {
        setError(atob(result.stderr));
      } else if (result.compile_output) {
        setError(atob(result.compile_output));
      } else if (result.message) {
        setError(result.message);
      }
    } catch (err) {
      setError(`Execution failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [editableCode, langConfig, stdin, language]);

  // Local Python execution using Pyodide
  const runPythonLocally = useCallback(async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // @ts-ignore
      if (!window.pyodide) {
        setOutput('Loading Python...');
        // @ts-ignore
        window.pyodide = await loadPyodide();
      }

      // @ts-ignore
      const pyodide = window.pyodide;

      // Capture stdout
      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run user code
      await pyodide.runPythonAsync(editableCode);

      // Get output
      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      setOutput(stdout || '(No output)');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  }, [editableCode]);

  return (
    <div className={styles.container}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.header}>
        <span className={styles.language}>{langConfig.name}</span>
        <button
          className={styles.runButton}
          onClick={runCode}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
      <textarea
        className={styles.editor}
        value={editableCode}
        onChange={(e) => setEditableCode(e.target.value)}
        spellCheck={false}
      />
      {(output || error) && (
        <div className={styles.outputContainer}>
          <div className={styles.outputLabel}>Output:</div>
          <pre className={`${styles.output} ${error ? styles.error : ''}`}>
            {error || output}
          </pre>
        </div>
      )}
    </div>
  );
}

// Load Pyodide script dynamically
declare global {
  interface Window {
    pyodide: any;
    loadPyodide: () => Promise<any>;
  }
}

if (typeof window !== 'undefined' && !document.getElementById('pyodide-script')) {
  const script = document.createElement('script');
  script.id = 'pyodide-script';
  script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
  document.head.appendChild(script);
}
