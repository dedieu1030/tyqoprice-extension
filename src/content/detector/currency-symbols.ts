/**
 * Currency Symbols Map
 * Maps currency symbols to their ISO codes and vice versa
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    '₽': 'RUB',
    'kr': 'SEK',
    '₩': 'KRW',
    '₱': 'PHP',
    '฿': 'THB',
    '₫': 'VND',
    '₪': 'ILS',
    'C$': 'CAD',
    'A$': 'AUD',
    'NZ$': 'NZD',
    'HK$': 'HKD',
    'S$': 'SGD',
    'CHF': 'CHF'
}

export const REVERSE_CURRENCY_SYMBOLS = Object.entries(CURRENCY_SYMBOLS).reduce((acc, [symbol, code]) => {
    acc[code] = symbol
    return acc
}, {} as Record<string, string>)

export const ISO_CODES = Object.values(CURRENCY_SYMBOLS)
