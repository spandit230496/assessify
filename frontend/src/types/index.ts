export type Role = 'SUPER_ADMIN' | 'RECRUITER' | 'INTERVIEWER' | 'CANDIDATE' | 'PROCTOR';

export type QuestionType = 'MCQ' | 'MSQ' | 'TRUE_FALSE' | 'CODING' | 'SQL' | 'DRAG_DROP' | 'FILL_BLANK' | 'VIDEO_RESPONSE';

export type AnswerStatus = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type AttemptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'TIMED_OUT' | 'DISQUALIFIED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresMfa?: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  status: AssessmentStatus;
  totalDuration: number;
  totalMarks: number;
  passingPercentage: number;
  negativeMarking: boolean;
  randomizeQuestions: boolean;
  webcamRequired: boolean;
  fullscreenRequired: boolean;
  tags: string[];
  startDate?: string;
  endDate?: string;
  createdBy: { id: string; firstName: string; lastName: string };
  sections: Section[];
  _count?: { invitations: number; attempts: number; sections: number };
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration?: number;
  totalMarks: number;
  questions: Question[];
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  title: string;
  body: string;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  timeLimitSeconds?: number;
  order: number;
  tags: string[];
  options: Option[];
  codingConfig?: CodingConfig;
  testCases?: TestCase[];
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  imageUrl?: string;
}

export interface CodingConfig {
  languages: string[];
  boilerplateCode?: Record<string, string>;
  timeLimitMs: number;
  memoryLimitMb: number;
}

export interface TestCase {
  id: string;
  input: string;
  expected: string;
  isHidden: boolean;
  order: number;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  status: AttemptStatus;
  startedAt?: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  status: AnswerStatus;
  selectedOptionIds: string[];
  textAnswer?: string;
  codeAnswer?: { language: string; code: string };
  score: number;
  isCorrect?: boolean;
  timeTakenSeconds: number;
}

export interface Violation {
  type: string;
  details?: string;
  timestamp: string;
  screenshot?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAssessments: number;
  totalAttempts: number;
  completedAttempts: number;
  completionRate: string;
  averageScore: string;
}

export interface SystemCheck {
  name: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  details?: string;
}

// ─── API Testing Types ──────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type ApiAuthType = 'NONE' | 'BEARER_TOKEN' | 'BASIC_AUTH' | 'API_KEY' | 'OAUTH2';
export type ApiBodyType = 'NONE' | 'JSON' | 'XML' | 'FORM_DATA' | 'MULTIPART' | 'RAW' | 'BINARY' | 'GRAPHQL';
export type ApiRequestStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'CANCELLED';
export type ApiWorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type ApiProtocol = 'REST' | 'GRAPHQL' | 'WEBSOCKET' | 'GRPC';

export interface ApiWorkspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPersonal: boolean;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; firstName: string; lastName: string; email: string };
  _count?: { collections: number; teamMembers: number; environments: number };
  collections?: ApiCollection[];
  environments?: ApiEnvironment[];
  teamMembers?: ApiTeamMember[];
  variables?: ApiVariable[];
}

export interface ApiCollection {
  id: string;
  workspaceId: string;
  parentId?: string;
  name: string;
  description?: string;
  order: number;
  children?: ApiCollection[];
  requests?: ApiRequestItem[];
}

export interface ApiRequestItem {
  id: string;
  collectionId: string;
  name: string;
  description?: string;
  method: HttpMethod;
  url: string;
  protocol: ApiProtocol;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  pathParams?: Record<string, string>;
  cookies?: Record<string, string>;
  authType: ApiAuthType;
  authConfig?: Record<string, unknown>;
  bodyType: ApiBodyType;
  body?: string;
  preRequestScript?: string;
  testScript?: string;
  timeoutMs: number;
  followRedirects: boolean;
  retryCount: number;
  retryDelayMs: number;
  order: number;
  responses?: ApiResponseItem[];
  testCases?: ApiTestCaseItem[];
  assertions?: ApiAssertionItem[];
}

export interface ApiEnvironment {
  id: string;
  workspaceId: string;
  name: string;
  variables: ApiEnvVariable[];
  isActive: boolean;
}

export interface ApiEnvVariable {
  key: string;
  value: string;
  enabled?: boolean;
  isSecret?: boolean;
}

export interface ApiHistoryItem {
  id: string;
  requestId?: string;
  userId: string;
  method: HttpMethod;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  statusCode?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  responseTimeMs?: number;
  responseSizeBytes?: number;
  error?: string;
  status: ApiRequestStatus;
  createdAt: string;
}

export interface ApiResponseItem {
  id: string;
  requestId: string;
  name: string;
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
  responseTimeMs?: number;
}

export interface ApiTestCaseItem {
  id: string;
  requestId: string;
  name: string;
  script: string;
  isActive: boolean;
  lastResult?: Record<string, unknown>;
}

export interface ApiAssertionItem {
  id: string;
  requestId: string;
  name: string;
  property: string;
  comparison: string;
  expectedValue: string;
  isActive: boolean;
  lastResult?: boolean;
}

export interface ApiVariable {
  id: string;
  workspaceId: string;
  key: string;
  value: string;
  isSecret: boolean;
  scope: string;
}

export interface ApiTeamMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: ApiWorkspaceRole;
  joinedAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string };
}
