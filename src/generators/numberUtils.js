export function getDigitRange(digits) {
    const min = 10 ** (digits - 1);
    const max = 10 ** digits - 1;
    return { min, max };
}

// Deterministic generator (mulberry32) so a sheet can be rebuilt from its seed.
export function createSeededRandom(seed) {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

export function createSeed() {
    return Math.floor(Math.random() * 4294967296);
}

export function getRandomInRange(min, max, random = Math.random) {
    if (max < min) {
        throw new RangeError('Invalid random range.');
    }

    return Math.floor(random() * (max - min + 1)) + min;
}

export function getRandomNumberByDigits(digits, random = Math.random) {
    const { min, max } = getDigitRange(digits);
    return getRandomInRange(min, max, random);
}

export function getRandomDecimalStringByDigits(digits, random = Math.random, decimalPlaces = 2) {
    const integerPart = getRandomNumberByDigits(digits, random);
    const decimalMax = 10 ** decimalPlaces - 1;
    const decimalPart = getRandomInRange(1, decimalMax, random)
        .toString()
        .padStart(decimalPlaces, '0');

    return `${integerPart},${decimalPart}`;
}
