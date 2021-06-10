import { argv } from 'process';

import { setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import { createFailedTestsAnnotations } from './annotations/createFailedTestsAnnotations';
import { isAnnotationEnabled } from './annotations/isAnnotationEnabled';
import { isAnnotationsOptionValid } from './annotations/isAnnotationsOptionValid';
import { collectCoverage } from './collect/collectCoverage';
import { formatFailedTestsAnnotations } from './format/annotations/formatFailedTestsAnnotations';
import { Icons } from './format/Icons';
import { icons } from './format/strings.json';
import { getNewFilesCoverage } from './format/getters/getNewFilesCoverage';
import { generateReport } from './report/generateReport';
import { FailReason } from './typings/Report';

async function run() {
    try {
        const {
            payload: { pull_request },
            repo,
        } = context;

        if (!pull_request) {
            throw new Error(
                'jest-coverage-report-action supports only pull requests.'
            );
        }

        const [
            token,
            testScript,
            coverageThresholdStr,
            workingDirectory,
            iconType,
            annotations,
            coverageDiffThresholdStr,
            newFilesCoverageThresholdStr,
        ] = argv.slice(2);

        const coverageThreshold = coverageThresholdStr
            ? parseFloat(coverageThresholdStr)
            : undefined;

        if (!Object.keys(icons).includes(iconType)) {
            throw new Error(
                `Specify icons type (${iconType}) is not supported. Available options: ${Object.keys(
                    icons
                ).join(', ')}.`
            );
        }

        if (!isAnnotationsOptionValid(annotations)) {
            throw new Error(
                `Annotations option has invalid value: "${annotations}". Please, check documentation for proper configuration.`
            );
        }

        const coverageDiffThreshold = coverageDiffThresholdStr
            ? parseFloat(coverageDiffThresholdStr)
            : undefined;

        const newFilesCoverageThreshold = newFilesCoverageThresholdStr
            ? parseFloat(newFilesCoverageThresholdStr)
            : undefined;

        if (
            coverageThreshold !== undefined &&
            (coverageThreshold > 100 || coverageThreshold < 0)
        ) {
            throw new Error(
                `Specified threshold '${coverageThreshold}' is not valid. Threshold should be more than 0 and less than 100.`
            );
        }

        const octokit = getOctokit(token);

        const [headReport, jsonReport] = await collectCoverage(
            testScript,
            undefined,
            workingDirectory
        );
        const [baseReport] = await collectCoverage(
            testScript,
            pull_request.base.ref,
            workingDirectory
        );

        if (
            coverageThreshold !== undefined &&
            headReport.success &&
            headReport.summary &&
            headReport.details &&
            !headReport.failReason &&
            headReport.summary.find((value) => value.title === 'Statements')!
                .percentage < coverageThreshold
        ) {
            headReport.success = false;
            headReport.failReason = FailReason.UNDER_THRESHOLD;
        }

        if (jsonReport && isAnnotationEnabled(annotations, 'failed-tests')) {
            const failedAnnotations = createFailedTestsAnnotations(jsonReport);
            try {
                await octokit.checks.create(
                    formatFailedTestsAnnotations(jsonReport, failedAnnotations)
                );
            } catch (err) {
                console.error('Failed to create annotations', err);
            }
        }

        if (
            coverageDiffThreshold !== undefined &&
            headReport.success &&
            headReport.summary &&
            headReport.details &&
            baseReport.success &&
            baseReport.summary &&
            baseReport.details &&
            !headReport.failReason
        ) {
            const headCoveragePercentage = headReport.summary.find(
                (value) => value.title === 'Statements'
            )!.percentage;

            const baseCoveragePercentage = baseReport.summary.find(
                (value) => value.title === 'Statements'
            )!.percentage;

            const coverageDiff =
                headCoveragePercentage - baseCoveragePercentage;
            if (coverageDiff > coverageDiffThreshold) {
                headReport.success = false;
                headReport.failReason = FailReason.DIFF_UNDER_THRESHOLD;
            }
        }
        let newFilesAverageCoverage;
        if (
            newFilesCoverageThreshold !== undefined &&
            headReport.success &&
            headReport.summary &&
            headReport.details &&
            baseReport.success &&
            baseReport.summary &&
            baseReport.details &&
            !headReport.failReason
        ) {
            const newFilesCoverage = getNewFilesCoverage(
                headReport.details,
                baseReport.details
            );

            const filenames = Object.keys(newFilesCoverage);
            newFilesAverageCoverage =
                filenames.reduce((sum, filename) => {
                    return sum + newFilesCoverage[filename].lines;
                }, 0) / filenames.length;

            if (newFilesAverageCoverage < newFilesCoverageThreshold) {
                headReport.success = false;
                headReport.failReason = FailReason.NEW_FILES_UNDER_THRESHOLD;
            }
        }

        await generateReport(
            (icons as Record<string, Icons>)[iconType],
            headReport,
            baseReport,
            coverageThreshold,
            coverageDiffThreshold,
            newFilesCoverageThreshold,
            newFilesAverageCoverage,
            repo,
            pull_request,
            octokit,
            workingDirectory
        );
    } catch (error) {
        setFailed(error.message);
    }
}

run();
