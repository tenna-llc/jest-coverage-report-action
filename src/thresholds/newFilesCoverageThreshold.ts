import { CoverageDetailsMap } from '../typings/Coverage';

export function passesNewFilesCoverageThreshold(
    newFilesAverageCoverage: number,
    newFilesCoverageThreshold: number
): boolean {
    return newFilesAverageCoverage >= newFilesCoverageThreshold;
}

export function getAverageCoverage(
    coverageDetailsMap: CoverageDetailsMap
): number {
    const filenames = Object.keys(coverageDetailsMap);
    return (
        filenames.reduce((sum, filename) => {
            return sum + coverageDetailsMap[filename].lines;
        }, 0) / filenames.length
    );
}
