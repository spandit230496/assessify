'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  BarChart3,
  Shield,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp,
  Activity,
  Eye,
  Download,
  Zap,
  Moon,
  Sun,
  LogOut,
  Home,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const recentAssessments = [
  { id: '1', title: 'Frontend Developer Assessment', candidates: 45, avgScore: 72, status: 'ACTIVE' },
  { id: '2', title: 'Backend Engineer Test', candidates: 32, avgScore: 68, status: 'PUBLISHED' },
  { id: '3', title: 'DevOps Assessment', candidates: 18, avgScore: 81, status: 'COMPLETED' },
  { id: '4', title: 'Data Science Challenge', candidates: 56, avgScore: 65, status: 'ACTIVE' },
];

const recentUsers = [
  { name: 'Alice Johnson', email: 'alice@example.com', role: 'CANDIDATE', joinDate: '2026-05-22' },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'CANDIDATE', joinDate: '2026-05-21' },
  { name: 'Carol Williams', email: 'carol@example.com', role: 'RECRUITER', joinDate: '2026-05-20' },
  { name: 'David Lee', email: 'david@example.com', role: 'CANDIDATE', joinDate: '2026-05-19' },
];

const violations = [
  { candidate: 'Mike Brown', type: 'TAB_SWITCH', assessment: 'Frontend Test', time: '2 min ago' },
  { candidate: 'Sara Davis', type: 'MULTIPLE_FACES', assessment: 'Backend Test', time: '5 min ago' },
  { candidate: 'Tom Wilson', type: 'COPY_PASTE', assessment: 'Frontend Test', time: '8 min ago' },
];

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/admin', active: true },
  { label: 'Assessments', icon: BookOpen, href: '/admin' },
  { label: 'Users', icon: Users, href: '/admin' },
  { label: 'Analytics', icon: BarChart3, href: '/admin' },
  { label: 'Proctoring', icon: Shield, href: '/admin' },
  { label: 'Reports', icon: FileText, href: '/admin' },
  { label: 'Settings', icon: Settings, href: '/admin' },
];

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-screen hidden lg:flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg">Assessify</span>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Admin Console</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">SA</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Super Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@assessify.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top bar */}
          <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search assessments, users..." className="pl-9" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="default" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> New Assessment
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">3</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Welcome */}
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor assessments, users, and platform health</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Active Assessments', value: '23', change: '+3', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Completion Rate', value: '87%', change: '+5%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { label: 'Avg Score', value: '72.4', change: '+2.1', icon: BarChart3, color: 'text-orange-500', bg: 'bg-orange-500/10' },
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
                          <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-3xl font-bold">{stat.value}</p>
                            <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                          </div>
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

            {/* Content Tabs */}
            <Tabs defaultValue="assessments" className="space-y-4">
              <TabsList>
                <TabsTrigger value="assessments" className="gap-2"><BookOpen className="h-3.5 w-3.5" /> Assessments</TabsTrigger>
                <TabsTrigger value="users" className="gap-2"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
                <TabsTrigger value="violations" className="gap-2"><Shield className="h-3.5 w-3.5" /> Violations</TabsTrigger>
              </TabsList>

              <TabsContent value="assessments">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Assessments</CardTitle>
                        <CardDescription>Manage and monitor all assessments</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="h-3.5 w-3.5" /> Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentAssessments.map((assessment, i) => (
                        <motion.div
                          key={assessment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm">{assessment.title}</h3>
                              <Badge variant={
                                assessment.status === 'ACTIVE' ? 'default' :
                                assessment.status === 'COMPLETED' ? 'success' : 'secondary'
                              }>
                                {assessment.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {assessment.candidates} candidates</span>
                              <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Avg: {assessment.avgScore}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Users</CardTitle>
                        <CardDescription>Recently registered users</CardDescription>
                      </div>
                      <Button size="sm" className="gap-2">
                        <UserPlus className="h-3.5 w-3.5" /> Invite User
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentUsers.map((user, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs">
                                {user.name.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{user.role}</Badge>
                            <span className="text-xs text-muted-foreground">{user.joinDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="violations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Recent Violations
                    </CardTitle>
                    <CardDescription>Live proctoring alerts and suspicious activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {violations.map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{v.candidate}</p>
                              <p className="text-xs text-muted-foreground">{v.assessment}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="text-xs">{v.type.replace('_', ' ')}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{v.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Activity Chart Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { range: '81-100', count: 156, pct: 32, color: 'bg-green-500' },
                      { range: '61-80', count: 203, pct: 42, color: 'bg-blue-500' },
                      { range: '41-60', count: 89, pct: 18, color: 'bg-yellow-500' },
                      { range: '21-40', count: 28, pct: 6, color: 'bg-orange-500' },
                      { range: '0-20', count: 11, pct: 2, color: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.range} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">{item.range}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-xs font-medium w-16 text-right">{item.count} ({item.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Platform Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Assessments today', value: 12, icon: BookOpen },
                      { label: 'Active candidates', value: 34, icon: Users },
                      { label: 'Violations flagged', value: 7, icon: AlertTriangle },
                      { label: 'Tests completed', value: 89, icon: CheckCircle2 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-lg font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
