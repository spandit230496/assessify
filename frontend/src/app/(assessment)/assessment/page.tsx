'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  Eye,
  BookOpen,
  CheckCircle2,
  Circle,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatTime } from '@/lib/utils';

interface QuestionData {
  id: string;
  type: 'MCQ' | 'MSQ' | 'TRUE_FALSE' | 'CODING' | 'FILL_BLANK';
  title: string;
  body: string;
  marks: number;
  options: { id: string; text: string; order: number }[];
}

type QuestionStatus = 'not_visited' | 'visited' | 'answered' | 'marked' | 'answered_marked';

const SAMPLE_QUESTIONS: QuestionData[] = [
  {
    id: '1', type: 'MCQ', title: 'HTML Semantic Elements', marks: 5,
    body: 'Which HTML5 element is used to define navigation links?',
    options: [
      { id: 'a', text: '<navigation>', order: 0 },
      { id: 'b', text: '<nav>', order: 1 },
      { id: 'c', text: '<navigate>', order: 2 },
      { id: 'd', text: '<navbar>', order: 3 },
    ],
  },
  {
    id: '2', type: 'MCQ', title: 'CSS Flexbox', marks: 5,
    body: 'Which CSS property is used to align items along the cross axis in a flex container?',
    options: [
      { id: 'a', text: 'justify-content', order: 0 },
      { id: 'b', text: 'align-items', order: 1 },
      { id: 'c', text: 'flex-direction', order: 2 },
      { id: 'd', text: 'flex-wrap', order: 3 },
    ],
  },
  {
    id: '3', type: 'TRUE_FALSE', title: 'CSS Box Model', marks: 5,
    body: 'In the CSS box model, padding is the space between the content and the border.',
    options: [
      { id: 'a', text: 'True', order: 0 },
      { id: 'b', text: 'False', order: 1 },
    ],
  },
  {
    id: '4', type: 'MCQ', title: 'JavaScript Closures', marks: 10,
    body: 'What will be the output of the following code?\n\n```javascript\nfunction outer() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}\nconst fn = outer();\nconsole.log(fn(), fn(), fn());\n```',
    options: [
      { id: 'a', text: '1 1 1', order: 0 },
      { id: 'b', text: '1 2 3', order: 1 },
      { id: 'c', text: '0 1 2', order: 2 },
      { id: 'd', text: 'undefined undefined undefined', order: 3 },
    ],
  },
  {
    id: '5', type: 'MSQ', title: 'React Hooks', marks: 10,
    body: 'Which of the following are valid React hooks? (Select all that apply)',
    options: [
      { id: 'a', text: 'useState', order: 0 },
      { id: 'b', text: 'useEffect', order: 1 },
      { id: 'c', text: 'useClass', order: 2 },
      { id: 'd', text: 'useMemo', order: 3 },
      { id: 'e', text: 'useRender', order: 4 },
    ],
  },
  {
    id: '6', type: 'FILL_BLANK', title: 'React Virtual DOM', marks: 5,
    body: 'React uses a _______ to efficiently update the real DOM by comparing changes.',
    options: [],
  },
];

