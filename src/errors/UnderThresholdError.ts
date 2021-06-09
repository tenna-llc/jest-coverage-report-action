import { RecoverableError } from './RecoverableError';
import { FailReason } from '../typings/Report';

export class UnderThresholdError extends RecoverableError {
    constructor(currentCoverage: number, coverageThreshold: number) {
        super('Files coverage is under specified threshold');
        this.params = {
            currentCoverage,
            coverageThreshold,
        };
    }
}
