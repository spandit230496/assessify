'use client';

import { useCallback } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useApiTestingStore } from '@/store/api-testing-store';
import { api } from '@/services/api';
import type { HttpMethod, ApiAuthType, ApiBodyType, ApiHistoryItem } from '@/types';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const methodColorMap: Record<HttpMethod, string> = {
  GET: 'text-green-600',
  POST: 'text-yellow-600',
  PUT: 'text-blue-600',
  PATCH: 'text-purple-600',
  DELETE: 'text-red-600',
  HEAD: 'text-gray-600',
  OPTIONS: 'text-gray-600',
};

interface KeyValueRowProps {
  pair: { key: string; value: string; enabled: boolean };
  onChange: (pair: { key: string; value: string; enabled: boolean }) => void;
  onRemove: () => void;
}

function KeyValueRow({ pair, onChange, onRemove }: KeyValueRowProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={pair.enabled}
        onChange={(e) => onChange({ ...pair, enabled: e.target.checked })}
        className="h-4 w-4 rounded border-gray-300"
      />
      <Input
        placeholder="Key"
        value={pair.key}
        onChange={(e) => onChange({ ...pair, key: e.target.value })}
        className="h-8 text-sm flex-1"
      />
      <Input
        placeholder="Value"
        value={pair.value}
        onChange={(e) => onChange({ ...pair, value: e.target.value })}
        className="h-8 text-sm flex-1"
      />
      <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0">
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}

function KeyValueEditor({
  pairs,
  onChange,
  addLabel = 'Add',
}: {
  pairs: { key: string; value: string; enabled: boolean }[];
  onChange: (pairs: { key: string; value: string; enabled: boolean }[]) => void;
  addLabel?: string;
}) {
  const updatePair = (index: number, pair: { key: string; value: string; enabled: boolean }) => {
    const newPairs = [...pairs];
    newPairs[index] = pair;
    onChange(newPairs);
  };

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    if (newPairs.length === 0) newPairs.push({ key: '', value: '', enabled: true });
    onChange(newPairs);
  };

  const addPair = () => {
    onChange([...pairs, { key: '', value: '', enabled: true }]);
  };

  return (
    <div className="space-y-2">
      {pairs.map((pair, i) => (
        <KeyValueRow key={i} pair={pair} onChange={(p) => updatePair(i, p)} onRemove={() => removePair(i)} />
      ))}
      <Button variant="ghost" size="sm" onClick={addPair} className="h-7 text-xs">
        <Plus className="h-3 w-3 mr-1" /> {addLabel}
      </Button>
    </div>
  );
}

