import { RecoverableError } from './RecoverableError';

export class NewFilesUnderThresholdError extends RecoverableError {
    constructor(
        newFilesAverageCoverage: number,
        newFilesCoverageThreshold: number
    ) {
        super('Coverage diff is under the threshold');
        this.params = {
            newFilesAverageCoverage,
            newFilesCoverageThreshold,
        };
    }
}
