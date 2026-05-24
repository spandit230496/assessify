'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Code2,
  Users,
  BarChart3,
  Monitor,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Globe,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Code2,
    title: 'Coding Playground',
    description: 'Multi-language IDE with Monaco Editor, Docker sandbox execution, and automated test cases.',
  },
  {
    icon: Shield,
    title: 'AI Proctoring',
    description: 'Webcam monitoring, face detection, tab-switch tracking, and suspicious activity logging.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Granular RBAC for Super Admin, Recruiter, Interviewer, Candidate, and Proctor roles.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time dashboards, score distributions, candidate rankings, and exportable reports.',
  },
  {
    icon: Monitor,
    title: 'System Checks',
    description: 'Pre-assessment browser, webcam, mic, speed, and environment validation.',
  },
  {
    icon: Clock,
    title: 'Smart Timer',
    description: 'Global and per-question timers with auto-submit, WebSocket sync, and resume support.',
  },
  {
    icon: FlaskConical,
    title: 'API Testing',
    description: 'Integrated REST API testing workspace with collections, environments, and team collaboration.',
  },
];

const stats = [
  { value: '10K+', label: 'Assessments Created' },
  { value: '500K+', label: 'Candidates Tested' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50ms', label: 'Avg Response Time' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Assessify</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/api-testing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Testing</Link>
            <Link href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stats</Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-6 bg-muted">
            <Lock className="h-3.5 w-3.5" />
            Enterprise-Grade Security
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            The Assessment Platform
            <br />
            <span className="text-primary">Built for Scale</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, manage, and proctor online assessments with enterprise-grade security.
            MCQ, coding challenges, AI proctoring, and real-time analytics — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="gap-2">
                <Globe className="h-4 w-4" />
                Live Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y bg-muted/50 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From question authoring to candidate evaluation — a complete assessment lifecycle management solution.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of companies using Assessify to find top talent efficiently and securely.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="gap-2">
              Get Started Now
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Assessify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Assessify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
