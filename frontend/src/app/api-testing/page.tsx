'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ApiTestingSidebar } from '@/components/api-testing/sidebar';
import { RequestBuilder } from '@/components/api-testing/request-builder';
import { ResponseViewer } from '@/components/api-testing/response-viewer';
import { useApiTestingStore } from '@/store/api-testing-store';
import { api } from '@/services/api';
import type { ApiWorkspace, ApiHistoryItem } from '@/types';

export default function ApiTestingPage() {
  const {
    sidebarOpen,
    setSidebarOpen,
    resetActiveRequest,
    setWorkspaces,
    setHistory,
    activeWorkspace,
    setActiveWorkspace,
    setCollections,
    setEnvironments,
  } = useApiTestingStore();

  const loadWorkspaces = useCallback(async () => {
    try {
      const result = await api.get<{ data: ApiWorkspace[] } | ApiWorkspace[]>('/api-testing/workspaces');
      const workspaces = Array.isArray(result) ? result : (result.data ?? []);
      setWorkspaces(workspaces);
      if (workspaces.length > 0 && !activeWorkspace) {
        const full = await api.get<{ data: ApiWorkspace } | ApiWorkspace>(`/api-testing/workspaces/${workspaces[0].id}`);
        const ws = 'data' in full ? full.data : full;
        setActiveWorkspace(ws);
        setCollections(ws.collections ?? []);
        setEnvironments(ws.environments ?? []);
      }
    } catch {
      // user may not be authenticated yet
    }
  }, [setWorkspaces, setActiveWorkspace, setCollections, setEnvironments, activeWorkspace]);

  const loadHistory = useCallback(async () => {
    try {
      const result = await api.get<{ data: { items: ApiHistoryItem[] } } | { items: ApiHistoryItem[] }>('/api-testing/history?limit=50');
      const data = 'data' in result ? result.data : result;
      setHistory(data.items ?? []);
    } catch {
      // ignore
    }
  }, [setHistory]);

  useEffect(() => {
    loadWorkspaces();
    loadHistory();
  }, [loadWorkspaces, loadHistory]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="h-12 border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Assessify</span>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm font-medium text-muted-foreground">API Testing</span>
          {activeWorkspace && (
            <>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-muted-foreground">{activeWorkspace.name}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={resetActiveRequest} className="h-8 gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-14 z-10 bg-background border rounded-r-md p-1 hover:bg-muted transition-colors"
          style={{ display: sidebarOpen ? 'none' : 'block' }}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>

        {/* Sidebar */}
        <ApiTestingSidebar />

        {/* Center + Right */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Request Builder */}
          <div className="flex-1 border-r overflow-hidden flex flex-col min-w-0">
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute left-[17.5rem] top-14 z-10 bg-background border rounded-r-md p-1 hover:bg-muted transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
            <RequestBuilder />
          </div>

          {/* Response Viewer */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0 border-t lg:border-t-0">
            <ResponseViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
