// src/server/telemetry/otel-config.ts

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag } from '@opentelemetry/api';
import type { Instrumentation } from '@opentelemetry/instrumentation';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} from '@opentelemetry/semantic-conventions';

type InstrumentationLoader = () => unknown;
const autoInstrumentationLoader: InstrumentationLoader = getNodeAutoInstrumentations as InstrumentationLoader;

const loadInstrumentations = (): Instrumentation[] => {
  const candidate: unknown = autoInstrumentationLoader();
  if (Array.isArray(candidate)) {
    const instrumentations: Instrumentation[] = [];
    for (const item of candidate) {
      if (isInstrumentation(item)) {
        instrumentations.push(item);
      }
    }
    return instrumentations;
  }
  if (isInstrumentation(candidate)) {
    const instrumentations: Instrumentation[] = [];
    instrumentations.push(candidate);
    return instrumentations;
  }
  return [];
};

const hasFunctionProperty = <K extends PropertyKey>(
  value: object,
  property: K,
): value is Record<K, (...args: never[]) => unknown> => typeof (value as Record<K, unknown>)[property] === 'function';

const isInstrumentation = (value: unknown): value is Instrumentation => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return hasFunctionProperty(value, 'enable') && hasFunctionProperty(value, 'disable');
};

// Persist telemetry state across hot reloads
interface TelemetryState {
  sdk?: NodeSDK;
  sigtermHandlerAttached?: boolean;
}

const telemetryGlobal = globalThis as typeof globalThis & {
  __ORG_TELEMETRY__?: TelemetryState;
};

const telemetryState: TelemetryState = telemetryGlobal.__ORG_TELEMETRY__ ?? {};
telemetryGlobal.__ORG_TELEMETRY__ = telemetryState;

const createSdk = (): NodeSDK => new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'orgcentral-backend',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
  }),
  instrumentations: loadInstrumentations(),
});

const attachSigtermHandler = (sdk: NodeSDK) => {
  if (telemetryState.sigtermHandlerAttached) {
    return;
  }

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => {
        process.stdout.write('Tracing terminated\n');
      })
      .catch((error: unknown) => {
        process.stderr.write(`Error terminating tracing: ${error instanceof Error ? error.message : String(error)}\n`);
      })
      .finally(() => process.exit(0));
  });

  telemetryState.sigtermHandlerAttached = true;
};

export const getNodeSdk = (): NodeSDK => {
  if (!telemetryState.sdk) {
    diag.disable();
    telemetryState.sdk = createSdk();
    attachSigtermHandler(telemetryState.sdk);
  }

  return telemetryState.sdk;
};
