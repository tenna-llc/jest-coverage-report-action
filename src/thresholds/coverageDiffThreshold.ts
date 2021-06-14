import { Report } from '../typings/Report';

export function passesCoverageDiffThreshold(
    headReport: Report,
    baseReport: Report,
    coverageDiffThreshold: number
): boolean {
    const headCoveragePercentage = headReport.summary!.find(
        (value) => value.title === 'Statements'
    )!.percentage;

    const baseCoveragePercentage = baseReport.summary!.find(
        (value) => value.title === 'Statements'
    )!.percentage;

    const coverageDiff = headCoveragePercentage - baseCoveragePercentage;
    return coverageDiff < coverageDiffThreshold;
}
