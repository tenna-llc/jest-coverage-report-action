import { RecoverableError } from './RecoverableError';

export class DiffUnderThresholdError extends RecoverableError {
    constructor(
        previousCoverage: number,
        currentCoverage: number,
        coverageDiffThreshold: number
    ) {
        super('Coverage diff is under the threshold');
        this.params = {
            previousCoverage,
            currentCoverage,
            coverageDiffThreshold,
        };
    }
}
