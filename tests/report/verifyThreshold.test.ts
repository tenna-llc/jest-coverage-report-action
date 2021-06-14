import { verifyThresholds } from '../../src/report/verifyThresholds';
import BaseReport from './base-report.json';
import HeadReport from './head-report.json';
import cloneDeep from 'clone-deep';
import { Report, FailReason } from '../../src/typings/Report';
import { CoverageSummary } from '../../src/typings/Coverage';
import { UnderThresholdError } from '../../src/errors/UnderThresholdError';
import { DiffUnderThresholdError } from '../../src/errors/DiffUnderThresholdError';
import { NewFilesUnderThresholdError } from '../../src/errors/NewFilesUnderThresholdError';
import { RecoverableError } from '../../src/errors/RecoverableError';

describe('verifyThresholds', () => {
    describe('under coverage threshold', () => {
        let baseReport: Report;
        let headReport: Report;
        beforeEach(() => {
            baseReport = cloneDeep(BaseReport) as Report;
            headReport = cloneDeep(HeadReport) as Report;
        });
        it('should pass if coverage above threshold', async () => {
            verifyThresholds(headReport, baseReport, {
                coverageThreshold: 15,
            });

            expect(headReport.failReason).toBeUndefined();
        });
        it('should pass if no threshold specified', async () => {
            verifyThresholds(headReport, baseReport);

            expect(headReport.failReason).toBeUndefined();
        });
        it('should error out if coverage below threshold', async () => {
            verifyThresholds(headReport, baseReport, {
                coverageThreshold: 80,
            });

            expect(headReport.failReason).toEqual(FailReason.UNDER_THRESHOLD);
            expect(
                (headReport.error as UnderThresholdError).params
                    .coverageThreshold
            ).toEqual(80);
            expect(
                (headReport.error as UnderThresholdError).params.currentCoverage
            ).toEqual(
                headReport.summary?.find(
                    (value: CoverageSummary) => value.title === 'Statements'
                )?.percentage
            );
        });
    });
    describe('coverage diff threshold', () => {
        let baseReport: Report;
        let headReport: Report;
        beforeEach(() => {
            baseReport = cloneDeep(BaseReport) as Report;
            headReport = cloneDeep(HeadReport) as Report;
            if (baseReport.summary && baseReport.summary[0]) {
                baseReport.summary[0].percentage = 10;
            }
        });
        it('should pass if coverage above threshold', async () => {
            verifyThresholds(headReport, baseReport, {
                coverageDiffThreshold: 10,
            });

            expect(headReport.failReason).toBeUndefined();
        });
        it('should pass if no threshold specified', async () => {
            verifyThresholds(headReport, baseReport);

            expect(headReport.failReason).toBeUndefined();
        });
        it('should error out if coverage below threshold', async () => {
            verifyThresholds(headReport, baseReport, {
                coverageDiffThreshold: 2,
            });

            expect(headReport.failReason).toEqual(
                FailReason.DIFF_UNDER_THRESHOLD
            );

            expect(
                (headReport.error as DiffUnderThresholdError).params
                    .coverageDiffThreshold
            ).toEqual(2);

            expect(
                (headReport.error as DiffUnderThresholdError).params
                    .previousCoverage
            ).toEqual(
                baseReport.summary?.find(
                    (value: CoverageSummary) => value.title === 'Statements'
                )?.percentage
            );

            expect(
                (headReport.error as DiffUnderThresholdError).params
                    .currentCoverage
            ).toEqual(
                headReport.summary?.find(
                    (value: CoverageSummary) => value.title === 'Statements'
                )?.percentage
            );
        });
    });
    describe('new files coverage threshold', () => {
        let baseReport: Report;
        let headReport: Report;
        beforeEach(() => {
            baseReport = cloneDeep(BaseReport) as Report;
            headReport = cloneDeep(HeadReport) as Report;
        });
        it('should pass if coverage above threshold', async () => {
            verifyThresholds(headReport, baseReport, {
                newFilesCoverageThreshold: 10,
            });

            expect(headReport.failReason).toBeUndefined();
        });
        it('should pass if no threshold specified', async () => {
            verifyThresholds(headReport, baseReport);

            expect(headReport.failReason).toBeUndefined();
        });
        it('should error out if coverage below threshold', async () => {
            verifyThresholds(headReport, baseReport, {
                newFilesCoverageThreshold: 90,
            });

            expect(headReport.failReason).toEqual(
                FailReason.NEW_FILES_UNDER_THRESHOLD
            );

            expect(
                (headReport.error as NewFilesUnderThresholdError).params
                    .newFilesAverageCoverage
            ).toBeGreaterThan(60);

            expect(
                (headReport.error as NewFilesUnderThresholdError).params
                    .newFilesCoverageThreshold
            ).toEqual(90);
        });
    });
});
