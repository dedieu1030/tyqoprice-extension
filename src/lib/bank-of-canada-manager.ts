/**
 * Bank of Canada Valet API Manager
 * REST API integration with JSON format parsing
 * Includes caching via chrome.storage.local
 */

import type { ExchangeRates, CachedRates } from '../shared/types'

interface BoCResponse {
    observations: Array<{
        d: string // Date
        [key: string]: { v: string } | string // FX rates like FXUSDCAD: {v: "1.3500"}
    }>
}

/**
 * Bank of Canada Exchange Rate Manager
 * Parses JSON format from Valet API
 */
export class BankOfCanadaManager {
    private readonly baseUrl = 'https://www.bankofcanada.ca/valet'
    private readonly cacheExpiry = 24 * 60 * 60 * 1000 // 24 hours

    /**
     * Get all exchange rates for a base currency
     * @param baseCurrency - Base currency (default: 'CAD')
     * @returns Object with exchange rates
     */
    async getRates(baseCurrency: string = 'CAD'): Promise<ExchangeRates> {
        const cacheKey = `tyqoprice_rates_boc_${baseCurrency}`

        // 1. Check cache
        try {
            if (typeof (globalThis as any).chrome !== 'undefined' && (globalThis as any).chrome.storage && (globalThis as any).chrome.storage.local) {
                const cached = await chrome.storage.local.get(cacheKey)
                const data = cached[cacheKey] as CachedRates | undefined

                if (data && data.timestamp && data.rates) {
                    const now = Date.now()
                    if (now - data.timestamp < this.cacheExpiry) {
                        console.log(`✅ Using cached BoC rates for ${baseCurrency}`)
                        return data.rates
                    }
                    console.log(`⚠️ BoC cache expired for ${baseCurrency}`)
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not access storage', error)
        }

        // 2. Fetch from API
        console.log(`🇨🇦 Fetching Bank of Canada rates for ${baseCurrency}...`)

        const today = new Date().toISOString().split('T')[0]
        const url = `${this.baseUrl}/observations/group/FX_RATES_DAILY/json?start_date=${today}`

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data: BoCResponse = await response.json()

            // Parse the response
            const rates = this.parseBoCResponse(data, baseCurrency)

            // 3. Save to cache
            try {
                if (typeof (globalThis as any).chrome !== 'undefined' && (globalThis as any).chrome.storage && (globalThis as any).chrome.storage.local) {
                    const cacheData: CachedRates = {
                        rates,
                        timestamp: Date.now(),
                        baseCurrency,
                        source: 'BoC'
                    }
                    await chrome.storage.local.set({
                        [cacheKey]: cacheData
                    })
                    console.log(`💾 BoC rates cached for ${baseCurrency}`)
                }
            } catch (error) {
                console.warn('⚠️ Could not save to storage', error)
            }

            console.log(`✅ BoC rates fetched: ${Object.keys(rates).length} currencies`)
            return rates

        } catch (error) {
            console.error('❌ Error fetching BoC rates:', error)
            throw error
        }
    }

    /**
     * Parse Bank of Canada API response
     * @param data - JSON response from BoC API
     * @param baseCurrency - Base currency
     * @returns Object with exchange rates
     */
    private parseBoCResponse(data: BoCResponse, baseCurrency: string): ExchangeRates {
        const rates: ExchangeRates = {}

        if (!data.observations || data.observations.length === 0) {
            throw new Error('No observations found in BoC response')
        }

        // Get the latest observation
        const latest = data.observations[data.observations.length - 1]

        // Parse all FX rates (format: FXUSDCAD, FXEURCAD, etc.)
        for (const [key, value] of Object.entries(latest)) {
            if (key.startsWith('FX') && typeof value === 'object' && 'v' in value) {
                // Extract currency code (e.g., FXUSDCAD -> USD)
                const currency = key.substring(2, 5)
                const rate = parseFloat(value.v)

                if (!isNaN(rate)) {
                    // BoC rates are in XXX/CAD format
                    if (baseCurrency === 'CAD') {
                        rates[currency] = rate
                    } else {
                        // Convert to requested base currency via CAD
                        // This will be handled by the multi-source manager
                        rates[currency] = rate
                    }
                }
            }
        }

        // Add base currency with rate 1
        rates[baseCurrency] = 1

        return rates
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

        const rates = await this.getRates('CAD')

        // Convert via CAD
        const fromRate = rates[from]
        const toRate = rates[to]

        if (!fromRate || !toRate) {
            throw new Error(`Currency not available: ${!fromRate ? from : to}`)
        }

        // from -> CAD -> to
        const amountInCAD = amount / fromRate
        const amountInTo = amountInCAD * toRate

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
        const rates = await this.getRates('CAD')
        return Object.keys(rates).sort()
    }
}
