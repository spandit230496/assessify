import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';

interface ApiExecutionJobData {
  historyId: string;
  userId: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  pathParams?: Record<string, string>;
  authType?: string;
  authConfig?: Record<string, unknown>;
  bodyType?: string;
  body?: string;
  timeoutMs: number;
  followRedirects: boolean;
}

@Processor('api-execution')
export class ApiExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(ApiExecutionProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ApiExecutionJobData>): Promise<void> {
    const data = job.data;
    this.logger.log(`Processing API request: ${data.method} ${data.url}`);

    await this.prisma.aPIHistory.update({
      where: { id: data.historyId },
      data: { status: 'RUNNING' },
    });

    const startTime = Date.now();

    try {
      const url = this.buildUrl(data.url, data.queryParams, data.pathParams);

      const headers: Record<string, string> = { ...data.headers };
      this.applyAuth(headers, data.authType, data.authConfig);

      const fetchOptions: RequestInit = {
        method: data.method,
        headers,
        redirect: data.followRedirects ? 'follow' : 'manual',
        signal: AbortSignal.timeout(data.timeoutMs),
      };

      if (data.body && !['GET', 'HEAD', 'OPTIONS'].includes(data.method)) {
        fetchOptions.body = data.body;
        if (data.bodyType === 'JSON' && !headers['content-type'] && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        } else if (
          data.bodyType === 'XML' &&
          !headers['content-type'] &&
          !headers['Content-Type']
        ) {
          headers['Content-Type'] = 'application/xml';
        } else if (
          data.bodyType === 'FORM_DATA' &&
          !headers['content-type'] &&
          !headers['Content-Type']
        ) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      const response = await fetch(url, fetchOptions);
      const responseTimeMs = Date.now() - startTime;

      const responseText = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      await this.prisma.aPIHistory.update({
        where: { id: data.historyId },
        data: {
          statusCode: response.status,
          responseHeaders: responseHeaders,
          responseBody: responseText,
          responseTimeMs,
          responseSizeBytes: new TextEncoder().encode(responseText).length,
          status: response.ok ? 'SUCCESS' : 'ERROR',
        },
      });

      this.logger.log(
        `API request completed: ${data.method} ${data.url} -> ${response.status} (${responseTimeMs}ms)`,
      );
    } catch (error: unknown) {
      const responseTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('abort');

      await this.prisma.aPIHistory.update({
        where: { id: data.historyId },
        data: {
          error: errorMessage,
          responseTimeMs,
          status: isTimeout ? 'TIMEOUT' : 'ERROR',
        },
      });

      this.logger.error(`API request failed: ${data.method} ${data.url} - ${errorMessage}`);
    }
  }

  private buildUrl(
    baseUrl: string,
    queryParams?: Record<string, string>,
    pathParams?: Record<string, string>,
  ): string {
    let url = baseUrl;

    if (pathParams) {
      for (const [key, value] of Object.entries(pathParams)) {
        url = url.replace(`:${key}`, encodeURIComponent(value));
        url = url.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}${params.toString()}`;
    }

    return url;
  }

  private applyAuth(
    headers: Record<string, string>,
    authType?: string,
    authConfig?: Record<string, unknown>,
  ) {
    if (!authType || authType === 'NONE' || !authConfig) return;

    switch (authType) {
      case 'BEARER_TOKEN':
        if (authConfig.token) {
          headers['Authorization'] = `Bearer ${authConfig.token}`;
        }
        break;
      case 'BASIC_AUTH':
        if (authConfig.username && authConfig.password) {
          const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString(
            'base64',
          );
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'API_KEY':
        if (authConfig.key && authConfig.value) {
          const placement = (authConfig.placement as string) || 'header';
          if (placement === 'header') {
            headers[authConfig.key as string] = authConfig.value as string;
          }
        }
        break;
    }
  }
}
