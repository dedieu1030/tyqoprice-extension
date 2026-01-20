/**
 * Test du ECB Rate Manager
 */

import { ECBRateManager } from './src/lib/ecb-rate-manager'

async function testECBRateManager() {
    console.log('🚀 Testing ECB Rate Manager...\n')

    const manager = new ECBRateManager()

    try {
        // Test 1: Récupérer tous les taux (base EUR)
        console.log('📝 Test 1: Get all rates (base EUR)')
        const eurRates = await manager.getRates('EUR')
        console.log('USD:', eurRates.USD)
        console.log('GBP:', eurRates.GBP)
        console.log('JPY:', eurRates.JPY)
        console.log(`Total currencies: ${Object.keys(eurRates).length}`)
        console.log('')

        // Test 2: Conversion
        console.log('📝 Test 2: Convert 100 USD to EUR')
        const converted = await manager.convert(100, 'USD', 'EUR')
        console.log(`100 USD = ${converted.toFixed(2)} EUR`)
        console.log('')

        // Test 3: Taux spécifique
        console.log('📝 Test 3: Get specific rate (USD → GBP)')
        const rate = await manager.getRate('USD', 'GBP')
        console.log(`1 USD = ${rate.toFixed(4)} GBP`)
        console.log('')

        // Test 4: Liste des devises
        console.log('📝 Test 4: List all currencies')
        const currencies = await manager.getCurrencies()
        console.log(`Total: ${currencies.length} currencies`)
        console.log('First 10:', currencies.slice(0, 10).join(', '))
        console.log('')

        // Test 5: Conversions multiples
        console.log('📝 Test 5: Convert 99.99 USD to multiple currencies')
        const price = 99.99
        const targetCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD']

        for (const currency of targetCurrencies) {
            const result = await manager.convert(price, 'USD', currency)
            console.log(`$${price} → ${result.toFixed(2)} ${currency}`)
        }

        console.log('\n✅ All tests passed!')
    } catch (error) {
        console.error('\n❌ Test failed:', error)
    }
}

// Exécuter les tests
testECBRateManager()
