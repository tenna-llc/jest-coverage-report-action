import { decimalToString } from './utils/decimalToString';
import { Icons } from './Icons';
import { insertArgs } from './insertArgs';
import { errors } from './strings.json';
import { FailReason } from '../typings/Report';

const errorToDisplay = (error?: Error) =>
    error ? `\n\`\`\`\n${error.stack}\n\`\`\`` : '';

export const getFormattedFailReason = (
    reason: FailReason,
    icons: Icons,
    coverageThreshold?: number,
    coverageDiffThreshold?: number,
    newFilesCoverageThreshold?: number,
    newFilesAverageCoverage?: number,
    currentCoverage?: number,
    error?: Error
): string =>
    `${icons.errorIcon} ${insertArgs(errors[reason], {
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
