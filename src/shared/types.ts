export interface ExchangeRates {
    [currency: string]: number
}

export interface CachedRates {
    rates: ExchangeRates
    timestamp: number
    baseCurrency: string
    source?: string // Source name (e.g., 'ECB', 'BoC', 'BCB', 'ECB+BoC+BCB')
}

export interface Currency {
    code: string
    symbol: string
    name: string
}

export interface ConvertedPrice {
    amount: number
    currency: string
    formatted: string
}
