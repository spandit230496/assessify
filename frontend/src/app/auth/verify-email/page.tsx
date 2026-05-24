'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (token) {
      api.post('/auth/verify-email', { token })
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Assessify</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Verifying your email...</h2>
                <p className="text-sm text-muted-foreground">Please wait a moment.</p>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
                <p className="text-sm text-muted-foreground mb-6">Your account is now active. You can sign in.</p>
                <Link href="/auth/login"><Button>Sign In</Button></Link>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
                <p className="text-sm text-muted-foreground mb-6">The link may be invalid or expired.</p>
                <Link href="/auth/login"><Button variant="outline">Back to Login</Button></Link>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
