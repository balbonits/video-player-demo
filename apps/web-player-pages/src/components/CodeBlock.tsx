"use client";

import { memo, useState, useCallback } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  showLineNumbers?: boolean;
}

const CodeBlock = memo(({ code, language, title, showLineNumbers = true }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lines = code.split('\n');

  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 border border-gray-800 mb-6">
      {title && (
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">{title}</span>
          <span className="text-xs text-gray-500">{language}</span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
          aria-label="Copy code"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <pre className="overflow-x-auto p-4">
          <code className="text-sm">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="text-gray-600 select-none mr-4 w-8 text-right">
                    {index + 1}
                  </span>
                )}
                <span className="text-gray-300">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;