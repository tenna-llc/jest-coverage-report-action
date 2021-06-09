import { FailReason, Report } from '../typings/Report';
import { ActionParams } from '../typings/Action';
import { passesCoverageThreshold } from '../thresholds/coverageThreshold';
import { UnderThresholdError } from '../errors/UnderThresholdError';
import { passesCoverageDiffThreshold } from '../thresholds/coverageDiffThreshold';
import { DiffUnderThresholdError } from '../errors/DiffUnderThresholdError';
import { getNewFilesCoverage } from '../format/getters/getNewFilesCoverage';
import {
    getAverageCoverage,
    passesNewFilesCoverageThreshold,
} from '../thresholds/newFilesCoverageThreshold';
import { NewFilesUnderThresholdError } from '../errors/NewFilesUnderThresholdError';

export const verifyThresholds = (
    headReport: Report,
    baseReport: Report,
    actionParams: ActionParams = {}
) => {
    const {
        coverageThreshold,
        coverageDiffThreshold,
        newFilesCoverageThreshold,
    } = actionParams;
    const currentCoverage = headReport.summary?.find(
        (value) => value.title === 'Statements'
    )?.percentage;
    if (
        typeof coverageThreshold !== 'undefined' &&
        !passesCoverageThreshold(headReport, coverageThreshold) &&
        typeof currentCoverage !== 'undefined'
    ) {
        headReport.success = false;
        headReport.failReason = FailReason.UNDER_THRESHOLD;
        headReport.error = new UnderThresholdError(
            currentCoverage,
            coverageThreshold
        );
    }

    if (
        headReport.success &&
        headReport.summary &&
        headReport.details &&
        baseReport.success &&
        baseReport.summary &&
        baseReport.details
    ) {
        const previousCoverage = baseReport.summary?.find(
            (value) => value.title === 'Statements'
        )?.percentage;

        if (
            !headReport.error &&
            typeof coverageDiffThreshold !== 'undefined' &&
            typeof previousCoverage !== 'undefined' &&
            typeof currentCoverage !== 'undefined' &&
            !passesCoverageDiffThreshold(
                currentCoverage,
                previousCoverage,
                coverageDiffThreshold
            )
        ) {
            headReport.success = false;
            headReport.failReason = FailReason.DIFF_UNDER_THRESHOLD;
            headReport.error = new DiffUnderThresholdError(
                previousCoverage,
                currentCoverage,
                coverageDiffThreshold
            );
        }

        const newFilesCoverage = getNewFilesCoverage(
            headReport.details!,
            baseReport.details!
        );

        if (!headReport.error && Object.keys(newFilesCoverage).length > 0) {
            const newFilesAverageCoverage = getAverageCoverage(
                newFilesCoverage
            );
            if (
                typeof newFilesCoverageThreshold !== 'undefined' &&
                typeof newFilesAverageCoverage !== 'undefined' &&
                !passesNewFilesCoverageThreshold(
                    newFilesAverageCoverage,
                    newFilesCoverageThreshold
                )
            ) {
                headReport.success = false;
                headReport.failReason = FailReason.NEW_FILES_UNDER_THRESHOLD;
                headReport.error = new NewFilesUnderThresholdError(
                    newFilesAverageCoverage,
                    newFilesCoverageThreshold
                );
            }
        }
    }
};
