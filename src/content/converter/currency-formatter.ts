/**
 * Currency Formatter
 * Formats numbers into localized currency strings
 */

export class CurrencyFormatter {
    private static formatters: Map<string, Intl.NumberFormat> = new Map()

    /**
     * Format a price
     * @param amount - The numeric amount
     * @param currencyCode - The ISO currency code (e.g. 'EUR', 'USD')
     * @param locale - The user's locale (default: navigator.language)
     */
    static format(amount: number, currencyCode: string, locale?: string): string {
        const key = `${currencyCode}-${locale || 'default'}`

        if (!this.formatters.has(key)) {
            try {
                const formatter = new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: currencyCode,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
                this.formatters.set(key, formatter)
            } catch (e) {
                // Fallback for invalid currency codes
                console.warn(`Invalid currency code: ${currencyCode}`)
                return `${amount.toFixed(2)} ${currencyCode}`
            }
        }

        return this.formatters.get(key)!.format(amount)
    }
}
