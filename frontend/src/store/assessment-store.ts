'use client';

import { create } from 'zustand';
import type { Assessment, AssessmentAttempt, Answer, Question } from '@/types';

interface AssessmentState {
  assessment: Assessment | null;
  attempt: AssessmentAttempt | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  currentSectionIndex: number;
  answers: Record<string, Answer>;
  remainingSeconds: number;
  isFullscreen: boolean;

  setAssessment: (assessment: Assessment) => void;
  setAttempt: (attempt: AssessmentAttempt) => void;
  setCurrentQuestion: (question: Question, index: number) => void;
  setCurrentSection: (index: number) => void;
  updateAnswer: (questionId: string, answer: Partial<Answer>) => void;
  setRemainingSeconds: (seconds: number) => void;
  decrementTimer: () => void;
  setFullscreen: (value: boolean) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  assessment: null,
  attempt: null,
  currentQuestion: null,
  currentQuestionIndex: 0,
  currentSectionIndex: 0,
  answers: {},
  remainingSeconds: 0,
  isFullscreen: false,

  setAssessment: (assessment) =>
    set({ assessment, remainingSeconds: assessment.totalDuration * 60 }),
  setAttempt: (attempt) => set({ attempt }),
  setCurrentQuestion: (question, index) =>
    set({ currentQuestion: question, currentQuestionIndex: index }),
  setCurrentSection: (index) => set({ currentSectionIndex: index }),
  updateAnswer: (questionId, answer) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: { ...state.answers[questionId], ...answer } as Answer,
      },
    })),
  setRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),
  decrementTimer: () =>
    set((state) => ({
      remainingSeconds: Math.max(0, state.remainingSeconds - 1),
    })),
  setFullscreen: (value) => set({ isFullscreen: value }),
  reset: () =>
    set({
      assessment: null,
      attempt: null,
      currentQuestion: null,
      currentQuestionIndex: 0,
      currentSectionIndex: 0,
      answers: {},
      remainingSeconds: 0,
      isFullscreen: false,
    }),
}));
