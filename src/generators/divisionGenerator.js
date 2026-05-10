/**
 * Генератор примеров на деление
 */

/**
 * Генерирует случайное число заданной разрядности
 */
function getRandomNumber(digits) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Генерирует примеры на деление
 * @param {number} count - количество примеров
 * @param {number} dividendDigits - разрядность делимого
 * @param {number} divisorDigits - разрядность делителя
 * @returns {Array} массив примеров
 */
export function generateDivision(count, dividendDigits, divisorDigits) {
    const examples = [];
    for (let i = 0; i < count; i++) {
        // Генерируем делитель
        const divisor = getRandomNumber(divisorDigits);
        
        // Генерируем частное и вычисляем делимое для гарантии целого результата
        const quotient = getRandomNumber(dividendDigits - divisorDigits + 1);
        const dividend = divisor * quotient;
        
        // Проверяем разрядность делимого
        const minDividend = Math.pow(10, dividendDigits - 1);
        const maxDividend = Math.pow(10, dividendDigits) - 1;
        
        if (dividend >= minDividend && dividend <= maxDividend) {
            examples.push({ 
                dividend: dividend,
                divisor: divisor,
                type: 'division'
            });
        } else {
            // Если не подходит, генерируем заново
            i--;
        }
    }
    return examples;
}
