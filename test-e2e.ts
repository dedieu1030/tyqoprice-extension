/**
 * Test E2E Simulation
 */

import { PriceDetector } from './src/content/detector/price-detector'
import { JSDOM } from 'jsdom'

// Mock DOM
const dom = new JSDOM(`
  <!DOCTYPE html>
  <body>
    <div id="product">
      <span class="price">$100.00</span>
    </div>
  </body>
`)

// @ts-ignore
global.window = dom.window
// @ts-ignore
global.document = dom.window.document
// @ts-ignore
global.Node = dom.window.Node
// @ts-ignore
global.NodeFilter = dom.window.NodeFilter
// @ts-ignore
global.MutationObserver = dom.window.MutationObserver
// @ts-ignore
global.HTMLElement = dom.window.HTMLElement

// Mock Messenger
const mockRates = {
    'USD': 1.10, // 1 EUR = 1.10 USD
    'GBP': 0.85, // 1 EUR = 0.85 GBP
    'EUR': 1.00
}

function testE2ESimulation() {
    console.log('🚀 Testing E2E Flow Simulation...\n')

    // 1. Detection
    const detector = new PriceDetector()
    let detected = false

    detector.onPricesFound((elements) => {
        detected = true
        console.log(`✅ Detection: Found ${elements.length} prices`)

        // 2. Conversion (Simulation of Content Script Logic)
        const item = elements[0]
        const match = item.matches[0]

        console.log(`   Source: ${match.amount} ${match.currency}`)

        // Convert USD to EUR
        // Formula: (Amount / Rate_USD) * Rate_EUR
        // (100 / 1.10) * 1.00 = 90.90 EUR

        const rateFrom = mockRates[match.currency as keyof typeof mockRates]
        const rateTo = mockRates['EUR']

        if (rateFrom && rateTo) {
            const converted = (match.amount / rateFrom) * rateTo
            console.log(`   Converted: ${converted.toFixed(2)} EUR`)

            if (Math.abs(converted - 90.91) < 0.1) {
                console.log('✅ Conversion logic verified')
            } else {
                console.log('❌ Conversion logic error')
            }
        }
    })

    detector.start()

    if (!detected) {
        console.log('❌ Detection failed to trigger')
    }
}

testE2ESimulation()
