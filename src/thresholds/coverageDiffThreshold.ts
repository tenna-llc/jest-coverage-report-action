export function passesCoverageDiffThreshold(
    headCoveragePercentage: number,
    baseCoveragePercentage: number,
    coverageDiffThreshold: number
): boolean {
    const coverageDiff = baseCoveragePercentage - headCoveragePercentage;
    console.log('[DEBUG] coverageDiff=', coverageDiff);
    console.log(
        '[DEBUG] passesCoverageDiffThreshold=',
        coverageDiff < coverageDiffThreshold
    );

    return coverageDiff < coverageDiffThreshold;
}
