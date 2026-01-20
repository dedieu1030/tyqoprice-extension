/**
 * Test du UI Renderer
 */

import { UIRenderer } from './src/content/ui/ui-renderer'
import { CurrencyFormatter } from './src/content/converter/currency-formatter'
import { JSDOM } from 'jsdom'

// Mocking DOM
const dom = new JSDOM(`
  <!DOCTYPE html>
  <body>
    <div id="price-container">
      <span id="price">$19.99</span>
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
global.HTMLElement = dom.window.HTMLElement

function testUIRenderer() {
    console.log('🚀 Testing UI Renderer...\n')

    const renderer = new UIRenderer()

    // Mock PriceElement
    const element = document.getElementById('price') as HTMLElement
    const priceElement = {
        element,
        matches: [],
        originalText: '$19.99'
    }

    const conversions = [
        { amount: 18.50, currency: 'EUR', formatted: '18,50 €' },
        { amount: 15.20, currency: 'GBP', formatted: '£15.20' }
    ]

    // Test 1: Replacement Mode
    console.log('📝 Test 1: Replacement Mode')
    renderer.render(priceElement, conversions, 'replace')

    const newText = element.textContent
    console.log(`Original: $19.99`)
    console.log(`New Text: ${newText}`)

    if (newText === '18,50 € • £15.20') {
        console.log('✅ Replacement successful')
    } else {
        console.log('❌ Replacement failed')
    }

    // Verify Attributes
    console.log('Attributes:', {
        converted: element.getAttribute('data-tyqoprice-converted'),
        original: element.getAttribute('data-original-text')
    })
    console.log('')

    // Test 2: Badge Mode
    console.log('📝 Test 2: Badge Mode (Setup)')
    // Reset
    element.textContent = '$19.99'
    renderer.render(priceElement, conversions, 'badge')

    const hasClass = element.classList.contains('tyqoprice-highlight')
    console.log(`Has Highlight Class: ${hasClass}`)

    if (hasClass) {
        console.log('✅ Badge setup successful')
    } else {
        console.log('❌ Badge setup failed')
    }

    // Note: Testing hover interaction strictly requires browser event simulation which is limited in simple JSDOM script,
    // but we verified the setup.
}

testUIRenderer()
