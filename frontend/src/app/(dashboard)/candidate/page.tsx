'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Trophy,
  Calendar,
  ArrowRight,
  FileText,
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  Zap,
  CheckCircle2,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const assessments = [
  {
    id: '1',
    title: 'Frontend Developer Assessment',
    description: 'HTML, CSS, JavaScript, React — 15 questions',
    duration: 60,
    totalMarks: 100,
    status: 'pending' as const,
    deadline: '2026-06-01T23:59:00Z',
    tags: ['frontend', 'react', 'javascript'],
  },
  {
    id: '2',
    title: 'Full Stack Engineer Test',
    description: 'Node.js, PostgreSQL, REST APIs, System Design',
    duration: 90,
    totalMarks: 150,
    status: 'pending' as const,
    deadline: '2026-06-15T23:59:00Z',
    tags: ['backend', 'nodejs', 'sql'],
  },
  {
    id: '3',
    title: 'Python Data Structures',
    description: 'Arrays, Trees, Graphs, Dynamic Programming',
    duration: 45,
    totalMarks: 80,
    status: 'completed' as const,
    score: 72,
    percentage: 90,
    tags: ['python', 'algorithms'],
  },
];

const recentResults = [
  { title: 'Python Data Structures', score: 72, total: 80, percentage: 90, date: '2026-05-20' },
  { title: 'SQL Fundamentals', score: 38, total: 50, percentage: 76, date: '2026-05-15' },
];

export default function CandidateDashboard() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-screen hidden lg:flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Assessify</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/candidate" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
              <BookOpen className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/candidate" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground text-sm">
              <FileText className="h-4 w-4" /> My Assessments
            </Link>
            <Link href="/candidate" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground text-sm">
              <Trophy className="h-4 w-4" /> Results
            </Link>
            <Link href="/candidate" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground text-sm">
              <Bell className="h-4 w-4" /> Notifications
            </Link>
            <Link href="/candidate" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground text-sm">
              <User className="h-4 w-4" /> Profile
            </Link>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">JC</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Candidate</p>
                <p className="text-xs text-muted-foreground truncate">candidate@assessify.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top bar */}
          <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, John</h1>
                <p className="text-sm text-muted-foreground">Here&apos;s your assessment overview</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending Tests', value: '2', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Completed', value: '5', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Avg Score', value: '83%', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                { label: 'Upcoming', value: '1', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Assessments List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Assessments</CardTitle>
                    <CardDescription>Complete your pending assessments before their deadlines</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assessments.map((assessment, i) => (
                      <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{assessment.title}</h3>
                              <Badge variant={assessment.status === 'completed' ? 'success' : 'secondary'}>
                                {assessment.status === 'completed' ? 'Completed' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{assessment.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Timer className="h-3 w-3" /> {assessment.duration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" /> {assessment.totalMarks} marks
                              </span>
                              {assessment.deadline && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due: {new Date(assessment.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              {assessment.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="ml-4">
                            {assessment.status === 'completed' ? (
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">{assessment.percentage}%</p>
                                <p className="text-xs text-muted-foreground">
                                  {assessment.score}/{assessment.totalMarks}
                                </p>
                              </div>
                            ) : (
                              <Link href="/system-check">
                                <Button size="sm" className="gap-2">
                                  Start <ArrowRight className="h-3 w-3" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                        {assessment.status === 'completed' && (
                          <div className="mt-3">
                            <Progress value={assessment.percentage} className="h-2" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Results */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentResults.map((result, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{result.title}</p>
                          <Badge variant={result.percentage >= 80 ? 'success' : result.percentage >= 60 ? 'default' : 'destructive'}>
                            {result.percentage}%
                          </Badge>
                        </div>
                        <Progress value={result.percentage} className="h-1.5" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{result.score}/{result.total} marks</span>
                          <span>{result.date}</span>
                        </div>
                        {i < recentResults.length - 1 && <Separator />}
                      </div>
                    ))}

                    <Button variant="outline" className="w-full mt-2" size="sm">
                      View All Results
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assessments
                      .filter((a) => a.status === 'pending')
                      .map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1">{a.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {a.deadline && new Date(a.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
