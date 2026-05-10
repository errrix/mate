import { getRandomNumberByDigits } from './numberUtils';

export function generateSubtraction(count, minuendDigits, subtrahendDigits) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        let minuend = getRandomNumberByDigits(minuendDigits);
        let subtrahend = getRandomNumberByDigits(subtrahendDigits);

        if (subtrahend > minuend) {
            [minuend, subtrahend] = [subtrahend, minuend];
        }

        examples.push({
            numbers: [minuend, subtrahend],
            operator: '-',
            type: 'subtraction'
        });
    }

    return examples;
}
