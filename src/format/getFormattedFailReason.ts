import { decimalToString } from './utils/decimalToString';
import { insertArgs } from './insertArgs';
import { errorIcon, errors } from './strings.json';
import { FailReason } from '../typings/Report';

const errorToDisplay = (error?: Error) =>
    error ? `\n\`\`\`\n${error.stack}\n\`\`\`` : '';

export const getFormattedFailReason = (
    reason: FailReason,
    coverageThreshold?: number,
    coverageDiffThreshold?: number,
    newFilesCoverageThreshold?: number,
    newFilesAverageCoverage?: number,
    currentCoverage?: number,
    error?: Error
): string =>
    `${errorIcon} ${insertArgs(errors[reason], {
        coverageThreshold:
            coverageThreshold && decimalToString(coverageThreshold),
        currentCoverage: currentCoverage && decimalToString(currentCoverage),
        coverageDiffThreshold:
            coverageDiffThreshold && decimalToString(coverageDiffThreshold),
        newFilesCoverageThreshold:
            newFilesCoverageThreshold &&
            decimalToString(newFilesCoverageThreshold),
        newFilesAverageCoverage:
            newFilesAverageCoverage && decimalToString(newFilesAverageCoverage),
        coveragePath: 'report.json',
    })}${errorToDisplay(error)}`;
