export function passesCoverageDiffThreshold(
    headCoveragePercentage: number,
    baseCoveragePercentage: number,
    coverageDiffThreshold: number
): boolean {
    const coverageDiff = baseCoveragePercentage - headCoveragePercentage;

    return coverageDiff <= coverageDiffThreshold;
}
