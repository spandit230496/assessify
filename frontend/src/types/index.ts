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
