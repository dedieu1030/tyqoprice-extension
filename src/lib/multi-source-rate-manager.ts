/**
 * Multi-Source Exchange Rate Manager
 * Aggregates rates from multiple central banks with fallback support
 * Priority: ECB > Bank of Canada > Banco Central do Brasil
 */

import type { ExchangeRates, CachedRates } from '../shared/types'
import { ECBRateManager } from './ecb-rate-manager'
import { BankOfCanadaManager } from './bank-of-canada-manager'
import { BancoCentralBrasilManager } from './banco-central-brasil-manager'

interface RateSource {
    name: string
    manager: ECBRateManager | BankOfCanadaManager | BancoCentralBrasilManager
    priority: number
    baseCurrency: string
}

/**
 * Multi-Source Exchange Rate Manager
 * Combines rates from ECB, Bank of Canada, and Banco Central do Brasil
 */
export class MultiSourceRateManager {
    private readonly sources: RateSource[] = [
        {
            name: 'ECB',
            manager: new ECBRateManager(),
            priority: 1,
            baseCurrency: 'EUR'
        },
        {
            name: 'BoC',
            manager: new BankOfCanadaManager(),
            priority: 2,
            baseCurrency: 'CAD'
        },
        {
            name: 'BCB',
            manager: new BancoCentralBrasilManager(),
            priority: 3,
            baseCurrency: 'BRL'
        }
    ]

    private readonly cacheExpiry = 24 * 60 * 60 * 1000 // 24 hours

    /**
     * Get all exchange rates aggregated from multiple sources
     * @param baseCurrency - Base currency (default: 'EUR')
     * @returns Object with exchange rates from all sources
     */
    async getRates(baseCurrency: string = 'EUR'): Promise<ExchangeRates> {
        const cacheKey = `tyqoprice_rates_multi_${baseCurrency}`

        // 1. Check cache
        try {
            if (typeof (globalThis as any).chrome !== 'undefined' && (globalThis as any).chrome.storage && (globalThis as any).chrome.storage.local) {
                const cached = await chrome.storage.local.get(cacheKey)
                const data = cached[cacheKey] as CachedRates | undefined

                if (data && data.timestamp && data.rates) {
                    const now = Date.now()
                    if (now - data.timestamp < this.cacheExpiry) {
                        console.log(`✅ Using cached multi-source rates for ${baseCurrency}`)
                        return data.rates
                    }
                    console.log(`⚠️ Multi-source cache expired for ${baseCurrency}`)
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not access storage', error)
        }

        // 2. Fetch from all sources in parallel
        console.log(`🌍 Fetching rates from multiple sources for ${baseCurrency}...`)

        const results = await Promise.allSettled(
            this.sources.map(source =>
                source.manager.getRates(source.baseCurrency)
            )
        )

        // 3. Merge rates by priority (no duplication)
        const mergedRates: ExchangeRates = {}
        const sourcesUsed: string[] = []

        for (let i = 0; i < results.length; i++) {
            const result = results[i]
            const source = this.sources[i]

            if (result.status === 'fulfilled') {
                const rates = result.value
                sourcesUsed.push(source.name)

                // Convert all rates to the requested base currency
                const convertedRates = await this.convertRatesToBase(
                    rates,
                    source.baseCurrency,
                    baseCurrency
                )

                // Merge without duplication (priority order)
                for (const [currency, rate] of Object.entries(convertedRates)) {
                    if (!mergedRates[currency]) {
                        mergedRates[currency] = rate
                    }
                }
            } else {
                console.warn(`⚠️ ${source.name} failed:`, result.reason)
            }
        }

        // 4. Ensure we have at least some rates
        if (Object.keys(mergedRates).length === 0) {
            throw new Error('All rate sources failed')
        }

        // 5. Ensure base currency is present
        mergedRates[baseCurrency] = 1

        // 6. Save to cache
        try {
            if (typeof (globalThis as any).chrome !== 'undefined' && (globalThis as any).chrome.storage && (globalThis as any).chrome.storage.local) {
                const cacheData: CachedRates = {
                    rates: mergedRates,
                    timestamp: Date.now(),
                    baseCurrency,
                    source: sourcesUsed.join('+')
                }
                await chrome.storage.local.set({
                    [cacheKey]: cacheData
                })
                console.log(`💾 Multi-source rates cached for ${baseCurrency}`)
            }
        } catch (error) {
            console.warn('⚠️ Could not save to storage', error)
        }

        console.log(`✅ Multi-source rates fetched: ${Object.keys(mergedRates).length} currencies from [${sourcesUsed.join(', ')}]`)
        return mergedRates
    }

    /**
     * Convert rates from one base currency to another
     * @param rates - Exchange rates object
     * @param fromBase - Current base currency
     * @param toBase - Target base currency
     * @returns Converted exchange rates
     */
    private async convertRatesToBase(
        rates: ExchangeRates,
        fromBase: string,
        toBase: string
    ): Promise<ExchangeRates> {
        if (fromBase === toBase) {
            return rates
        }

        const converted: ExchangeRates = {}

        // Get the rate to convert from fromBase to toBase
        const conversionRate = rates[toBase]

        if (!conversionRate) {
            // If we don't have the target base in our rates, return as-is
            // The multi-source will handle this by using another source
            return rates
        }

        // Convert all rates
        for (const [currency, rate] of Object.entries(rates)) {
            if (currency === fromBase) {
                // The old base becomes a regular currency
                converted[currency] = 1 / conversionRate
            } else if (currency === toBase) {
                // The new base gets rate 1
                converted[currency] = 1
            } else {
                // Convert: (rate in fromBase) / (toBase in fromBase) = rate in toBase
                converted[currency] = rate / conversionRate
            }
        }

        return converted
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

        const rates = await this.getRates('EUR')

        const fromRate = rates[from]
        const toRate = rates[to]

        if (!fromRate || !toRate) {
            throw new Error(`Currency not available: ${!fromRate ? from : to}`)
        }

        // Convert via EUR
        const amountInEUR = amount / fromRate
        const amountInTo = amountInEUR * toRate

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
     * List all available currencies from all sources
     * @returns Array of currency codes
     */
    async getCurrencies(): Promise<string[]> {
        const rates = await this.getRates('EUR')
        return Object.keys(rates).sort()
    }

    /**
     * Get information about which sources are being used
     * @returns Array of source names
     */
    getSourceNames(): string[] {
        return this.sources.map(s => s.name)
    }
}
