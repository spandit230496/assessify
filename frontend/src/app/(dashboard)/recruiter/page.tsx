'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Users,
  BookOpen,
  BarChart3,
  Send,
  Clock,
  CheckCircle2,
  FileText,
  Zap,
  Settings,
  Bell,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const myAssessments = [
  { id: '1', title: 'Frontend Developer Assessment', status: 'ACTIVE', candidates: 45, avgScore: 72, created: '2026-05-18' },
  { id: '2', title: 'React Senior Engineer', status: 'DRAFT', candidates: 0, avgScore: 0, created: '2026-05-22' },
  { id: '3', title: 'JavaScript Fundamentals', status: 'COMPLETED', candidates: 120, avgScore: 68, created: '2026-05-10' },
];

const pendingInvitations = [
  { name: 'Emily Chen', email: 'emily@example.com', assessment: 'Frontend Test', sentAt: '2026-05-22' },
  { name: 'Ryan Park', email: 'ryan@example.com', assessment: 'Frontend Test', sentAt: '2026-05-21' },
];

export default function RecruiterDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r bg-card min-h-screen hidden lg:flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg">Assessify</span>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Recruiter</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {[
              { label: 'Dashboard', icon: BarChart3, active: true },
              { label: 'My Assessments', icon: BookOpen },
              { label: 'Candidates', icon: Users },
              { label: 'Invitations', icon: Send },
              { label: 'Reports', icon: FileText },
              { label: 'Settings', icon: Settings },
            ].map((item) => (
              <Link
                key={item.label}
                href="/recruiter"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  item.active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">JR</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Jane Recruiter</p>
                <p className="text-xs text-muted-foreground truncate">recruiter@assessify.com</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage assessments and track candidates</p>
              </div>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Create Assessment</Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Assessments', value: '12', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Active Tests', value: '3', icon: Clock, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Total Candidates', value: '287', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { label: 'Avg Score', value: '71%', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>My Assessments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {myAssessments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm">{a.title}</h3>
                            <Badge variant={a.status === 'ACTIVE' ? 'default' : a.status === 'COMPLETED' ? 'success' : 'secondary'}>
                              {a.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span><Users className="h-3 w-3 inline mr-1" />{a.candidates} candidates</span>
                            {a.avgScore > 0 && <span><BarChart3 className="h-3 w-3 inline mr-1" />Avg: {a.avgScore}%</span>}
                            <span><Calendar className="h-3 w-3 inline mr-1" />{a.created}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm"><Send className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pending Invitations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingInvitations.map((inv, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{inv.name[0]}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{inv.name}</p>
                          <p className="text-xs text-muted-foreground">{inv.assessment}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Pending</Badge>
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
