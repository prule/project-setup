# Observability & Incident Response

Observability is about understanding the internal state of our application simply by looking at its external outputs. If an issue occurs in production, our observability stack is what allows us to identify, debug, and fix it without having to guess.

## 1. The Three Pillars
A robust system relies on three interconnected pillars:
- **Logs:** Discrete events that occurred (e.g., "User logged in").
- **Metrics:** Aggregated data over time (e.g., "CPU utilization at 85%", "100 logins per minute").
- **Traces:** The journey of a single request as it crosses boundaries (e.g., from the browser to the API router, to the service layer, to the database, and back).

## 2. Logging Best Practices

### Structured Logging
In production, all logs must be output in **JSON format**. This avoids slow, error-prone RegEx searches and allows log aggregators (like Datadog, ELK, or CloudWatch) to automatically index the data as searchable columns.

- **The Old Way (String Concatenation):** 
  `logger.info("User " + userId + " purchased item " + itemId)`
  This creates a flat string, trapping the IDs inside a sentence.

- **The Structured Way:** We pass the data variables separately from the human-readable message.
  Behind the scenes, the logging library automatically outputs a JSON object:
  ```json
  {
    "timestamp": "2026-06-27T16:32:00Z",
    "level": "INFO",
    "message": "User checkout complete",
    "userId": "123",
    "itemId": "456"
  }
  ```
  Now you can instantly run a fast database query like `userId:123 AND level:INFO`, or build a dashboard charting the top `itemId`s sold.

#### Language-Specific Implementation
**Node.js / TypeScript (using `pino`):**
```typescript
// Pass the data object first, then the message
logger.info({ userId: "123", itemId: "456" }, "User checkout complete");
```

**Kotlin / Spring Boot (using SLF4J 2.0+ Fluent API):**
```kotlin
logger.atInfo()
    .addKeyValue("userId", "123")
    .addKeyValue("itemId", "456")
    .log("User checkout complete")
```

### Proper Use of Log Levels
- `ERROR`: Use only for unexpected system failures that require developer intervention (e.g., Database connection dropped, third-party API is down). Do **not** use `ERROR` for client mistakes like a `400 Bad Request` or an invalid password.
- `WARN`: Use for anomalies or non-fatal issues that might require investigation if they spike (e.g., Rate limits hit, deprecated API usage).
- `INFO`: Use for significant, successful business events (e.g., "User created", "Order processed", "Server started").
- `DEBUG` / `TRACE`: Use for verbose technical details (e.g., raw SQL queries, HTTP payloads). These should be turned **off** in production.

## 3. Distributed Tracing & Correlation IDs
To debug effectively, we must be able to follow a single user's request through the entire system.
- Every incoming HTTP request must be assigned a unique `trace_id` (or Correlation ID) at the entry point.
- This ID must be injected into the logging context (e.g., using MDC in Kotlin/Java) so that *every* subsequent log statement triggered by that request automatically includes the `trace_id`.
- If the backend makes calls to other microservices, the `trace_id` must be passed along in the HTTP headers.

## 4. Metrics & Alerting

Alerts wake people up. Therefore, alerts must be **actionable** and tied to the user experience.
- **Symptom-based Alerting:** Alert on symptoms the user feels (e.g., "Checkout error rate > 5%", "API latency > 1000ms").
- **Avoid Cause-based Alerting:** Do not alert on root causes that don't affect the user (e.g., "CPU at 90%"). If CPU is at 90% but response times are fine, there is no emergency.

### The Metrics Pipeline: Micrometer, Prometheus, and Grafana
To capture these metrics and trigger alerts, we use a standard three-tier pipeline:

1. **Micrometer (The Instrumentation Facade)**
   - **What it is:** Micrometer is to metrics what SLF4J is to logging. It is a vendor-neutral library built into our backend (e.g., Spring Boot) that records data.
   - **How it works:** You inject a `MeterRegistry` into your code to count events (Counters), measure durations (Timers), or track current states (Gauges).
   - **Example Pattern:** 
     ```kotlin
     // Increment a counter when a checkout succeeds
     meterRegistry.counter("orders.checkout.total", "status", "success").increment()
     ```
   - **Output:** Micrometer translates this data into a specific format and exposes it via an HTTP endpoint (usually `/actuator/prometheus`).

2. **Prometheus (The Time-Series Database)**
   - **What it is:** A database explicitly designed to store data over time.
   - **How it works:** Instead of our app "pushing" data out, Prometheus is configured to "pull" (scrape) data. It pings our `/actuator/prometheus` endpoint every 15-30 seconds, collects the latest metrics, and stores them.
   - **Why pull?** It prevents our application from wasting resources pushing metrics over the network. If Prometheus goes down, the application continues running perfectly without backing up network queues.

3. **Grafana (The Visualization & Alerting Engine)**
   - **What it is:** A powerful UI dashboard tool.
   - **How it works:** Grafana connects to Prometheus as a data source. It queries Prometheus using PromQL to draw live graphs (e.g., "Show me `orders.checkout.total` grouped by `status` over the last 24 hours").
   - **Alerting:** We configure Grafana to continuously evaluate these queries. If a query returns a value that crosses a threshold (e.g., HTTP 500 errors > 5%), Grafana fires a webhook to alert the team via Slack, PagerDuty, or email.

## 5. Protecting PII in Logs
Logs are often shipped to third-party tools. We must never log Personally Identifiable Information (PII) or secrets (like passwords, API keys, or credit card numbers). Because PII often sneaks into logs accidentally, follow these strict practices:

- **Never Log Whole Objects:** Avoid `logger.info("Created user", user)`. This will serialize the entire user entity (potentially leaking emails, phone numbers, or password hashes). Instead, explicitly pick non-sensitive fields: `logger.info("Created user", userId=user.id)`.
- **Log IDs, Not Names:** Always log database UUIDs rather than human names or emails. If support needs to contact a user based on an error log, they can cross-reference the UUID in the secure production database. The logging system itself remains entirely anonymous.
- **Implement Global Log Scrubbers:** Configure the root logger to automatically redact sensitive JSON keys before they are printed. For example, in Node.js with Pino:
  ```javascript
  const logger = pino({
    redact: ['user.password', 'user.email', 'ssn']
  })
  ```
  In Spring Boot, similar masking can be achieved via Logback's `replace` regex patterns in the encoder layout.
- **Override `toString()` (Java/Kotlin):** If you absolutely must log domain objects, override their `toString()` methods to intentionally mask sensitive fields (e.g., returning `a***@example.com` instead of the full email).
