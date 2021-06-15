import { setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import { fetchPreviousReport } from './fetchPreviousReport';
import { getReportTag } from '../constants/getReportTag';
import { getFormattedCoverage } from '../format/getFormattedCoverage';
import { getFormattedFailReason } from '../format/getFormattedFailReason';
import { insertArgs } from '../format/insertArgs';
import REPORT from '../format/REPORT.md';
import { FailReason, Report } from '../typings/Report';
import { ActionParams } from '../typings/Action';
import { RecoverableError } from '../errors/RecoverableError';
import { verifyThresholds } from './verifyThresholds';

export const generateReport = async (
    headReport: Report,
    baseReport: Report,
    repo: { owner: string; repo: string },
    pr: { number: number },
    octokit: ReturnType<typeof getOctokit>,
    actionParams: ActionParams
) => {
    const { coverageThreshold, workingDirectory } = actionParams;

    const previousReport = await fetchPreviousReport(
        octokit,
        repo,
        pr,
        workingDirectory
    );
    try {
        let reportContent = '';
        verifyThresholds(headReport, baseReport, actionParams);

        let failReason = headReport.failReason;

        if (
            headReport.success &&
            headReport.summary &&
            headReport.details &&
            !headReport.failReason
        ) {
            if (
                baseReport.success &&
                baseReport.summary &&
                baseReport.details &&
                !baseReport.failReason
            ) {
                reportContent = getFormattedCoverage(
                    headReport.summary,
                    baseReport.summary,
                    headReport.details,
                    baseReport.details,
                    coverageThreshold
                );
            } else {
                console.log(
                    'Skipping reporting without rejecting request, because head is ok, but base branch has no valid coverage.'
                );

                if (previousReport) {
                    await octokit.issues.deleteComment({
                        ...repo,
                        comment_id: (previousReport as { id: number }).id,
                    });
                }

                return;
            }
        } else {
            failReason = failReason ?? FailReason.UNKNOWN_ERROR;

            if (
                headReport.failReason &&
                [
                    FailReason.UNDER_THRESHOLD,
                    FailReason.DIFF_UNDER_THRESHOLD,
                    FailReason.NEW_FILES_UNDER_THRESHOLD,
                ].includes(headReport.failReason) &&
                headReport.summary &&
                headReport.details &&
                baseReport.summary &&
                baseReport.details
            ) {
                reportContent = getFormattedFailReason(
                    failReason,
                    (headReport.error as RecoverableError).params
                );
                reportContent = reportContent.concat(
                    '\n',
                    getFormattedCoverage(
                        headReport.summary,
                        baseReport.summary,
                        headReport.details,
                        baseReport.details,
                        coverageThreshold
                    )
                );
            } else {
                reportContent = getFormattedFailReason(
                    failReason,
                    {},
                    headReport.error
                );
            }
        }

        const reportBody = insertArgs(REPORT, {
            head: getReportTag(workingDirectory),
            body: reportContent,
            sha: context.payload.after,
            dir: workingDirectory ? `for \`${workingDirectory}\`` : '',
        });

        if (previousReport) {
            await octokit.issues.updateComment({
                ...repo,
                body: reportBody,
                comment_id: (previousReport as { id: number }).id,
            });
        } else {
            await octokit.issues.createComment({
                ...repo,
                body: reportBody,
                issue_number: pr.number,
            });
        }

        if (failReason) {
            setFailed(reportContent);
        }
    } catch (error) {
        console.error(
            "Error deleting and/or creating comment. This can happen for PR's originating from a fork without write permissions."
        );
    }
};
