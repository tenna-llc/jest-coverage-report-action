import { Report } from '../typings/Report';

export function passesCoverageThreshold(
    headReport: Report,
    coverageThreshold: number
): boolean {
    return (
        headReport.summary!.find((value) => value.title === 'Statements')!
            .percentage > coverageThreshold
    );
}