export function RequestBuilder() {
  const {
    activeRequest,
    setActiveRequest,
    requestTab,
    setRequestTab,
    isExecuting,
    setIsExecuting,
    setResponse,
    addHistoryItem,
  } = useApiTestingStore();

  const handleSend = useCallback(async () => {
    if (!activeRequest.url.trim()) return;
    setIsExecuting(true);
    setResponse(null);

    try {
      const headers: Record<string, string> = {};
      activeRequest.headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => { headers[h.key] = h.value; });

      const queryParams: Record<string, string> = {};
      activeRequest.queryParams
        .filter((p) => p.enabled && p.key.trim())
        .forEach((p) => { queryParams[p.key] = p.value; });

      const pathParams: Record<string, string> = {};
      activeRequest.pathParams
        .filter((p) => p.enabled && p.key.trim())
        .forEach((p) => { pathParams[p.key] = p.value; });

      const payload = {
        method: activeRequest.method,
        url: activeRequest.url,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        pathParams: Object.keys(pathParams).length > 0 ? pathParams : undefined,
        authType: activeRequest.authType !== 'NONE' ? activeRequest.authType : undefined,
        authConfig: activeRequest.authType !== 'NONE' ? activeRequest.authConfig : undefined,
        bodyType: activeRequest.bodyType !== 'NONE' ? activeRequest.bodyType : undefined,
        body: activeRequest.body || undefined,
      };

      const result = await api.post<{ historyId: string }>('/api-testing/execute', payload);

      // Poll for result
      let attempts = 0;
      const maxAttempts = 60;
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500));
        const historyItem = await api.get<{ data: ApiHistoryItem }>(`/api-testing/history/${result.historyId}`);
        const item = historyItem.data ?? historyItem;

        if (item.status === 'SUCCESS' || item.status === 'ERROR' || item.status === 'TIMEOUT') {
          setResponse({
            statusCode: item.statusCode ?? 0,
            headers: (item.responseHeaders ?? {}) as Record<string, string>,
            body: item.responseBody ?? '',
            responseTimeMs: item.responseTimeMs ?? 0,
            responseSizeBytes: item.responseSizeBytes ?? 0,
            error: item.error,
          });
          addHistoryItem(item);
          break;
        }
        attempts++;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setResponse({
        statusCode: 0,
        headers: {},
        body: '',
        responseTimeMs: 0,
        responseSizeBytes: 0,
        error: errorMessage,
      });
    } finally {
      setIsExecuting(false);
    }
  }, [activeRequest, setIsExecuting, setResponse, addHistoryItem]);

  return (
    <div className="flex flex-col h-full">
      {/* URL Bar */}
      <div className="flex items-center gap-2 p-3 border-b">
        <select
          value={activeRequest.method}
          onChange={(e) => setActiveRequest({ method: e.target.value as HttpMethod })}
          className={`h-9 px-3 rounded-md border bg-background text-sm font-bold ${methodColorMap[activeRequest.method]} focus:outline-none focus:ring-2 focus:ring-ring`}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <Input
          placeholder="Enter request URL (e.g. https://api.example.com/users)"
          value={activeRequest.url}
          onChange={(e) => setActiveRequest({ url: e.target.value })}
          className="flex-1 h-9 font-mono text-sm"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        />

        <Button onClick={handleSend} disabled={isExecuting || !activeRequest.url.trim()} className="h-9 gap-1.5">
          {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </Button>
      </div>

      {/* Request Tabs */}
      <Tabs
        value={requestTab}
        onValueChange={(v) => setRequestTab(v as typeof requestTab)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          {(['params', 'authorization', 'headers', 'body', 'tests', 'scripts'] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-medium capitalize"
            >
              {tab}
              {tab === 'headers' && activeRequest.headers.filter((h) => h.key.trim()).length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {activeRequest.headers.filter((h) => h.key.trim()).length}
                </Badge>
              )}
              {tab === 'params' && activeRequest.queryParams.filter((p) => p.key.trim()).length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {activeRequest.queryParams.filter((p) => p.key.trim()).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="params" className="mt-0 space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Query Parameters</Label>
              <KeyValueEditor
                pairs={activeRequest.queryParams}
                onChange={(queryParams) => setActiveRequest({ queryParams })}
                addLabel="Add Parameter"
              />
            </div>
            <Separator />
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Path Parameters</Label>
              <KeyValueEditor
                pairs={activeRequest.pathParams}
                onChange={(pathParams) => setActiveRequest({ pathParams })}
                addLabel="Add Path Param"
              />
            </div>
          </TabsContent>

          <TabsContent value="authorization" className="mt-0 space-y-4">
            <div>
              <Label className="text-xs font-medium mb-2 block">Auth Type</Label>
              <select
                value={activeRequest.authType}
                onChange={(e) => setActiveRequest({ authType: e.target.value as ApiAuthType, authConfig: {} })}
                className="h-9 w-full px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="NONE">No Auth</option>
                <option value="BEARER_TOKEN">Bearer Token</option>
                <option value="BASIC_AUTH">Basic Auth</option>
                <option value="API_KEY">API Key</option>
                <option value="OAUTH2">OAuth 2.0</option>
              </select>
            </div>

            {activeRequest.authType === 'BEARER_TOKEN' && (
              <div>
                <Label className="text-xs font-medium mb-2 block">Token</Label>
                <Input
                  placeholder="Enter token"
                  value={(activeRequest.authConfig.token as string) ?? ''}
                  onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, token: e.target.value } })}
                  className="h-9 text-sm font-mono"
                />
              </div>
            )}

            {activeRequest.authType === 'BASIC_AUTH' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Username</Label>
                  <Input
                    placeholder="Username"
                    value={(activeRequest.authConfig.username as string) ?? ''}
                    onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, username: e.target.value } })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Password</Label>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={(activeRequest.authConfig.password as string) ?? ''}
                    onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, password: e.target.value } })}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}

            {activeRequest.authType === 'API_KEY' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Key</Label>
                  <Input
                    placeholder="Header name (e.g. X-API-Key)"
                    value={(activeRequest.authConfig.key as string) ?? ''}
                    onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, key: e.target.value } })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Value</Label>
                  <Input
                    placeholder="API key value"
                    value={(activeRequest.authConfig.value as string) ?? ''}
                    onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, value: e.target.value } })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Add to</Label>
                  <select
                    value={(activeRequest.authConfig.placement as string) ?? 'header'}
                    onChange={(e) => setActiveRequest({ authConfig: { ...activeRequest.authConfig, placement: e.target.value } })}
                    className="h-9 w-full px-3 rounded-md border bg-background text-sm"
                  >
                    <option value="header">Header</option>
                    <option value="query">Query Params</option>
                  </select>
                </div>
              </div>
            )}

            {activeRequest.authType === 'NONE' && (
              <p className="text-sm text-muted-foreground">This request does not use any authorization.</p>
            )}
          </TabsContent>

          <TabsContent value="headers" className="mt-0">
            <KeyValueEditor
              pairs={activeRequest.headers}
              onChange={(headers) => setActiveRequest({ headers })}
              addLabel="Add Header"
            />
          </TabsContent>

          <TabsContent value="body" className="mt-0 space-y-4">
            <div>
              <Label className="text-xs font-medium mb-2 block">Content Type</Label>
              <div className="flex gap-2 flex-wrap">
                {(['NONE', 'JSON', 'XML', 'FORM_DATA', 'RAW', 'GRAPHQL'] as ApiBodyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveRequest({ bodyType: type })}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      activeRequest.bodyType === type
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {type === 'NONE' ? 'None' : type === 'FORM_DATA' ? 'Form Data' : type}
                  </button>
                ))}
              </div>
            </div>

            {activeRequest.bodyType !== 'NONE' && (
              <div>
                <Label className="text-xs font-medium mb-2 block">Body</Label>
                <textarea
                  value={activeRequest.body}
                  onChange={(e) => setActiveRequest({ body: e.target.value })}
                  placeholder={activeRequest.bodyType === 'JSON' ? '{\n  "key": "value"\n}' : 'Enter request body'}
                  className="w-full h-48 p-3 rounded-md border bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="tests" className="mt-0">
            <div>
              <Label className="text-xs font-medium mb-2 block">Test Script</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Write test assertions that run after the response is received.
              </p>
              <textarea
                value={activeRequest.testScript}
                onChange={(e) => setActiveRequest({ testScript: e.target.value })}
                placeholder={'// Example test script\n// pm.test("Status is 200", () => {\n//   pm.response.to.have.status(200);\n// });'}
                className="w-full h-48 p-3 rounded-md border bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </TabsContent>

          <TabsContent value="scripts" className="mt-0">
            <div>
              <Label className="text-xs font-medium mb-2 block">Pre-request Script</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Scripts that run before the request is sent.
              </p>
              <textarea
                value={activeRequest.preRequestScript}
                onChange={(e) => setActiveRequest({ preRequestScript: e.target.value })}
                placeholder={'// Example pre-request script\n// pm.environment.set("timestamp", Date.now());'}
                className="w-full h-48 p-3 rounded-md border bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
