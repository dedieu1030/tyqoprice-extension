/**
 * ECB (European Central Bank) Exchange Rate Manager
 * Direct API integration with SDMX JSON format parsing
 */

// Types
export interface ExchangeRates {
    [currency: string]: number
}

interface ECBResponse {
    header: {
        id: string
        prepared: string
        sender: { id: string }
    }
    dataSets: Array<{
        series: {
            [key: string]: {
                observations: {
                    [key: string]: number[]
                }
            }
        }
    }>
    structure: {
        dimensions: {
            series: Array<{
                id: string
                values: Array<{
                    id: string
                    name: string
                }>
            }>
        }
    }
}

/**
 * ECB Exchange Rate Manager
 * Parses SDMX JSON format from ECB API
 */
export class ECBRateManager {
    private readonly baseUrl = 'https://data-api.ecb.europa.eu/service/data'
    private readonly cacheExpiry = 24 * 60 * 60 * 1000 // 24 heures

    /**
     * Récupère tous les taux de change pour une devise de base
     * @param baseCurrency - Devise de base (ex: 'USD', 'EUR')
     * @returns Object avec les taux de change
     */
    async getRates(baseCurrency: string = 'EUR'): Promise<ExchangeRates> {
        console.log(`🏦 Fetching ECB rates for ${baseCurrency}...`)

        // Construire l'URL SDMX
        // Format: EXR/D..{base}.SP00.A
        // D = Daily, .. = all currencies, SP00 = reference rates, A = average
        const url = `${this.baseUrl}/EXR/D..${baseCurrency}.SP00.A?format=jsondata&lastNObservations=1`

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data: ECBResponse = await response.json()

            // Parser le format SDMX
            const rates = this.parseSDMXResponse(data, baseCurrency)

            console.log(`✅ ECB rates fetched: ${Object.keys(rates).length} currencies`)
            return rates

        } catch (error) {
            console.error('❌ Error fetching ECB rates:', error)
            throw error
        }
    }

    /**
     * Parse la réponse SDMX de l'ECB
     * @param data - Réponse JSON de l'API ECB
     * @param baseCurrency - Devise de base
     * @returns Object avec les taux de change
     */
    private parseSDMXResponse(data: ECBResponse, baseCurrency: string): ExchangeRates {
        const rates: ExchangeRates = {}

        // Récupérer la dimension des devises
        const currencyDimension = data.structure.dimensions.series.find(
            (d) => d.id === 'CURRENCY'
        )

        if (!currencyDimension) {
            throw new Error('Currency dimension not found in SDMX response')
        }

        // Parcourir chaque série
        const series = data.dataSets[0].series

        for (const [seriesKey, seriesData] of Object.entries(series)) {
            // seriesKey format: "0:0:0:0:0" ou "0:1:0:0:0"
            // Les indices correspondent aux dimensions dans l'ordre
            const indices = seriesKey.split(':').map(Number)

            // L'index de la devise est le 2ème (indices[1])
            // Dimensions: [FREQ, CURRENCY, CURRENCY_DENOM, EXR_TYPE, EXR_SUFFIX]
            const currencyIndex = indices[1]
            const currency = currencyDimension.values[currencyIndex].id

            // Récupérer le taux (premier élément de l'observation)
            const observations = seriesData.observations
            const observationKey = Object.keys(observations)[0]
            const rate = observations[observationKey][0]

            rates[currency] = rate
        }

        // Ajouter la devise de base avec un taux de 1
        rates[baseCurrency] = 1

        return rates
    }

    /**
     * Convertit un montant d'une devise à une autre
     * @param amount - Montant à convertir
     * @param from - Devise source
     * @param to - Devise cible
     * @returns Montant converti
     */
    async convert(amount: number, from: string, to: string): Promise<number> {
        if (from === to) return amount

        // Si from = EUR, on récupère directement le taux
        if (from === 'EUR') {
            const rates = await this.getRates('EUR')
            return amount * rates[to]
        }

        // Si to = EUR, on fait l'inverse
        if (to === 'EUR') {
            const rates = await this.getRates('EUR')
            return amount / rates[from]
        }

        // Sinon, on passe par EUR
        // from → EUR → to
        const ratesFrom = await this.getRates('EUR')
        const amountInEUR = amount / ratesFrom[from]
        const amountInTo = amountInEUR * ratesFrom[to]

        return amountInTo
    }

    /**
     * Récupère un taux de change spécifique
     * @param from - Devise source
     * @param to - Devise cible
     * @returns Taux de change
     */
    async getRate(from: string, to: string): Promise<number> {
        if (from === to) return 1

        const converted = await this.convert(1, from, to)
        return converted
    }

    /**
     * Liste toutes les devises disponibles
     * @returns Array des codes de devises
     */
    async getCurrencies(): Promise<string[]> {
        const rates = await this.getRates('EUR')
        return Object.keys(rates).sort()
    }
}
