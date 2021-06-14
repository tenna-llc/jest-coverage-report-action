import { decimalToString } from './utils/decimalToString';
import { insertArgs } from './insertArgs';
import { errorIcon, errors } from './strings.json';
import { FailReason } from '../typings/Report';

const errorToDisplay = (error?: Error) =>
    error ? `\n\`\`\`\n${error.stack}\n\`\`\`` : '';

export const getFormattedFailReason = (
    reason: FailReason,
    replacements: Record<string, number> = {},
    error?: Error
): string => {
    const replacementMap = Object.keys(replacements).reduce(
        (replacementMap: Record<string, string> = {}, key: string) => {
            const value = replacements[key];
            replacementMap[key] = decimalToString(value);
            return replacementMap;
        },
        {}
    );
    return `${errorIcon} ${insertArgs(errors[reason], {
        ...replacementMap,
        coveragePath: 'report.json',
    })}${errorToDisplay(error)}`;
};
