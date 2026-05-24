'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowLeft,
  Download,
  Share2,
  Zap,
  Target,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const resultData = {
  assessmentTitle: 'Frontend Developer Assessment',
  totalScore: 78,
  maxScore: 100,
  percentage: 78,
  passed: true,
  passingPercentage: 60,
  timeSpent: '42 min 18 sec',
  totalQuestions: 15,
  correct: 11,
  incorrect: 3,
  unanswered: 1,
  sections: [
    { name: 'HTML & CSS', score: 25, total: 30, percentage: 83 },
    { name: 'JavaScript', score: 28, total: 40, percentage: 70 },
    { name: 'React', score: 25, total: 30, percentage: 83 },
  ],
  skillAnalysis: [
    { skill: 'HTML5 Semantics', level: 90 },
    { skill: 'CSS Flexbox/Grid', level: 85 },
    { skill: 'JavaScript Closures', level: 70 },
    { skill: 'React Hooks', level: 80 },
    { skill: 'State Management', level: 75 },
    { skill: 'Async Programming', level: 65 },
  ],
};

export default function ResultPage() {
  const isPassed = resultData.percentage >= resultData.passingPercentage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/candidate" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-3.5 w-3.5" /> Download Report
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl">
        {/* Score Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden">
            <div className={`h-2 ${isPassed ? 'bg-green-500' : 'bg-red-500'}`} />
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                {isPassed ? (
                  <Badge variant="success" className="text-sm px-3 py-1 gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-sm px-3 py-1 gap-1">
                    <XCircle className="h-3.5 w-3.5" /> NOT PASSED
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">{resultData.assessmentTitle}</h1>

              <div className="relative inline-flex items-center justify-center my-6">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={isPassed ? '#22c55e' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${resultData.percentage * 3.39} 339.292`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-4xl font-bold">{resultData.percentage}%</div>
                  <div className="text-sm text-muted-foreground">{resultData.totalScore}/{resultData.maxScore}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-green-600">{resultData.correct}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-red-600">{resultData.incorrect}</div>
                  <div className="text-xs text-muted-foreground">Incorrect</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-yellow-600">{resultData.unanswered}</div>
                  <div className="text-xs text-muted-foreground">Unanswered</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{resultData.timeSpent}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Time Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Section Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" /> Section Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resultData.sections.map((section, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{section.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {section.score}/{section.total} ({section.percentage}%)
                      </span>
                    </div>
                    <Progress
                      value={section.percentage}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Skill Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" /> Skill Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resultData.skillAnalysis.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm w-40 truncate">{skill.skill}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          skill.level >= 80 ? 'bg-green-500' :
                          skill.level >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{skill.level}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Link href="/candidate">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
