/**
 * Main Content Script
 * Entry point for Tyqoprice extension on web pages
 */

import { PriceDetector } from './detector/price-detector'
import { UIRenderer } from './ui/ui-renderer'
import { CurrencyFormatter } from './converter/currency-formatter'
import { Messenger } from '../shared/utils/messaging'
import { ExchangeRates, ConvertedPrice } from '../shared/types'

class TyqopriceContent {
    private detector: PriceDetector
    private renderer: UIRenderer
    private messenger: Messenger
    private rates: ExchangeRates | null = null

    // Settings (mocked for now, will fetch from storage)
    private settings = {
        enabled: true,
        baseCurrency: 'EUR', // Devise de l'utilisateur
        targetCurrencies: ['EUR', 'GBP'], // Devises à afficher
        mode: 'replace' as 'replace' | 'badge'
    }

    constructor() {
        this.detector = new PriceDetector()
        this.renderer = new UIRenderer()
        this.messenger = new Messenger()

        this.init()
    }

    async init() {
        console.log('🚀 Tyqoprice starting...')

        // 1. Fetch rates immediately
        try {
            // Pour l'instant on fetch les taux en base EUR (notre référence) car on convertit tout via EUR
            // Dans le futur on pourrait optimiser
            this.rates = await this.messenger.getRates('EUR')
            console.log('✅ Rates received:', Object.keys(this.rates).length)
        } catch (error) {
            console.error('❌ Failed to get rates:', error)
            return
        }

        // 2. Setup detection callback
        this.detector.onPricesFound((elements) => {
            this.processElements(elements)
        })

        // 3. Start detection
        this.detector.start()
    }

    private processElements(elements: any[]) {
        if (!this.rates || !this.settings.enabled) return

        for (const item of elements) {
            const { element, matches } = item
            const conversions: ConvertedPrice[] = []

            // On prend le premier match pour simplifier (souvent le bon)
            const match = matches[0]
            if (!match) continue

            // Convertir vers les devises cibles
            for (const targetCode of this.settings.targetCurrencies) {
                // Skip si c'est la même devise
                if (match.currency === targetCode) continue

                const convertedAmount = this.convert(match.amount, match.currency, targetCode)
                if (convertedAmount !== null) {
                    conversions.push({
                        amount: convertedAmount,
                        currency: targetCode,
                        formatted: CurrencyFormatter.format(convertedAmount, targetCode)
                    })
                }
            }

            if (conversions.length > 0) {
                this.renderer.render(item, conversions, this.settings.mode)
            }
        }
    }

    private convert(amount: number, from: string, to: string): number | null {
        if (!this.rates) return null

        // Conversion via EUR (pivot)
        // Formula: (Amount / Rate_From_EUR) * Rate_To_EUR

        // Si from est EUR, rate est 1. Si to est EUR, rate est 1.
        const rateFrom = this.rates[from]
        const rateTo = this.rates[to]

        if (!rateFrom || !rateTo) return null

        const amountInEur = amount / rateFrom
        const result = amountInEur * rateTo

        return result
    }
}

// Start the application
new TyqopriceContent()
