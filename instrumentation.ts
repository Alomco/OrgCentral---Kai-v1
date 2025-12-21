export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { registerNodeTelemetry } = await import('./instrumentation.node');
  await registerNodeTelemetry();
}
