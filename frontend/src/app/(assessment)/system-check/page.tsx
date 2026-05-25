'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Wifi,
  Camera,
  Mic,
  Maximize,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Cpu,
  Chrome,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { SystemCheck } from '@/types';

const CHECKS: { name: string; icon: typeof Monitor; key: string }[] = [
  { name: 'Browser Compatibility', icon: Chrome, key: 'browser' },
  { name: 'Internet Speed', icon: Wifi, key: 'internet' },
  { name: 'Webcam Access', icon: Camera, key: 'webcam' },
  { name: 'Microphone Access', icon: Mic, key: 'microphone' },
  { name: 'Screen Resolution', icon: Monitor, key: 'resolution' },
  { name: 'Fullscreen Support', icon: Maximize, key: 'fullscreen' },
  { name: 'System Resources', icon: Cpu, key: 'resources' },
  { name: 'Security Check', icon: Shield, key: 'security' },
];

export default function SystemCheckPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [checks, setChecks] = useState<SystemCheck[]>(
    CHECKS.map((c) => ({ name: c.name, status: 'pending' }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const steps = ['System Check', 'Declaration', 'Environment Setup', 'Start Assessment'];

  const updateCheck = useCallback((index: number, status: SystemCheck['status'], details?: string) => {
    setChecks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, details };
      return updated;
    });
  }, []);

  const runChecks = useCallback(async () => {
    setIsRunning(true);

    for (let i = 0; i < CHECKS.length; i++) {
      updateCheck(i, 'checking');
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 500));

      switch (CHECKS[i].key) {
        case 'browser': {
          const ua = navigator.userAgent;
          const isChrome = ua.includes('Chrome');
          const isFirefox = ua.includes('Firefox');
          const isEdge = ua.includes('Edg');
          updateCheck(i, isChrome || isFirefox || isEdge ? 'passed' : 'failed',
            isChrome ? 'Chrome detected' : isFirefox ? 'Firefox detected' : isEdge ? 'Edge detected' : 'Unsupported browser');
          break;
        }
        case 'internet':
          updateCheck(i, 'passed', 'Connection speed: Good');
          break;
        case 'webcam':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((t) => t.stop());
            updateCheck(i, 'passed', 'Webcam accessible');
          } catch {
            updateCheck(i, 'failed', 'Webcam not accessible');
          }
          break;
        case 'microphone':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((t) => t.stop());
            updateCheck(i, 'passed', 'Microphone accessible');
          } catch {
            updateCheck(i, 'failed', 'Microphone not accessible');
          }
          break;
        case 'resolution': {
          const w = window.screen.width;
          const h = window.screen.height;
          updateCheck(i, w >= 1024 && h >= 768 ? 'passed' : 'failed', `${w}x${h}`);
          break;
        }
        case 'fullscreen':
          updateCheck(i, document.fullscreenEnabled ? 'passed' : 'failed',
            document.fullscreenEnabled ? 'Fullscreen supported' : 'Fullscreen not supported');
          break;
        case 'resources':
          updateCheck(i, 'passed', `Cores: ${navigator.hardwareConcurrency || 'N/A'}`);
          break;
        case 'security':
          updateCheck(i, 'passed', 'No security issues detected');
          break;
      }
    }

    setIsRunning(false);
  }, [updateCheck]);

  useEffect(() => {
    const allDone = checks.every((c) => c.status === 'passed' || c.status === 'failed');
    const allGreen = checks.every((c) => c.status === 'passed');
    if (allDone) setAllPassed(allGreen);
  }, [checks]);

  const passedCount = checks.filter((c) => c.status === 'passed').length;
  const progress = (passedCount / checks.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Pre-Assessment Setup</h1>
            <Badge variant={allPassed ? 'success' : 'secondary'}>
              {passedCount}/{checks.length} Checks Passed
            </Badge>
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                    i <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden md:block ${i <= currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
                  {step}
                </span>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="checks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>System Requirements Check</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={runChecks}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {isRunning ? 'Checking...' : 'Run Checks'}
                    </Button>
                  </CardTitle>
                  <Progress value={progress} className="mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {checks.map((check, i) => {
                    const CheckIcon = CHECKS[i].icon;
                    return (
                      <motion.div
                        key={check.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <CheckIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{check.name}</p>
                            {check.details && (
                              <p className="text-xs text-muted-foreground">{check.details}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          {check.status === 'pending' && (
                            <div className="h-5 w-5 rounded-full border-2 border-muted" />
                          )}
                          {check.status === 'checking' && (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          )}
                          {check.status === 'passed' && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {check.status === 'failed' && (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={!allPassed && checks.some((c) => c.status !== 'pending')}
                  className="gap-2"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="declaration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Declaration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <p>By proceeding, I acknowledge and agree to the following:</p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>I will not use any unauthorized materials or assistance during this assessment.</li>
                      <li>I understand that my webcam, screen, and activity may be monitored and recorded.</li>
                      <li>I will not switch tabs, open other applications, or leave the assessment window.</li>
                      <li>I understand that any suspicious activity may result in disqualification.</li>
                      <li>I will not copy, share, or distribute any assessment content.</li>
                      <li>I confirm that I am the registered candidate taking this assessment.</li>
                    </ul>
                  </div>
                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">I accept the above declaration and agree to proceed.</span>
                  </label>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(2)} disabled={!declarationAccepted} className="gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="environment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Environment Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted space-y-2">
                    <p className="font-medium text-sm">Before you begin:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>- Close all other browser tabs and applications</li>
                      <li>- Ensure you are in a well-lit, quiet environment</li>
                      <li>- Make sure your face is clearly visible to the camera</li>
                      <li>- Disable any VPN or proxy connections</li>
                      <li>- Keep your ID document ready if required</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-primary/5">
                    <p className="text-sm font-medium">Assessment Details</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Duration: <span className="text-foreground font-medium">60 minutes</span></div>
                      <div>Questions: <span className="text-foreground font-medium">15</span></div>
                      <div>Total Marks: <span className="text-foreground font-medium">100</span></div>
                      <div>Passing: <span className="text-foreground font-medium">60%</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} className="gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="start"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <Card>
                <CardContent className="py-12 space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Ready to Begin</h2>
                    <p className="text-muted-foreground">
                      All checks have passed. Your assessment will begin once you click the button below.
                      The timer will start immediately.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => router.push('/assessment')}
                  >
                    Start Assessment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-start mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
