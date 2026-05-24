'use client';

import { Badge } from '@/components/ui/badge';

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (code >= 500) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
}

function getStatusText(code: number): string {
  const texts: Record<number, string> = {
    200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved', 302: 'Found',
    304: 'Not Modified', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 405: 'Method Not Allowed', 408: 'Timeout', 409: 'Conflict',
    422: 'Unprocessable', 429: 'Too Many Requests', 500: 'Server Error',
    502: 'Bad Gateway', 503: 'Unavailable', 504: 'Gateway Timeout',
  };
  return texts[code] || '';
}

export function StatusBadge({ statusCode }: { statusCode: number }) {
  const statusText = getStatusText(statusCode);
  return (
    <Badge variant="outline" className={`${getStatusColor(statusCode)} border-0 font-mono text-xs`}>
      {statusCode}{statusText ? ` ${statusText}` : ''}
    </Badge>
  );
}
