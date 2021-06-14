import { CoverageDetailsMap } from '../typings/Coverage';
import { getNewFilesCoverage } from '../format/getters/getNewFilesCoverage';
import { Report } from '../typings/Report';

export function passesNewFilesCoverageThreshold(
    newFilesAverageCoverage: number,
    newFilesCoverageThreshold: number
): boolean {
    return newFilesAverageCoverage > newFilesCoverageThreshold;
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
