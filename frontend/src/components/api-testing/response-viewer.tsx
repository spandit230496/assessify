'use client';

import { useMemo } from 'react';
import {
  AlertCircle,
  Clock,
  HardDrive,
  FileJson,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './status-badge';
import { useApiTestingStore } from '@/store/api-testing-store';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function tryFormatJson(str: string): { formatted: string; isJson: boolean } {
  try {
    const parsed = JSON.parse(str);
    return { formatted: JSON.stringify(parsed, null, 2), isJson: true };
  } catch {
    return { formatted: str, isJson: false };
  }
}

function JsonViewer({ content }: { content: string }) {
  const { formatted, isJson } = useMemo(() => tryFormatJson(content), [content]);

  if (!isJson) {
    return (
      <pre className="text-sm font-mono whitespace-pre-wrap break-all p-4 bg-muted/50 rounded-md overflow-auto max-h-[500px]">
        {content}
      </pre>
    );
  }

  return (
    <pre className="text-sm font-mono whitespace-pre-wrap break-all p-4 bg-muted/50 rounded-md overflow-auto max-h-[500px]">
      {formatted}
    </pre>
  );
}

export function ResponseViewer() {
  const { response, isExecuting, responseTab, setResponseTab, responseViewMode, setResponseViewMode } = useApiTestingStore();

  if (isExecuting) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Sending request...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <FileJson className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Enter a URL and click Send</p>
        <p className="text-xs text-muted-foreground mt-1">The response will appear here</p>
      </div>
    );
  }

  if (response.error && response.statusCode === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h3 className="text-sm font-medium text-red-600">Request Failed</h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-sm text-red-700 dark:text-red-400 font-mono">{response.error}</p>
        </div>
      </div>
    );
  }

  const headerEntries = Object.entries(response.headers);

  return (
    <div className="flex flex-col h-full">
      {/* Response Meta */}
      <div className="flex items-center gap-3 p-3 border-b flex-wrap">
        {response.statusCode > 0 && <StatusBadge statusCode={response.statusCode} />}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatTime(response.responseTimeMs)}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <HardDrive className="h-3 w-3" />
          {formatBytes(response.responseSizeBytes)}
        </div>

        <div className="ml-auto flex items-center gap-1">
          {(['pretty', 'raw', 'preview'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setResponseViewMode(mode)}
              className={`px-2 py-1 text-[10px] rounded font-medium transition-colors ${
                responseViewMode === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Response Tabs */}
      <Tabs
        value={responseTab}
        onValueChange={(v) => setResponseTab(v as typeof responseTab)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          <TabsTrigger
            value="body"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs"
          >
            Body
          </TabsTrigger>
          <TabsTrigger
            value="headers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs"
          >
            Headers
            {headerEntries.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                {headerEntries.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="body" className="mt-0 p-4">
            {responseViewMode === 'pretty' && <JsonViewer content={response.body} />}
            {responseViewMode === 'raw' && (
              <pre className="text-sm font-mono whitespace-pre-wrap break-all p-4 bg-muted/50 rounded-md overflow-auto max-h-[500px]">
                {response.body}
              </pre>
            )}
            {responseViewMode === 'preview' && (
              <div
                className="p-4 bg-white dark:bg-gray-900 rounded-md border overflow-auto max-h-[500px]"
                dangerouslySetInnerHTML={{ __html: response.body }}
              />
            )}
          </TabsContent>

          <TabsContent value="headers" className="mt-0 p-4">
            {headerEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No response headers</p>
            ) : (
              <div className="space-y-1">
                {headerEntries.map(([key, value]) => (
                  <div key={key} className="flex gap-3 py-1.5 border-b border-dashed last:border-0">
                    <span className="text-xs font-mono font-medium text-primary min-w-[200px]">{key}</span>
                    <span className="text-xs font-mono text-muted-foreground break-all">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
