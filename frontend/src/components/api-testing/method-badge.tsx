'use client';

import { Badge } from '@/components/ui/badge';
import type { HttpMethod } from '@/types';

const methodColors: Record<HttpMethod, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  POST: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PUT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PATCH: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  HEAD: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  OPTIONS: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function MethodBadge({ method, className }: { method: HttpMethod; className?: string }) {
  return (
    <Badge variant="outline" className={`${methodColors[method]} font-mono text-xs font-bold border-0 ${className ?? ''}`}>
      {method}
    </Badge>
  );
}
