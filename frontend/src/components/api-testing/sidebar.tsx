'use client';

import { useState } from 'react';
import {
  FolderOpen,
  History,
  Settings2,
  ChevronRight,
  ChevronDown,
  FileJson,
} from 'lucide-react';

import { MethodBadge } from './method-badge';
import { useApiTestingStore } from '@/store/api-testing-store';
import type { ApiCollection, ApiRequestItem } from '@/types';

function CollectionItem({
  collection,
  onSelectRequest,
  depth = 0,
}: {
  collection: ApiCollection;
  onSelectRequest: (req: ApiRequestItem) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (collection.children?.length ?? 0) > 0 || (collection.requests?.length ?? 0) > 0;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        ) : <div className="w-3.5" />}
        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{collection.name}</span>
      </button>

      {expanded && (
        <div>
          {collection.children?.map((child) => (
            <CollectionItem
              key={child.id}
              collection={child}
              onSelectRequest={onSelectRequest}
              depth={depth + 1}
            />
          ))}
          {collection.requests?.map((req) => (
            <button
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              <MethodBadge method={req.method} className="text-[10px] px-1 py-0" />
              <span className="truncate text-muted-foreground">{req.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryList() {
  const { history } = useApiTestingStore();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No history yet</p>
        <p className="text-xs text-muted-foreground mt-1">Send a request to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {history.map((item) => (
        <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md cursor-pointer">
          <MethodBadge method={item.method} className="text-[10px] px-1 py-0" />
          <span className="truncate text-xs text-muted-foreground flex-1">{item.url}</span>
          {item.statusCode && (
            <span className={`text-xs font-mono ${item.statusCode < 400 ? 'text-green-600' : 'text-red-600'}`}>
              {item.statusCode}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function EnvironmentList() {
  const { environments, activeEnvironmentId, setActiveEnvironmentId } = useApiTestingStore();

  if (environments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Settings2 className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No environments</p>
        <p className="text-xs text-muted-foreground mt-1">Create an environment to manage variables</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {environments.map((env) => (
        <button
          key={env.id}
          onClick={() => setActiveEnvironmentId(env.id === activeEnvironmentId ? null : env.id)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
            env.id === activeEnvironmentId ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          }`}
        >
          <Settings2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{env.name}</span>
          {env.isActive && <span className="ml-auto text-[10px] text-green-600 font-medium">Active</span>}
        </button>
      ))}
    </div>
  );
}

export function ApiTestingSidebar() {
  const { sidebarTab, setSidebarTab, collections, sidebarOpen } = useApiTestingStore();
  const { loadFromSavedRequest } = useApiTestingStore();

  if (!sidebarOpen) return null;

  const tabs = [
    { id: 'collections' as const, label: 'Collections', icon: FolderOpen },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'environments' as const, label: 'Env', icon: Settings2 },
  ];

  return (
    <div className="w-72 border-r bg-background flex flex-col h-full">
      <div className="flex items-center gap-1 p-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              sidebarTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sidebarTab === 'collections' && (
          <div className="space-y-1">
            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileJson className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No collections</p>
                <p className="text-xs text-muted-foreground mt-1">Create a collection to organize requests</p>
              </div>
            ) : (
              collections.map((col) => (
                <CollectionItem
                  key={col.id}
                  collection={col}
                  onSelectRequest={loadFromSavedRequest}
                />
              ))
            )}
          </div>
        )}
        {sidebarTab === 'history' && <HistoryList />}
        {sidebarTab === 'environments' && <EnvironmentList />}
      </div>
    </div>
  );
}
