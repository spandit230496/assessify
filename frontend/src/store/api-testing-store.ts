import { create } from 'zustand';
import type {
  HttpMethod,
  ApiAuthType,
  ApiBodyType,
  ApiWorkspace,
  ApiCollection,
  ApiRequestItem,
  ApiHistoryItem,
  ApiEnvironment,
} from '@/types';

interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

interface ActiveRequest {
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  pathParams: KeyValuePair[];
  authType: ApiAuthType;
  authConfig: Record<string, unknown>;
  bodyType: ApiBodyType;
  body: string;
  preRequestScript: string;
  testScript: string;
}

interface ResponseData {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  responseTimeMs: number;
  responseSizeBytes: number;
  error?: string;
}

type SidebarTab = 'collections' | 'history' | 'environments';
type RequestTab = 'params' | 'authorization' | 'headers' | 'body' | 'tests' | 'scripts' | 'cookies';
type ResponseTab = 'body' | 'headers' | 'cookies' | 'timeline';
type ResponseViewMode = 'pretty' | 'raw' | 'preview';

interface ApiTestingState {
  workspaces: ApiWorkspace[];
  activeWorkspace: ApiWorkspace | null;
  collections: ApiCollection[];
  activeRequest: ActiveRequest;
  savedRequestId: string | null;
  response: ResponseData | null;
  isLoading: boolean;
  isExecuting: boolean;
  history: ApiHistoryItem[];
  environments: ApiEnvironment[];
  activeEnvironmentId: string | null;
  sidebarTab: SidebarTab;
  requestTab: RequestTab;
  responseTab: ResponseTab;
  responseViewMode: ResponseViewMode;
  sidebarOpen: boolean;

  setWorkspaces: (workspaces: ApiWorkspace[]) => void;
  setActiveWorkspace: (workspace: ApiWorkspace | null) => void;
  setCollections: (collections: ApiCollection[]) => void;
  setActiveRequest: (request: Partial<ActiveRequest>) => void;
  resetActiveRequest: () => void;
  setSavedRequestId: (id: string | null) => void;
  setResponse: (response: ResponseData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsExecuting: (executing: boolean) => void;
  setHistory: (history: ApiHistoryItem[]) => void;
  addHistoryItem: (item: ApiHistoryItem) => void;
  setEnvironments: (environments: ApiEnvironment[]) => void;
  setActiveEnvironmentId: (id: string | null) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setRequestTab: (tab: RequestTab) => void;
  setResponseTab: (tab: ResponseTab) => void;
  setResponseViewMode: (mode: ResponseViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  loadFromSavedRequest: (request: ApiRequestItem) => void;
}

const defaultRequest: ActiveRequest = {
  method: 'GET',
  url: '',
  headers: [{ key: '', value: '', enabled: true }],
  queryParams: [{ key: '', value: '', enabled: true }],
  pathParams: [{ key: '', value: '', enabled: true }],
  authType: 'NONE',
  authConfig: {},
  bodyType: 'NONE',
  body: '',
  preRequestScript: '',
  testScript: '',
};

export const useApiTestingStore = create<ApiTestingState>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  collections: [],
  activeRequest: { ...defaultRequest },
  savedRequestId: null,
  response: null,
  isLoading: false,
  isExecuting: false,
  history: [],
  environments: [],
  activeEnvironmentId: null,
  sidebarTab: 'collections',
  requestTab: 'params',
  responseTab: 'body',
  responseViewMode: 'pretty',
  sidebarOpen: true,

  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setCollections: (collections) => set({ collections }),
  setActiveRequest: (request) =>
    set((state) => ({ activeRequest: { ...state.activeRequest, ...request } })),
  resetActiveRequest: () => set({ activeRequest: { ...defaultRequest }, savedRequestId: null, response: null }),
  setSavedRequestId: (id) => set({ savedRequestId: id }),
  setResponse: (response) => set({ response }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setHistory: (history) => set({ history }),
  addHistoryItem: (item) => set((state) => ({ history: [item, ...state.history] })),
  setEnvironments: (environments) => set({ environments }),
  setActiveEnvironmentId: (id) => set({ activeEnvironmentId: id }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setRequestTab: (tab) => set({ requestTab: tab }),
  setResponseTab: (tab) => set({ responseTab: tab }),
  setResponseViewMode: (mode) => set({ responseViewMode: mode }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  loadFromSavedRequest: (request) =>
    set({
      savedRequestId: request.id,
      activeRequest: {
        method: request.method,
        url: request.url,
        headers: request.headers
          ? Object.entries(request.headers).map(([key, value]) => ({ key, value, enabled: true }))
          : [{ key: '', value: '', enabled: true }],
        queryParams: request.queryParams
          ? Object.entries(request.queryParams).map(([key, value]) => ({ key, value, enabled: true }))
          : [{ key: '', value: '', enabled: true }],
        pathParams: request.pathParams
          ? Object.entries(request.pathParams).map(([key, value]) => ({ key, value, enabled: true }))
          : [{ key: '', value: '', enabled: true }],
        authType: request.authType,
        authConfig: request.authConfig ?? {},
        bodyType: request.bodyType,
        body: request.body ?? '',
        preRequestScript: request.preRequestScript ?? '',
        testScript: request.testScript ?? '',
      },
      response: null,
    }),
}));
