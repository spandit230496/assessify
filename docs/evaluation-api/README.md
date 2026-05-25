# Evaluation REST API Module — System Design Document

> **Scope**: Architecture, API contracts, database design, event flows, and system design documentation for the new Evaluation module.  
> **Constraint**: NO Java code. Only design artifacts.  
> **Compatibility**: Extends existing Assessify platform without modifying current modules.

---

## Table of Contents

1. [API Specifications](#1-api-specifications)
2. [Request/Response Examples](#2-requestresponse-examples)
3. [Database Schema Changes](#3-database-schema-changes)
4. [Kafka Event Design](#4-kafka-event-design)
5. [High-Level Design (HLD)](#5-high-level-design-hld)
6. [Low-Level Design (LLD)](#6-low-level-design-lld)
7. [Sequence Diagrams](#7-sequence-diagrams)
8. [Error Response Standards](#8-error-response-standards)
9. [Retry Workflow](#9-retry-workflow)
10. [Scalability Architecture](#10-scalability-architecture)
11. [Security Design](#11-security-design)
12. [Deployment Considerations](#12-deployment-considerations)
13. [Swagger/OpenAPI Specification](#13-swaggeropenapi-specification)

---

## 1. API Specifications

### Base Path

```
/api/v1/evaluations
```

### Existing Endpoints (UNCHANGED)

The following existing endpoints remain untouched:

| Module | Endpoint | Method |
|--------|----------|--------|
| `coding` | `/coding/execute` | POST |
| `coding` | `/coding/run-tests/:questionId` | POST |
| `coding` | `/coding/execution/:id` | GET |
| `submissions` | `/submissions/start/:assessmentId` | POST |
| `submissions` | `/submissions/:attemptId/answer` | POST |
| `submissions` | `/submissions/:attemptId/submit` | POST |

### New Endpoints

#### 1.1 Submit Code for Evaluation

```
POST /api/v1/evaluations
```

| Field | Details |
|-------|---------|
| **Auth** | Bearer JWT (role: CANDIDATE) |
| **Rate Limit** | 10 requests/minute per user |
| **Idempotency** | `X-Idempotency-Key` header (optional) |
| **Content-Type** | `application/json` |

**Description**: Accepts a coding submission, creates an evaluation record, and triggers asynchronous evaluation via Kafka.

#### 1.2 Get Evaluation Status

```
GET /api/v1/evaluations/{evaluationId}
```

| Field | Details |
|-------|---------|
| **Auth** | Bearer JWT (roles: CANDIDATE, RECRUITER, SUPER_ADMIN) |
| **Polling** | Clients should poll every 2–5 seconds until status is terminal |

**Description**: Returns the current status of an evaluation. Used for polling.

#### 1.3 Get Detailed Result

```
GET /api/v1/evaluations/{evaluationId}/result
```

| Field | Details |
|-------|---------|
| **Auth** | Bearer JWT (roles: CANDIDATE, RECRUITER, SUPER_ADMIN, INTERVIEWER) |
| **Availability** | Only available when status is `COMPLETED`, `COMPILATION_ERROR`, `RUNTIME_ERROR`, or `FAILED` |

**Description**: Returns the full evaluation result including per-test-case breakdown, execution metrics, and score.

#### 1.4 Re-evaluate Submission

```
POST /api/v1/evaluations/{evaluationId}/retry
```

| Field | Details |
|-------|---------|
| **Auth** | Bearer JWT (roles: RECRUITER, SUPER_ADMIN) |
| **Rate Limit** | 3 retries per evaluation |
| **Precondition** | Original evaluation must be in `FAILED` or `TIMEOUT` status |

**Description**: Re-queues a failed evaluation for processing. Creates a new evaluation linked to the original.

#### 1.5 Get Submission History

```
GET /api/v1/users/{userId}/evaluations
```

| Field | Details |
|-------|---------|
| **Auth** | Bearer JWT (roles: CANDIDATE for own, RECRUITER/SUPER_ADMIN for any) |
| **Pagination** | `?page=1&limit=20&sortBy=submittedAt&order=desc` |
| **Filters** | `?status=COMPLETED&problemId=5001&language=JAVA` |

**Description**: Returns paginated evaluation history for a user.

---

## 2. Request/Response Examples

### 2.1 Submit Code for Evaluation

**Request**:
```http
POST /api/v1/evaluations HTTP/1.1
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Idempotency-Key: client-uuid-12345

{
  "userId": 101,
  "problemId": 5001,
  "language": "JAVA",
  "sourceCode": "import java.util.*;\npublic class Solution {\n  public static int[] twoSum(int[] nums, int target) {\n    Map<Integer,Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n      int complement = target - nums[i];\n      if (map.containsKey(complement)) return new int[]{map.get(complement), i};\n      map.put(nums[i], i);\n    }\n    return new int[]{};\n  }\n}",
  "customInput": "",
  "submissionType": "FINAL"
}
```

**Response** (`201 Created`):
```json
{
  "evaluationId": "EVL-10001",
  "status": "QUEUED",
  "submittedAt": "2026-05-25T10:30:00Z",
  "estimatedCompletionMs": 5000,
  "_links": {
    "self": "/api/v1/evaluations/EVL-10001",
    "result": "/api/v1/evaluations/EVL-10001/result",
    "poll": "/api/v1/evaluations/EVL-10001"
  }
}
```

### 2.2 Get Evaluation Status

**Request**:
```http
GET /api/v1/evaluations/EVL-10001 HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response — In Progress** (`200 OK`):
```json
{
  "evaluationId": "EVL-10001",
  "status": "IN_PROGRESS",
  "submittedAt": "2026-05-25T10:30:00Z",
  "startedAt": "2026-05-25T10:30:01Z",
  "progress": {
    "testCasesCompleted": 3,
    "testCasesTotal": 10
  }
}
```

**Response — Completed** (`200 OK`):
```json
{
  "evaluationId": "EVL-10001",
  "status": "COMPLETED",
  "submittedAt": "2026-05-25T10:30:00Z",
  "startedAt": "2026-05-25T10:30:01Z",
  "completedAt": "2026-05-25T10:30:04Z",
  "summary": {
    "score": 85.0,
    "testCasesPassed": 8,
    "testCasesFailed": 2,
    "testCasesTotal": 10,
    "executionTimeMs": 142,
    "memoryUsedKb": 32768
  }
}
```

### 2.3 Get Detailed Result

**Request**:
```http
GET /api/v1/evaluations/EVL-10001/result HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response** (`200 OK`):
```json
{
  "evaluationId": "EVL-10001",
  "status": "COMPLETED",
  "language": "JAVA",
  "submissionType": "FINAL",
  "score": 85.0,
  "maxScore": 100.0,
  "testCaseResults": [
    {
      "testCaseId": "TC-001",
      "order": 1,
      "passed": true,
      "isHidden": false,
      "input": "2 7 11 15\n9",
      "expectedOutput": "[0, 1]",
      "actualOutput": "[0, 1]",
      "executionTimeMs": 12,
      "memoryUsedKb": 3200,
      "status": "ACCEPTED"
    },
    {
      "testCaseId": "TC-002",
      "order": 2,
      "passed": true,
      "isHidden": false,
      "input": "3 2 4\n6",
      "expectedOutput": "[1, 2]",
      "actualOutput": "[1, 2]",
      "executionTimeMs": 11,
      "memoryUsedKb": 3100,
      "status": "ACCEPTED"
    },
    {
      "testCaseId": "TC-010",
      "order": 10,
      "passed": false,
      "isHidden": true,
      "input": "[HIDDEN]",
      "expectedOutput": "[HIDDEN]",
      "actualOutput": "[HIDDEN]",
      "executionTimeMs": 5001,
      "memoryUsedKb": 65536,
      "status": "TIME_LIMIT_EXCEEDED"
    }
  ],
  "executionMetrics": {
    "totalExecutionTimeMs": 142,
    "peakMemoryUsedKb": 65536,
    "compilationTimeMs": 320,
    "averageExecutionTimeMs": 14
  },
  "submittedAt": "2026-05-25T10:30:00Z",
  "completedAt": "2026-05-25T10:30:04Z"
}
```

### 2.4 Re-evaluate Submission

**Request**:
```http
POST /api/v1/evaluations/EVL-10001/retry HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response** (`201 Created`):
```json
{
  "evaluationId": "EVL-10002",
  "originalEvaluationId": "EVL-10001",
  "status": "QUEUED",
  "retriedAt": "2026-05-25T11:00:00Z",
  "retryCount": 1
}
```

### 2.5 Get Submission History

**Request**:
```http
GET /api/v1/users/101/evaluations?page=1&limit=20&status=COMPLETED HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response** (`200 OK`):
```json
{
  "data": [
    {
      "evaluationId": "EVL-10001",
      "problemId": "5001",
      "problemTitle": "Two Sum",
      "language": "JAVA",
      "status": "COMPLETED",
      "score": 85.0,
      "testCasesPassed": 8,
      "testCasesTotal": 10,
      "submissionType": "FINAL",
      "submittedAt": "2026-05-25T10:30:00Z",
      "completedAt": "2026-05-25T10:30:04Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 42,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 3. Database Schema Changes

### Compatibility Note

All changes are **additive only**. No existing tables are modified. The new tables reference existing models via foreign keys where needed.

### 3.1 New Enum: `EvaluationStatus`

```sql
CREATE TYPE "EvaluationStatus" AS ENUM (
  'QUEUED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'TIMEOUT',
  'COMPILATION_ERROR',
  'RUNTIME_ERROR'
);
```

### 3.2 New Enum: `SubmissionType`

```sql
CREATE TYPE "SubmissionType" AS ENUM (
  'RUN',
  'FINAL',
  'PRACTICE'
);
```

### 3.3 New Enum: `TestCaseVerdict`

```sql
CREATE TYPE "TestCaseVerdict" AS ENUM (
  'ACCEPTED',
  'WRONG_ANSWER',
  'TIME_LIMIT_EXCEEDED',
  'MEMORY_LIMIT_EXCEEDED',
  'RUNTIME_ERROR',
  'COMPILATION_ERROR',
  'INTERNAL_ERROR'
);
```

### 3.4 Table: `evaluations`

Primary table for tracking evaluation lifecycle.

```sql
CREATE TABLE evaluations (
  id                  VARCHAR(36)       PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id       VARCHAR(20)       NOT NULL UNIQUE,  -- human-readable: EVL-XXXXX
  user_id             VARCHAR(36)       NOT NULL REFERENCES users(id),
  problem_id          VARCHAR(36)       NOT NULL REFERENCES questions(id),
  attempt_id          VARCHAR(36)       REFERENCES assessment_attempts(id),  -- nullable for practice
  language            VARCHAR(20)       NOT NULL,
  source_code         TEXT              NOT NULL,
  custom_input        TEXT,
  submission_type     "SubmissionType"  NOT NULL DEFAULT 'FINAL',
  status              "EvaluationStatus" NOT NULL DEFAULT 'QUEUED',
  score               DECIMAL(10,2)     DEFAULT 0,
  max_score           DECIMAL(10,2)     DEFAULT 100,
  test_cases_passed   INT               DEFAULT 0,
  test_cases_failed   INT               DEFAULT 0,
  test_cases_total    INT               DEFAULT 0,
  retry_count         INT               DEFAULT 0,
  max_retries         INT               DEFAULT 3,
  original_eval_id    VARCHAR(36)       REFERENCES evaluations(id),  -- for retries
  idempotency_key     VARCHAR(100)      UNIQUE,
  worker_id           VARCHAR(100),     -- which worker processed this
  error_message       TEXT,
  error_code          VARCHAR(50),
  submitted_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_problem_id ON evaluations(problem_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_submitted_at ON evaluations(submitted_at DESC);
CREATE INDEX idx_evaluations_user_status ON evaluations(user_id, status);
CREATE INDEX idx_evaluations_attempt_id ON evaluations(attempt_id);
CREATE INDEX idx_evaluations_idempotency ON evaluations(idempotency_key) WHERE idempotency_key IS NOT NULL;
```

### 3.5 Table: `evaluation_results`

Per-test-case results for an evaluation.

```sql
CREATE TABLE evaluation_results (
  id                  VARCHAR(36)       PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id       VARCHAR(36)       NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  test_case_id        VARCHAR(36)       NOT NULL REFERENCES test_cases(id),
  "order"             INT               NOT NULL,
  passed              BOOLEAN           NOT NULL DEFAULT false,
  verdict             "TestCaseVerdict" NOT NULL DEFAULT 'INTERNAL_ERROR',
  actual_output       TEXT,
  execution_time_ms   INT,
  memory_used_kb      INT,
  stderr              TEXT,
  exit_code           INT,
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_eval_results_evaluation_id ON evaluation_results(evaluation_id);
CREATE INDEX idx_eval_results_verdict ON evaluation_results(verdict);
CREATE UNIQUE INDEX idx_eval_results_eval_tc ON evaluation_results(evaluation_id, test_case_id);
```

### 3.6 Table: `execution_metrics`

Aggregated execution metrics per evaluation.

```sql
CREATE TABLE execution_metrics (
  id                      VARCHAR(36)   PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id           VARCHAR(36)   NOT NULL UNIQUE REFERENCES evaluations(id) ON DELETE CASCADE,
  total_execution_time_ms INT           NOT NULL DEFAULT 0,
  peak_memory_used_kb     INT           NOT NULL DEFAULT 0,
  compilation_time_ms     INT           DEFAULT 0,
  avg_execution_time_ms   INT           DEFAULT 0,
  cpu_time_ms             INT           DEFAULT 0,
  wall_time_ms            INT           DEFAULT 0,
  sandbox_overhead_ms     INT           DEFAULT 0,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 3.7 Table: `submission_logs`

Immutable audit trail for all submission events.

```sql
CREATE TABLE submission_logs (
  id                VARCHAR(36)   PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id     VARCHAR(36)   NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  event_type        VARCHAR(50)   NOT NULL,  -- SUBMITTED, QUEUED, STARTED, TC_PASSED, TC_FAILED, COMPLETED, FAILED, RETRIED
  event_data        JSONB,
  worker_id         VARCHAR(100),
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  timestamp         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_submission_logs_eval_id ON submission_logs(evaluation_id);
CREATE INDEX idx_submission_logs_event_type ON submission_logs(event_type);
CREATE INDEX idx_submission_logs_timestamp ON submission_logs(timestamp DESC);
```

### 3.8 Entity Relationship

```
users (existing) ─────────────┐
                               │ 1:N
questions (existing) ──┐       │
                       │ 1:N   │
                       ▼       ▼
                   evaluations ──────── 1:1 ──── execution_metrics
                       │
                       │ 1:N
                       ├──────────── evaluation_results
                       │                  │
                       │                  │ N:1
                       │             test_cases (existing)
                       │
                       │ 1:N
                       └──────────── submission_logs
```

---

## 4. Kafka Event Design

### 4.1 Topics

| Topic Name | Partitions | Retention | Description |
|------------|-----------|-----------|-------------|
| `assessify.evaluations.submission-received` | 12 | 7 days | New submission accepted |
| `assessify.evaluations.evaluation-started` | 12 | 7 days | Worker picked up evaluation |
| `assessify.evaluations.evaluation-completed` | 12 | 30 days | Evaluation finished successfully |
| `assessify.evaluations.evaluation-failed` | 6 | 30 days | Evaluation failed |
| `assessify.evaluations.dlq` | 3 | 90 days | Dead letter queue |

### 4.2 Event Payloads

#### `submission-received`

```json
{
  "eventId": "evt-uuid-1",
  "eventType": "SUBMISSION_RECEIVED",
  "timestamp": "2026-05-25T10:30:00Z",
  "version": "1.0",
  "payload": {
    "evaluationId": "EVL-10001",
    "userId": "user-uuid",
    "problemId": "problem-uuid",
    "language": "JAVA",
    "submissionType": "FINAL",
    "sourceCodeHash": "sha256:abc123...",
    "testCasesTotal": 10,
    "timeLimitMs": 5000,
    "memoryLimitMb": 256
  },
  "metadata": {
    "correlationId": "corr-uuid",
    "source": "evaluation-api",
    "retryCount": 0
  }
}
```

#### `evaluation-started`

```json
{
  "eventId": "evt-uuid-2",
  "eventType": "EVALUATION_STARTED",
  "timestamp": "2026-05-25T10:30:01Z",
  "version": "1.0",
  "payload": {
    "evaluationId": "EVL-10001",
    "workerId": "worker-03",
    "sandboxId": "sandbox-uuid",
    "startedAt": "2026-05-25T10:30:01Z"
  },
  "metadata": {
    "correlationId": "corr-uuid",
    "source": "evaluation-worker"
  }
}
```

#### `evaluation-completed`

```json
{
  "eventId": "evt-uuid-3",
  "eventType": "EVALUATION_COMPLETED",
  "timestamp": "2026-05-25T10:30:04Z",
  "version": "1.0",
  "payload": {
    "evaluationId": "EVL-10001",
    "userId": "user-uuid",
    "problemId": "problem-uuid",
    "status": "COMPLETED",
    "score": 85.0,
    "testCasesPassed": 8,
    "testCasesFailed": 2,
    "testCasesTotal": 10,
    "totalExecutionTimeMs": 142,
    "peakMemoryUsedKb": 65536,
    "completedAt": "2026-05-25T10:30:04Z"
  },
  "metadata": {
    "correlationId": "corr-uuid",
    "source": "evaluation-worker",
    "workerId": "worker-03"
  }
}
```

#### `evaluation-failed`

```json
{
  "eventId": "evt-uuid-4",
  "eventType": "EVALUATION_FAILED",
  "timestamp": "2026-05-25T10:30:02Z",
  "version": "1.0",
  "payload": {
    "evaluationId": "EVL-10001",
    "userId": "user-uuid",
    "status": "COMPILATION_ERROR",
    "errorCode": "CE_001",
    "errorMessage": "Main.java:5: error: ';' expected",
    "failedAt": "2026-05-25T10:30:02Z"
  },
  "metadata": {
    "correlationId": "corr-uuid",
    "source": "evaluation-worker",
    "workerId": "worker-03",
    "retryCount": 0,
    "maxRetries": 3,
    "retryable": false
  }
}
```

### 4.3 Retry Strategy

| Scenario | Retryable | Max Retries | Backoff |
|----------|-----------|-------------|---------|
| Worker crash / internal error | Yes | 3 | Exponential: 1s, 4s, 16s |
| Timeout (sandbox hung) | Yes | 2 | Fixed: 5s |
| Compilation error | No | 0 | — |
| Runtime error | No | 0 | — |
| Wrong answer | No | 0 | — |
| Kafka producer failure | Yes | 5 | Exponential: 500ms base |

### 4.4 Dead Letter Queue

Events that exhaust all retries are published to `assessify.evaluations.dlq` with:

```json
{
  "originalTopic": "assessify.evaluations.submission-received",
  "originalEvent": { ... },
  "failureReason": "Worker timeout after 3 retries",
  "failedAt": "2026-05-25T10:35:00Z",
  "retryCount": 3
}
```

DLQ messages are monitored via alerting. Manual re-processing can be triggered via the `/retry` API.

---

## 5. High-Level Design (HLD)

### 5.1 Component Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Nginx)                          │
│                  Rate Limiting · JWT Validation · Routing               │
└────────────────────┬──────────────────────┬─────────────────────────────┘
                     │                      │
          ┌──────────▼──────────┐  ┌────────▼────────────────────┐
          │  Assessify Backend  │  │  Evaluation API Service     │
          │  (NestJS - existing)│  │  (NestJS - NEW module)      │
          │                     │  │                              │
          │  /auth/*            │  │  POST /api/v1/evaluations    │
          │  /assessments/*     │  │  GET  /api/v1/evaluations/*  │
          │  /submissions/*     │  │  POST /api/v1/evaluations/   │
          │  /coding/*          │  │       {id}/retry             │
          │  /proctoring/*      │  │  GET  /api/v1/users/         │
          │  /analytics/*       │  │       {userId}/evaluations   │
          └─────────┬───────────┘  └──────────┬──────────────────┘
                    │                          │
                    │     ┌────────────────────┤
                    │     │                    │
                    ▼     ▼                    ▼
          ┌──────────────────┐      ┌───────────────────┐
          │   PostgreSQL     │      │   Apache Kafka     │
          │   (existing DB)  │      │   (Event Bus)      │
          │                  │      │                    │
          │  + evaluations   │      │  submission-received│
          │  + eval_results  │      │  evaluation-started │
          │  + exec_metrics  │      │  evaluation-completed│
          │  + submission_logs│     │  evaluation-failed  │
          └──────────────────┘      │  dlq               │
                    ▲               └──────────┬─────────┘
                    │                          │
                    │               ┌──────────▼──────────┐
                    │               │  Evaluation Workers  │
                    │               │  (Consumer Group)    │
                    └───────────────┤                      │
                                    │  Worker 1 ─ Worker N │
                                    │                      │
                                    │  ┌────────────────┐  │
                                    │  │ Docker Sandbox │  │
                                    │  │ (Code Runner)  │  │
                                    │  └────────────────┘  │
                                    └──────────────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │       Redis          │
                                    │  (existing cache)    │
                                    │  - rate limit state   │
                                    │  - eval status cache  │
                                    │  - idempotency keys   │
                                    └──────────────────────┘
```

### 5.2 Design Decisions

| Decision | Rationale |
|----------|-----------|
| Separate NestJS module (not microservice) | Shares same process/DB as existing backend; avoids distributed transaction complexity |
| Kafka over BullMQ for evaluation events | BullMQ (existing) is for immediate code execution; Kafka provides durable event sourcing, replay, and multi-consumer support |
| BullMQ retained for existing `/coding/*` | No modification to existing code execution flow |
| Human-readable evaluation IDs (`EVL-XXXXX`) | UUIDs used internally; `EVL-` prefix for user-facing display |
| Idempotency via header | Prevents duplicate submissions from network retries |
| Redis for status caching | Reduces DB polling load; 30s TTL |

---

## 6. Low-Level Design (LLD)

### 6.1 Module Structure (within existing NestJS app)

```
backend/src/
├── evaluations/                      # NEW MODULE
│   ├── evaluations.module.ts
│   ├── evaluations.controller.ts     # REST endpoints
│   ├── evaluations.service.ts        # Business logic
│   ├── evaluations.processor.ts      # Kafka consumer / worker logic
│   ├── dto/
│   │   ├── create-evaluation.dto.ts
│   │   ├── evaluation-status.dto.ts
│   │   ├── evaluation-result.dto.ts
│   │   └── evaluation-history-query.dto.ts
│   ├── events/
│   │   ├── evaluation-events.ts      # Event type definitions
│   │   └── evaluation-producer.ts    # Kafka producer
│   ├── interfaces/
│   │   └── evaluation.interface.ts
│   └── guards/
│       └── evaluation-owner.guard.ts # Ensures user can only see own evaluations
├── app.module.ts                     # Add EvaluationsModule import
└── ... (existing modules unchanged)
```

### 6.2 Evaluation Lifecycle State Machine

```
                    ┌─────────┐
  POST /evaluations │ QUEUED  │
  ─────────────────►│         │
                    └────┬────┘
                         │ Worker picks up
                         ▼
                    ┌──────────────┐
                    │ IN_PROGRESS  │
                    └──┬───┬───┬──┘
                       │   │   │
            ┌──────────┘   │   └──────────┐
            ▼              ▼              ▼
    ┌───────────┐  ┌──────────────┐  ┌─────────┐
    │ COMPLETED │  │COMPILATION   │  │ TIMEOUT │
    │           │  │_ERROR        │  │         │
    └───────────┘  └──────────────┘  └─────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │RUNTIME_ERROR │
                   └──────────────┘

    Any non-terminal ──► FAILED (on unrecoverable worker error)
```

### 6.3 Score Calculation

```
Score = (Σ passed_test_case_weight / Σ total_test_case_weight) × max_score

Where:
  - Each test case has a weight (default 1.0, from existing test_cases.weight column)
  - max_score is the question's marks value
  - Hidden test cases contribute to score but input/output are not revealed
```

### 6.4 Concurrency Handling

| Concern | Solution |
|---------|----------|
| Duplicate submissions | Idempotency key in Redis (TTL: 5 minutes) |
| Race condition on status update | Optimistic locking via `updated_at` column + DB transaction |
| Worker contention | Kafka consumer group ensures each message processed by exactly one worker |
| DB connection pool exhaustion | Pool size = 20 per service instance; separate pool for workers |

---

## 7. Sequence Diagrams

### 7.1 Submit and Evaluate (Happy Path)

```
Client          API Gateway     Eval Service      Kafka           Worker          DB          Redis
  │                │                │               │               │              │            │
  │  POST /evaluations              │               │               │              │            │
  │───────────────►│                │               │               │              │            │
  │                │  JWT validate  │               │               │              │            │
  │                │───────────────►│               │               │              │            │
  │                │                │  Check idempotency key        │              │            │
  │                │                │──────────────────────────────────────────────────────────►│
  │                │                │◄─────────────────────────────────────────────────────────│
  │                │                │  INSERT evaluation (QUEUED)   │              │            │
  │                │                │─────────────────────────────────────────────►│            │
  │                │                │◄────────────────────────────────────────────│            │
  │                │                │  Publish submission-received  │              │            │
  │                │                │──────────────►│               │              │            │
  │                │  201 Created   │               │               │              │            │
  │◄───────────────│◄──────────────│               │               │              │            │
  │                │                │               │  Consume msg  │              │            │
  │                │                │               │──────────────►│              │            │
  │                │                │               │               │  UPDATE → IN_PROGRESS     │
  │                │                │               │               │─────────────►│            │
  │                │                │               │               │  Publish eval-started      │
  │                │                │               │◄──────────────│              │            │
  │                │                │               │               │              │            │
  │                │                │               │               │  Run in sandbox            │
  │                │                │               │               │  Execute test cases        │
  │                │                │               │               │              │            │
  │                │                │               │               │  INSERT eval_results       │
  │                │                │               │               │─────────────►│            │
  │                │                │               │               │  INSERT exec_metrics       │
  │                │                │               │               │─────────────►│            │
  │                │                │               │               │  UPDATE → COMPLETED        │
  │                │                │               │               │─────────────►│            │
  │                │                │               │               │  Cache status │            │
  │                │                │               │               │──────────────────────────►│
  │                │                │               │               │  Publish eval-completed    │
  │                │                │               │◄──────────────│              │            │
  │                │                │               │               │              │            │
  │  GET /evaluations/EVL-10001     │               │               │              │            │
  │───────────────►│───────────────►│  Check Redis cache            │              │            │
  │                │                │──────────────────────────────────────────────────────────►│
  │                │                │◄─────────────────────────────────────────────────────────│
  │  200 OK (COMPLETED)             │               │               │              │            │
  │◄───────────────│◄──────────────│               │               │              │            │
```

### 7.2 Failed Evaluation with Retry

```
Client          Eval Service      Kafka           Worker          DB
  │                │               │               │              │
  │  POST /evaluations             │               │              │
  │───────────────►│  CREATE (QUEUED)               │              │
  │◄──────────────│──────────────►│               │              │
  │                │               │──────────────►│              │
  │                │               │               │  Compile fails│
  │                │               │               │──────────────►│ UPDATE → COMPILATION_ERROR
  │                │               │◄──────────────│              │
  │                │               │  eval-failed   │              │
  │                │               │               │              │
  │  GET (poll)    │               │               │              │
  │───────────────►│  status=COMPILATION_ERROR     │              │
  │◄──────────────│               │               │              │
  │                │               │               │              │
  │  (Admin) POST /retry           │               │              │
  │───────────────►│  CREATE new eval (QUEUED)     │              │
  │                │  Link original_eval_id        │              │
  │                │──────────────►│               │              │
  │◄──────────────│               │               │              │
  │  201 (EVL-10002)│              │               │              │
```

---

## 8. Error Response Standards

### 8.1 Standard Error Envelope

All errors follow a consistent format:

```json
{
  "error": {
    "code": "EVAL_001",
    "status": 400,
    "message": "Unsupported programming language: RUST",
    "details": [
      {
        "field": "language",
        "reason": "Must be one of: JAVA, PYTHON, JAVASCRIPT, CPP, GO"
      }
    ],
    "timestamp": "2026-05-25T10:30:00Z",
    "path": "/api/v1/evaluations",
    "traceId": "trace-uuid-123"
  }
}
```

### 8.2 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `EVAL_001` | 400 | Invalid request body / validation error |
| `EVAL_002` | 400 | Unsupported programming language |
| `EVAL_003` | 400 | Source code exceeds max size (100KB) |
| `EVAL_004` | 400 | Cannot retry: evaluation not in FAILED/TIMEOUT status |
| `EVAL_005` | 400 | Maximum retry count exceeded |
| `EVAL_006` | 401 | Invalid or expired JWT token |
| `EVAL_007` | 403 | Insufficient permissions |
| `EVAL_008` | 404 | Evaluation not found |
| `EVAL_009` | 404 | Problem/question not found |
| `EVAL_010` | 409 | Duplicate submission (idempotency key conflict) |
| `EVAL_011` | 422 | Evaluation result not available (status not terminal) |
| `EVAL_012` | 429 | Rate limit exceeded |
| `EVAL_013` | 500 | Internal evaluation error |
| `EVAL_014` | 503 | Evaluation service temporarily unavailable |

---

## 9. Retry Workflow

### 9.1 Automatic Retries (Worker-Level)

```
Submission received
       │
       ▼
  ┌─────────┐    Success    ┌───────────┐
  │  Worker  │─────────────►│ COMPLETED │
  │ Process  │              └───────────┘
  └────┬─────┘
       │ Failure
       ▼
  ┌──────────────────┐
  │ Is Retryable?    │
  └──┬──────────┬────┘
     │ Yes      │ No
     ▼          ▼
  ┌──────┐  ┌────────────────┐
  │Retry │  │ Mark FAILED /  │
  │Count │  │ COMPILATION_   │
  │< Max?│  │ ERROR /        │
  └┬────┬┘  │ RUNTIME_ERROR  │
   │Yes │No └────────────────┘
   ▼    ▼
  Re-   Publish
  queue to DLQ
  with  + Mark
  backoff FAILED
```

### 9.2 Manual Retry (Admin API)

```
POST /api/v1/evaluations/{evaluationId}/retry

Preconditions:
  1. Original evaluation status IN (FAILED, TIMEOUT)
  2. retry_count < max_retries (3)
  3. Caller has role RECRUITER or SUPER_ADMIN

Actions:
  1. Create new evaluation record with:
     - Same source_code, language, problem_id
     - original_eval_id = original evaluation ID
     - retry_count = original.retry_count + 1
     - status = QUEUED
  2. Publish submission-received event
  3. Return new evaluation ID
```

---

## 10. Scalability Architecture

### 10.1 Horizontal Scaling

```
                    ┌─────────────────────────┐
                    │     Load Balancer        │
                    │   (Nginx / AWS ALB)      │
                    └───┬───────┬──────┬──────┘
                        │       │      │
                ┌───────▼──┐┌──▼────┐┌▼───────┐
                │ API Svc  ││API Svc││API Svc  │  ← Stateless, auto-scale
                │ Pod 1    ││Pod 2  ││Pod 3    │     on CPU/request count
                └──────────┘└───────┘└─────────┘
                        │       │      │
                        ▼       ▼      ▼
                ┌──────────────────────────────┐
                │        Kafka Cluster         │
                │  (3 brokers, RF=3)           │
                │  12 partitions per topic      │
                └───┬───────┬──────┬───────────┘
                    │       │      │
            ┌───────▼──┐┌──▼────┐┌▼───────────┐
            │Worker    ││Worker ││Worker       │  ← Scale by adding
            │Pod 1     ││Pod 2  ││Pod 3..N    │     more consumers
            │          ││       ││             │
            │┌────────┐││┌─────┐││┌──────────┐│
            ││Sandbox ││││Sand.││││Sandbox   ││  ← Isolated containers
            │└────────┘│││     │││└──────────┘│     per execution
            └──────────┘│└─────┘│└────────────┘
                        └───────┘
```

### 10.2 Scaling Parameters

| Component | Scaling Strategy | Trigger |
|-----------|-----------------|---------|
| API Service | Horizontal Pod Autoscaler | CPU > 70% or req/s > 500 |
| Evaluation Workers | HPA + KEDA (Kafka lag) | Consumer lag > 100 |
| PostgreSQL | Read replicas | Read query latency > 100ms |
| Redis | Cluster mode | Memory > 80% |
| Kafka | Add partitions | Consumer lag growing |

### 10.3 Capacity Estimates

| Metric | Value |
|--------|-------|
| Peak concurrent submissions | 10,000/min |
| Average evaluation time | 3–5 seconds |
| Workers needed at peak | ~100 (3s avg × 10K/min ÷ 60s) |
| DB writes per evaluation | 1 evaluation + N test results + 1 metrics + M logs |
| Kafka throughput | ~170 messages/sec (10K/min) |
| Redis cache hit ratio target | > 90% for status polls |

---

## 11. Security Design

### 11.1 Authentication & Authorization

| Endpoint | Allowed Roles | Additional Check |
|----------|---------------|------------------|
| `POST /evaluations` | CANDIDATE | Must own the attempt (if attempt_id provided) |
| `GET /evaluations/{id}` | CANDIDATE, RECRUITER, SUPER_ADMIN | CANDIDATE can only see own |
| `GET /evaluations/{id}/result` | CANDIDATE, RECRUITER, SUPER_ADMIN, INTERVIEWER | CANDIDATE: only own + hidden test I/O redacted |
| `POST /evaluations/{id}/retry` | RECRUITER, SUPER_ADMIN | — |
| `GET /users/{userId}/evaluations` | CANDIDATE (own), RECRUITER, SUPER_ADMIN | CANDIDATE: userId must match JWT sub |

### 11.2 Rate Limiting

| Endpoint | Limit | Window | Strategy |
|----------|-------|--------|----------|
| `POST /evaluations` | 10 | 1 minute | Sliding window per user |
| `GET /evaluations/{id}` | 60 | 1 minute | Sliding window per user |
| `POST /evaluations/{id}/retry` | 3 | 1 hour | Fixed window per evaluation |
| Global | 1000 | 1 minute | Per IP |

Implemented via Redis sliding window counter (existing Redis instance).

### 11.3 Code Execution Security

| Threat | Mitigation |
|--------|------------|
| Fork bomb / infinite loop | CPU time limit (cgroup) + wall time limit |
| Memory exhaustion | Memory cgroup limit (256MB default) |
| Network access | Network namespace isolation (no external access) |
| Filesystem access | Read-only rootfs + tmpfs for /tmp (10MB) |
| Privilege escalation | Non-root user (uid 65534), seccomp profile, no capabilities |
| Malicious imports | Restricted system calls via seccomp |
| Code size | 100KB max source code size |
| Output size | 1MB max stdout/stderr |

### 11.4 Input Validation

```
sourceCode:
  - Max length: 100,000 characters
  - Must not be empty
  - UTF-8 encoded

language:
  - Must be one of: JAVA, PYTHON, JAVASCRIPT, CPP, GO (case-insensitive)

customInput:
  - Max length: 10,000 characters
  - Optional

submissionType:
  - Must be one of: RUN, FINAL, PRACTICE

userId:
  - Must match JWT subject claim (for CANDIDATE role)
  - Must exist in users table

problemId:
  - Must exist in questions table
  - Question type must be CODING
```

---

## 12. Deployment Considerations

### 12.1 Infrastructure

| Component | Existing | New |
|-----------|----------|-----|
| NestJS Backend | Yes (add module) | EvaluationsModule |
| PostgreSQL | Yes (add tables) | 4 new tables |
| Redis | Yes (reuse) | Rate limit + cache keys |
| BullMQ | Yes (unchanged) | — |
| Kafka | **No** | New: 3 brokers, 5 topics |
| Evaluation Workers | **No** | New: Kafka consumer pods |
| Docker Sandbox | Partially (existing executor) | Hardened sandbox images |

### 12.2 Kubernetes Resources (New)

```yaml
# Kafka (use Strimzi operator or managed service)
- kafka-cluster (3 brokers, 3 ZooKeeper)
- kafka-topics (5 topics)

# Evaluation Workers
- deployment: evaluation-worker
  replicas: 3 (min) → 20 (max)
  resources:
    requests: { cpu: 500m, memory: 512Mi }
    limits: { cpu: 2000m, memory: 2Gi }

# Sandbox Runner (DaemonSet or sidecar)
- Per worker, Docker-in-Docker or gVisor-based
```

### 12.3 Database Migration

```
Migration order:
  1. Create EvaluationStatus enum
  2. Create SubmissionType enum
  3. Create TestCaseVerdict enum
  4. Create evaluations table
  5. Create evaluation_results table
  6. Create execution_metrics table
  7. Create submission_logs table
  8. Create indexes

Rollback: DROP tables in reverse order, DROP enums
```

### 12.4 Feature Flag

```
FEATURE_EVALUATION_API_ENABLED=true    # Kill switch
EVALUATION_KAFKA_ENABLED=true          # Fall back to BullMQ if Kafka is down
EVALUATION_RATE_LIMIT_ENABLED=true     # Disable rate limiting for load testing
```

### 12.5 Monitoring & Observability

| Metric | Type | Alert Threshold |
|--------|------|-----------------|
| `evaluation.submitted.count` | Counter | — |
| `evaluation.completed.count` | Counter | — |
| `evaluation.failed.count` | Counter | > 5% failure rate |
| `evaluation.duration.histogram` | Histogram | p99 > 30s |
| `evaluation.queue.depth` | Gauge | > 500 |
| `evaluation.worker.active` | Gauge | < 2 |
| `kafka.consumer.lag` | Gauge | > 1000 |

Logging: Structured JSON logs with `evaluationId`, `correlationId`, `userId` fields. Integrated with existing Winston logger.

---

## 13. Swagger/OpenAPI Specification

See separate file: [`openapi.yaml`](./openapi.yaml)

---

## Appendix: Integration with Existing Modules

### What Changes in Existing Code

| File | Change | Risk |
|------|--------|------|
| `backend/src/app.module.ts` | Add `EvaluationsModule` to imports array | None — additive only |
| `backend/prisma/schema.prisma` | Add new enums and models | None — no existing models modified |

### What Does NOT Change

- `auth/*` — Authentication flow unchanged
- `assessments/*` — Assessment CRUD unchanged
- `submissions/*` — Submission flow unchanged
- `coding-execution/*` — Existing BullMQ code execution unchanged
- `proctoring/*` — Proctoring unchanged
- `analytics/*` — Analytics unchanged
- `questions/*` — Questions unchanged
- Frontend — No frontend changes in this module
