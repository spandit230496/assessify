# Kafka Event Design — Evaluation Module

## Topic Configuration

| Topic | Partitions | Replication Factor | Retention | Cleanup Policy | Key |
|-------|-----------|-------------------|-----------|----------------|-----|
| `assessify.evaluations.submission-received` | 12 | 3 | 7d | delete | `userId` |
| `assessify.evaluations.evaluation-started` | 12 | 3 | 7d | delete | `evaluationId` |
| `assessify.evaluations.evaluation-completed` | 12 | 3 | 30d | delete | `evaluationId` |
| `assessify.evaluations.evaluation-failed` | 6 | 3 | 30d | delete | `evaluationId` |
| `assessify.evaluations.dlq` | 3 | 3 | 90d | compact | `evaluationId` |

**Partitioning strategy**: Keyed by `userId` for `submission-received` (ensures ordering per user). Keyed by `evaluationId` for other topics.

---

## Consumer Groups

| Group ID | Topics Consumed | Instances | Processing |
|----------|----------------|-----------|------------|
| `evaluation-worker-group` | `submission-received` | 3–20 (auto-scaled) | Execute code in sandbox |
| `evaluation-status-updater` | `evaluation-started`, `evaluation-completed`, `evaluation-failed` | 2 | Update DB + Redis cache |
| `evaluation-analytics` | `evaluation-completed`, `evaluation-failed` | 1 | Aggregate analytics |
| `evaluation-notification` | `evaluation-completed` | 1 | Send completion notifications |

---

## Event Envelope (Common Structure)

```typescript
interface EvaluationEvent<T> {
  eventId: string;        // UUID — unique per event
  eventType: string;      // SUBMISSION_RECEIVED | EVALUATION_STARTED | etc.
  timestamp: string;      // ISO 8601
  version: string;        // Schema version ("1.0")
  payload: T;             // Type-specific payload
  metadata: {
    correlationId: string; // Traces a submission through its lifecycle
    source: string;        // "evaluation-api" | "evaluation-worker"
    retryCount?: number;
    workerId?: string;
  };
}
```

---

## Event Payloads

### 1. `SUBMISSION_RECEIVED`

**Topic**: `assessify.evaluations.submission-received`  
**Producer**: Evaluation API Service  
**Consumers**: Evaluation Worker Group

```json
{
  "eventId": "evt-a1b2c3d4",
  "eventType": "SUBMISSION_RECEIVED",
  "timestamp": "2026-05-25T10:30:00Z",
  "version": "1.0",
  "payload": {
    "evaluationId": "EVL-10001",
    "internalId": "uuid-of-evaluation-record",
    "userId": "user-uuid",
    "problemId": "problem-uuid",
    "language": "JAVA",
    "sourceCode": "... (full source code) ...",
    "customInput": "",
    "submissionType": "FINAL",
    "sourceCodeHash": "sha256:abc123def456...",
    "testCases": [
      {
        "testCaseId": "tc-uuid-1",
        "input": "2 7 11 15\n9",
        "expected": "[0, 1]",
        "isHidden": false,
        "weight": 1.0,
        "order": 1
      }
    ],
    "constraints": {
      "timeLimitMs": 5000,
      "memoryLimitMb": 256,
      "outputLimitBytes": 1048576
    }
  },
  "metadata": {
    "correlationId": "corr-uuid-1",
    "source": "evaluation-api",
    "retryCount": 0
  }
}
```

### 2. `EVALUATION_STARTED`

**Topic**: `assessify.evaluations.evaluation-started`  
**Producer**: Evaluation Worker  
**Consumers**: Status Updater

```json
{
  "eventId": "evt-e5f6g7h8",
  "eventType": "EVALUATION_STARTED",
  "timestamp": "2026-05-25T10:30:01Z",
  "version": "1.0",
  "payload": {
    "evaluationId": "EVL-10001",
    "workerId": "worker-03",
    "sandboxId": "sandbox-uuid-789",
    "startedAt": "2026-05-25T10:30:01Z"
  },
  "metadata": {
    "correlationId": "corr-uuid-1",
    "source": "evaluation-worker",
    "workerId": "worker-03"
  }
}
```

### 3. `EVALUATION_COMPLETED`

**Topic**: `assessify.evaluations.evaluation-completed`  
**Producer**: Evaluation Worker  
**Consumers**: Status Updater, Analytics, Notification

