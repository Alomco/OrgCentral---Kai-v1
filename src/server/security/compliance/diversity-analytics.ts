export interface DiversitySample {
    stage: string;
    category: string;
    outcome: 'applied' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
    count: number;
}

export interface DiversitySignal {
    stage: string;
    category: string;
    biasIndex: number;
    sampleSize: number;
}

export function enforceAnonymityFloor(
    samples: DiversitySample[],
    floor = 5,
): DiversitySample[] {
    return samples.map((sample) => ({
        ...sample,
        count: sample.count < floor ? 0 : sample.count,
    }));
}

export function computeBiasSignals(
    samples: DiversitySample[],
    focalOutcome: DiversitySample['outcome'] = 'hired',
): DiversitySignal[] {
    const filtered = samples.filter((sample) => sample.outcome === focalOutcome);
    const totalByStage = new Map<string, number>();
    for (const sample of filtered) {
        totalByStage.set(
            sample.stage,
            (totalByStage.get(sample.stage) ?? 0) + sample.count,
        );
    }

    const signals: DiversitySignal[] = [];
    for (const sample of filtered) {
        const stageTotal = totalByStage.get(sample.stage) ?? 0;
        if (stageTotal === 0) {
            continue;
        }
        const ratio = sample.count / stageTotal;
        const parity = 1 / (filtered.filter((s) => s.stage === sample.stage).length || 1);
        const biasIndex = ratio - parity;
        signals.push({
            stage: sample.stage,
            category: sample.category,
            biasIndex,
            sampleSize: stageTotal,
        });
    }
    return signals;
}
