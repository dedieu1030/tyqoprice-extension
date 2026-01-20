/**
 * Banco Central do Brasil PTAX API Manager
 * OData REST API integration with JSON format parsing
 * Includes caching via chrome.storage.local
 */

import type { ExchangeRates, CachedRates } from '../shared/types'

interface BCBResponse {
    value: Array<{
        cotacaoCompra: number
        cotacaoVenda: number
        dataHoraCotacao: string
    }>
}

/**
 * Banco Central do Brasil Exchange Rate Manager
 * Parses JSON format from PTAX OData API
 */
export class BancoCentralBrasilManager {
    private readonly baseUrl = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata'
    private readonly cacheExpiry = 24 * 60 * 60 * 1000 // 24 hours

    // Main currencies available in BCB PTAX
    private readonly currencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
        'ARS', 'CLP', 'COP', 'MXN', 'PEN', 'UYU', 'BOB', 'PYG',
        'DKK', 'NOK', 'SEK', 'CNY', 'INR', 'RUB', 'ZAR', 'TRY'
    ]

    /**
     * Get all exchange rates for a base currency
     * @param baseCurrency - Base currency (default: 'BRL')
     * @returns Object with exchange rates
     */
    async getRates(baseCurrency: string = 'BRL'): Promise<ExchangeRates> {
        const cacheKey = `tyqoprice_rates_bcb_${baseCurrency}`

        // 1. Check cache
        try {
            if (typeof (globalThis as any).chrome !== 'undefined' && (globalThis as any).chrome.storage && (globalThis as any).chrome.storage.local) {
                const cached = await chrome.storage.local.get(cacheKey)
                const data = cached[cacheKey] as CachedRates | undefined

                if (data && data.timestamp && data.rates) {
                    const now = Date.now()
                    if (now - data.timestamp < this.cacheExpiry) {
                        console.log(`✅ Using cached BCB rates for ${baseCurrency}`)
                        return data.rates
                    }
                    console.log(`⚠️ BCB cache expired for ${baseCurrency}`)
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not access storage', error)
        }

        // 2. Fetch from API
        console.log(`🇧🇷 Fetching Banco Central do Brasil rates for ${baseCurrency}...`)

        const rates: ExchangeRates = {}
        const today = new Date().toISOString().split('T')[0]
        const formattedDate = today.split('-').reverse().join('-') // DD-MM-YYYY

        try {
            // Fetch rates for each currency
            const promises = this.currencies.map(async (currency) => {
                try {
                    const url = `${this.baseUrl}/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${currency}'&@dataCotacao='${formattedDate}'&$format=json`
                    const response = await fetch(url)

                    if (!response.ok) {
                        console.warn(`⚠️ BCB: Could not fetch ${currency}`)
                        return null
                    }

                    const data: BCBResponse = await response.json()

                    if (data.value && data.value.length > 0) {
                        // Use average of buy and sell rates
                        const latest = data.value[0]
                        const rate = (latest.cotacaoCompra + latest.cotacaoVenda) / 2
                        return { currency, rate }
                    }

                    return null
                } catch (error) {
                    console.warn(`⚠️ BCB: Error fetching ${currency}:`, error)
                    return null
                }
            })

            const results = await Promise.all(promises)

            // Build rates object
            for (const result of results) {
                if (result) {
                    rates[result.currency] = result.rate
                }
            }

            // Add BRL with rate 1
            rates['BRL'] = 1

            // 3. Save to cache
            try {
                if (typeof (globalThis as any).chrome !== 'undefined' && (globalThis as any).chrome.storage && (globalThis as any).chrome.storage.local) {
                    const cacheData: CachedRates = {
                        rates,
                        timestamp: Date.now(),
                        baseCurrency,
                        source: 'BCB'
                    }
                    await chrome.storage.local.set({
                        [cacheKey]: cacheData
                    })
                    console.log(`💾 BCB rates cached for ${baseCurrency}`)
                }
            } catch (error) {
                console.warn('⚠️ Could not save to storage', error)
            }

            console.log(`✅ BCB rates fetched: ${Object.keys(rates).length} currencies`)
            return rates

        } catch (error) {
            console.error('❌ Error fetching BCB rates:', error)
            throw error
        }
    }

    /**
     * Convert amount from one currency to another
     * @param amount - Amount to convert
     * @param from - Source currency
     * @param to - Target currency
     * @returns Converted amount
     */
    async convert(amount: number, from: string, to: string): Promise<number> {
        if (from === to) return amount

        const rates = await this.getRates('BRL')

        // Convert via BRL
        const fromRate = rates[from]
        const toRate = rates[to]

        if (!fromRate || !toRate) {
            throw new Error(`Currency not available: ${!fromRate ? from : to}`)
        }

        // from -> BRL -> to
        const amountInBRL = amount / fromRate
        const amountInTo = amountInBRL * toRate

        return amountInTo
    }

    /**
     * Get exchange rate between two currencies
     * @param from - Source currency
     * @param to - Target currency
     * @returns Exchange rate
     */
    async getRate(from: string, to: string): Promise<number> {
        if (from === to) return 1

        const converted = await this.convert(1, from, to)
        return converted
    }

    /**
     * List all available currencies
     * @returns Array of currency codes
     */
    async getCurrencies(): Promise<string[]> {
        const rates = await this.getRates('BRL')
        return Object.keys(rates).sort()
    }
}
