export interface ExchangeRates {
    [currency: string]: number
}

export interface CachedRates {
    rates: ExchangeRates
    timestamp: number
    baseCurrency: string
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