```json
{
  "eventId": "evt-i9j0k1l2",
  "eventType": "EVALUATION_COMPLETED",
  "timestamp": "2026-05-25T10:30:04Z",
  "version": "1.0",
  "payload": {
    "evaluationId": "EVL-10001",
    "userId": "user-uuid",
    "problemId": "problem-uuid",
    "language": "JAVA",
    "status": "COMPLETED",
    "score": 85.0,
    "maxScore": 100.0,
    "testCasesPassed": 8,
    "testCasesFailed": 2,
    "testCasesTotal": 10,
    "results": [
      {
        "testCaseId": "tc-uuid-1",
        "order": 1,
        "passed": true,
        "verdict": "ACCEPTED",
        "executionTimeMs": 12,
        "memoryUsedKb": 3200
      },
      {
        "testCaseId": "tc-uuid-10",
        "order": 10,
        "passed": false,
        "verdict": "TIME_LIMIT_EXCEEDED",
        "executionTimeMs": 5001,
        "memoryUsedKb": 65536
      }
    ],
    "metrics": {
      "totalExecutionTimeMs": 142,
      "peakMemoryUsedKb": 65536,
      "compilationTimeMs": 320,
      "avgExecutionTimeMs": 14,
      "cpuTimeMs": 130,
      "wallTimeMs": 3200,
      "sandboxOverheadMs": 58
    },
    "completedAt": "2026-05-25T10:30:04Z"
  },
  "metadata": {
    "correlationId": "corr-uuid-1",
    "source": "evaluation-worker",
    "workerId": "worker-03"
  }
}
```

### 4. `EVALUATION_FAILED`

**Topic**: `assessify.evaluations.evaluation-failed`  
**Producer**: Evaluation Worker  
**Consumers**: Status Updater, Analytics

```json
{
  "eventId": "evt-m3n4o5p6",
  "eventType": "EVALUATION_FAILED",
  "timestamp": "2026-05-25T10:30:02Z",
  "version": "1.0",
  "payload": {
    "evaluationId": "EVL-10001",
    "userId": "user-uuid",
    "problemId": "problem-uuid",
    "status": "COMPILATION_ERROR",
    "errorCode": "CE_001",
    "errorMessage": "Main.java:5: error: ';' expected\n    int x = 10\n              ^",
    "failedAt": "2026-05-25T10:30:02Z"
  },
  "metadata": {
    "correlationId": "corr-uuid-1",
    "source": "evaluation-worker",
    "workerId": "worker-03",
    "retryCount": 0,
    "maxRetries": 3,
    "retryable": false,
    "retryReason": null
  }
}
```

### 5. Dead Letter Queue Entry

**Topic**: `assessify.evaluations.dlq`  
**Producer**: Evaluation Worker (after all retries exhausted)  
**Consumers**: Manual review / alerting

```json
{
  "eventId": "evt-dlq-001",
  "eventType": "DEAD_LETTER",
  "timestamp": "2026-05-25T10:35:00Z",
  "version": "1.0",
  "payload": {
    "originalTopic": "assessify.evaluations.submission-received",
    "originalEventId": "evt-a1b2c3d4",
    "evaluationId": "EVL-10001",
    "failureReason": "Worker timeout after 3 retries",
    "lastError": "Container exited with signal 9 (OOM)",
    "retryCount": 3,
    "firstAttemptAt": "2026-05-25T10:30:00Z",
    "lastAttemptAt": "2026-05-25T10:34:50Z"
  },
  "metadata": {
    "correlationId": "corr-uuid-1",
    "source": "evaluation-worker",
    "workerId": "worker-03"
  }
}
```

---

## Retry Strategy

### Worker-Level Automatic Retry

| Error Type | Retryable | Max Retries | Backoff | Notes |
|-----------|-----------|-------------|---------|-------|
| Internal worker crash | Yes | 3 | Exponential: 1s → 4s → 16s | Worker restarts and re-consumes |
| Sandbox timeout (hung container) | Yes | 2 | Fixed: 5s | Kill container, retry |
| DB connection failure | Yes | 5 | Exponential: 500ms base | Transient |
| Kafka producer failure | Yes | 5 | Exponential: 500ms base | Transient |
| Compilation error | **No** | 0 | — | User code issue |
| Runtime error | **No** | 0 | — | User code issue |
| Wrong answer | **No** | 0 | — | User code issue |
| Memory limit exceeded | **No** | 0 | — | User code issue |
| Time limit exceeded | **No** | 0 | — | User code issue |
| Source code too large | **No** | 0 | — | Validation should catch |

### Exponential Backoff Formula

```
delay = min(baseDelay × 2^retryCount, maxDelay) + jitter

Where:
  baseDelay = 1000ms
  maxDelay  = 60000ms
  jitter    = random(0, 500ms)
```

### DLQ Processing

1. Events in DLQ are monitored via Grafana dashboard
2. Alert fires when DLQ depth > 0
3. On-call engineer reviews the DLQ message
4. Options:
   - Fix the underlying issue and replay from DLQ
   - Use `POST /api/v1/evaluations/{id}/retry` to re-queue
   - Mark as permanently failed

---

## Idempotency

- Producer uses `evaluationId` as the Kafka message key
- Kafka `enable.idempotence=true` on the producer config
- Consumer uses `eventId` for deduplication (stored in Redis with 24h TTL)
- If a consumer receives a duplicate `eventId`, it skips processing