export default function AssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>(
    Object.fromEntries(SAMPLE_QUESTIONS.map((q) => [q.id, 'not_visited']))
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const question = SAMPLE_QUESTIONS[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setStatuses((prev) => {
      const qId = question.id;
      if (prev[qId] === 'not_visited') {
        return { ...prev, [qId]: 'visited' };
      }
      return prev;
    });
  }, [currentIndex, question.id]);

  const selectOption = useCallback(
    (optionId: string) => {
      const q = SAMPLE_QUESTIONS[currentIndex];
      if (q.type === 'MSQ') {
        setAnswers((prev) => {
          const current = prev[q.id] || [];
          const updated = current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
          return { ...prev, [q.id]: updated };
        });
      } else {
        setAnswers((prev) => ({ ...prev, [q.id]: [optionId] }));
      }
      setStatuses((prev) => ({ ...prev, [q.id]: 'answered' }));
    },
    [currentIndex]
  );

  const markForReview = () => {
    const qId = question.id;
    setStatuses((prev) => ({
      ...prev,
      [qId]: prev[qId] === 'answered' ? 'answered_marked' : 'marked',
    }));
  };

  const navigateTo = (index: number) => {
    if (index >= 0 && index < SAMPLE_QUESTIONS.length) {
      setCurrentIndex(index);
    }
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'marked': return 'bg-purple-500 text-white';
      case 'answered_marked': return 'bg-blue-500 text-white';
      case 'visited': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isTimeLow = remainingSeconds < 300;

  const summary = {
    answered: Object.values(statuses).filter((s) => s === 'answered' || s === 'answered_marked').length,
    unanswered: Object.values(statuses).filter((s) => s === 'visited' || s === 'not_visited').length,
    marked: Object.values(statuses).filter((s) => s === 'marked' || s === 'answered_marked').length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Timer Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">Frontend Developer Assessment</h1>
              <p className="text-xs text-muted-foreground">Section: HTML & CSS</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                isTimeLow ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted'
              }`}>
                <Clock className="h-5 w-5" />
                {formatTime(remainingSeconds)}
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setShowSubmitDialog(true)}
              >
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Q{currentIndex + 1}</Badge>
                      <Badge variant="secondary">{question.type}</Badge>
                      <Badge variant={question.marks >= 10 ? 'default' : 'secondary'}>
                        {question.marks} marks
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={markForReview} className="gap-2">
                      <Bookmark className="h-4 w-4" />
                      Mark for Review
                    </Button>
                  </div>
                  <CardTitle className="text-lg mt-2">{question.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 whitespace-pre-wrap text-sm leading-relaxed">
                    {question.body}
                  </div>

                  {/* Options */}
                  {question.options.length > 0 && (
                    <div className="space-y-3">
                      {question.type === 'MSQ' && (
                        <p className="text-xs text-muted-foreground mb-2">Select all correct answers</p>
                      )}
                      {question.options.map((option) => {
                        const isSelected = (answers[question.id] || []).includes(option.id);
                        return (
                          <button
                            key={option.id}
                            onClick={() => selectOption(option.id)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                                }`}
                              >
                                {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span className="text-sm">{option.text}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in the blank */}
                  {question.type === 'FILL_BLANK' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Type your answer here..."
                        value={textAnswers[question.id] || ''}
                        onChange={(e) => {
                          setTextAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                          setStatuses((prev) => ({ ...prev, [question.id]: 'answered' }));
                        }}
                        className="w-full p-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => navigateTo(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} of {SAMPLE_QUESTIONS.length}
                    </span>
                    <Button
                      onClick={() => navigateTo(currentIndex + 1)}
                      disabled={currentIndex === SAMPLE_QUESTIONS.length - 1}
                      className="gap-2"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Question Navigation Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {SAMPLE_QUESTIONS.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => navigateTo(i)}
                      className={`h-10 w-10 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                        i === currentIndex ? 'ring-2 ring-primary ring-offset-2' : ''
                      } ${getStatusColor(statuses[q.id])}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Legend */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-500" />
                    <span>Answered ({summary.answered})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-red-500" />
                    <span>Visited ({Object.values(statuses).filter((s) => s === 'visited').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-purple-500" />
                    <span>Marked for Review ({summary.marked})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <span>Not Visited ({Object.values(statuses).filter((s) => s === 'not_visited').length})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-warning" />
              <h2 className="text-xl font-bold">Submit Assessment?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to submit? This action cannot be undone.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="p-3 rounded-lg bg-green-500/10">
                <div className="text-2xl font-bold text-green-600">{summary.answered}</div>
                <div className="text-xs text-muted-foreground">Answered</div>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <div className="text-2xl font-bold text-red-600">{summary.unanswered}</div>
                <div className="text-xs text-muted-foreground">Unanswered</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <div className="text-2xl font-bold text-purple-600">{summary.marked}</div>
                <div className="text-xs text-muted-foreground">Marked</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSubmitDialog(false)}>
                Go Back
              </Button>
              <Button variant="destructive" className="flex-1 gap-2">
                <Send className="h-4 w-4" /> Submit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
