'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  Eye,
  AlertTriangle,
  Users,
  Activity,
  Camera,
  MonitorOff,
  Zap,
  Clock,
  Search,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const activeCandidates = [
  { name: 'Alice Johnson', assessment: 'Frontend Test', violations: 0, timeLeft: '32:15', status: 'active' },
  { name: 'Bob Smith', assessment: 'Frontend Test', violations: 2, timeLeft: '18:42', status: 'warning' },
  { name: 'Carol Williams', assessment: 'Backend Test', violations: 0, timeLeft: '45:00', status: 'active' },
  { name: 'David Lee', assessment: 'Frontend Test', violations: 5, timeLeft: '12:30', status: 'critical' },
  { name: 'Emily Chen', assessment: 'Backend Test', violations: 1, timeLeft: '38:55', status: 'warning' },
];

const recentViolations = [
  { candidate: 'Bob Smith', type: 'TAB_SWITCH', time: '2 min ago', severity: 'medium' },
  { candidate: 'David Lee', type: 'MULTIPLE_FACES', time: '3 min ago', severity: 'high' },
  { candidate: 'David Lee', type: 'COPY_PASTE', time: '5 min ago', severity: 'medium' },
  { candidate: 'Emily Chen', type: 'WINDOW_BLUR', time: '8 min ago', severity: 'low' },
  { candidate: 'David Lee', type: 'DEV_TOOLS_OPEN', time: '10 min ago', severity: 'high' },
];

export default function ProctorDashboard() {
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
                <p className="text-[10px] text-muted-foreground -mt-0.5">Proctor View</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {[
              { label: 'Live Monitor', icon: Eye, active: true },
              { label: 'Violations', icon: AlertTriangle },
              { label: 'Candidates', icon: Users },
              { label: 'Timeline', icon: Activity },
              { label: 'Recordings', icon: Camera },
            ].map((item) => (
              <Link
                key={item.label}
                href="/proctor"
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
              <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">SP</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Sam Proctor</p>
                <p className="text-xs text-muted-foreground truncate">proctor@assessify.com</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  Live Monitoring
                </h1>
                <p className="text-sm text-muted-foreground">5 candidates currently active</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search candidates..." className="pl-9 w-64" />
                </div>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">5</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Sessions', value: '5', icon: Eye, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Total Violations', value: '8', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
                { label: 'At Risk', value: '2', icon: Shield, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                { label: 'Clean Sessions', value: '3', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
              {/* Active Candidates */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Candidates</CardTitle>
                    <CardDescription>Real-time candidate monitoring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeCandidates.map((candidate, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          candidate.status === 'critical' ? 'border-destructive/50 bg-destructive/5' :
                          candidate.status === 'warning' ? 'border-yellow-500/50 bg-yellow-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="text-xs">{candidate.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                              candidate.status === 'critical' ? 'bg-red-500' :
                              candidate.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.assessment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-mono">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {candidate.timeLeft}
                            </div>
                            {candidate.violations > 0 && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                {candidate.violations} violations
                              </Badge>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" /> Watch
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Violations Feed */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Violation Feed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentViolations.map((v, i) => (
                      <div key={i} className="flex items-start gap-3 p-2">
                        <div className={`h-2 w-2 rounded-full mt-1.5 ${
                          v.severity === 'high' ? 'bg-red-500' :
                          v.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{v.candidate}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.type.replace(/_/g, ' ')} — {v.time}
                          </p>
                        </div>
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
