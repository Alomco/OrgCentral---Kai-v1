import type { NodeSDK } from '@opentelemetry/sdk-node';

const globalContext = globalThis as typeof globalThis & {
  orgcentralOtelInit?: Promise<void>;
};

interface TelemetryModule {
  getNodeSdk: () => NodeSDK;
}

const isTelemetryDisabled = () => {
  const flag = process.env.ORGCENTRAL_DISABLE_OTEL?.trim().toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes' || flag === 'on';
};

const startTelemetry = async () => {
  try {
    const telemetryModule: TelemetryModule = await import('@/server/telemetry/otel-config');
    const sdk = telemetryModule.getNodeSdk();
    sdk.start();
    process.stdout.write('OpenTelemetry initialized\n');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Failed to initialize OpenTelemetry: ${message}\n`);
  }
};

export function registerNodeTelemetry(): Promise<void> | void {
  if (isTelemetryDisabled()) {
    process.stdout.write('OpenTelemetry disabled via ORGCENTRAL_DISABLE_OTEL\n');
    return;
  }

  if (typeof globalContext.orgcentralOtelInit === 'undefined') {
    globalContext.orgcentralOtelInit = startTelemetry();
  }

  return globalContext.orgcentralOtelInit;
}
