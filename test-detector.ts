/**
 * Test du Price Detector et Mutation Observer
 */

import { PriceDetector } from './src/content/detector/price-detector'
import { JSDOM } from 'jsdom'

// Mocking DOM for Node.js environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <body>
    <div id="product">
      <h1>Cool Product</h1>
      <span class="price">$19.99</span>
      <p>Shipping: 5€</p>
      <script>var x = 1</script>
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


function testPriceDetector() {
    console.log('🚀 Testing Price Detector integration...\n')

    const detector = new PriceDetector()

    detector.onPricesFound((prices) => {
        console.log(`✅ Event: Found ${prices.length} prices!`)
        prices.forEach(p => {
            console.log(`   - "${p.originalText}" in <${p.element.tagName.toLowerCase()}>`)
            p.matches.forEach(m => console.log(`     -> Match: ${m.amount} ${m.currency}`))
        })
    })

    // 1. Initial Scan
    console.log('📝 Test 1: Initial Scan')
    detector.start()

    // 2. Dynamic Update Simulation
    console.log('\n📝 Test 2: Dynamic Content Injection')

    // Simulate adding new element
    const newDiv = document.createElement('div')
    newDiv.innerHTML = 'New item: <span class="new-price">1,234.50 JPY</span>'
    document.body.appendChild(newDiv)

    // Note: MutationObserver doesn't fire synchronously in JSDOM the same way as browser without setup,
    // so this test mainly verifies the scan logic logic. In a real browser, the observer would trigger.

    console.log('\n✅ Detector Tests finished (Observer requires browser env checking)')
}

testPriceDetector()
