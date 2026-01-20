/**
 * Test du Text Parser
 */

import { TextParser } from './src/content/detector/text-parser'

function testParser() {
    console.log('🚀 Testing Text Parser...\n')
    const parser = new TextParser()

    const testCases = [
        { text: "Price: $19.99", expected: 19.99, currency: "USD" },
        { text: "Total: 19,99 €", expected: 19.99, currency: "EUR" },
        { text: "Cost: £1,234.50", expected: 1234.50, currency: "GBP" },
        { text: "Value: 1.200,50 €", expected: 1200.50, currency: "EUR" },
        { text: "Amount: 1 000 $", expected: 1000, currency: "USD" },
        { text: "Mix: $10 and 20€", expected: [10, 20] },
        { text: "No price here 1234", expected: [] }
    ]

    for (const test of testCases) {
        const matches = parser.find(test.text)
        console.log(`📝 Text: "${test.text}"`)

        if (matches.length === 0) {
            console.log('   No matches found (Expected for non-price text)')
        } else {
            matches.forEach(m => {
                console.log(`   ✅ Found: ${m.raw} -> ${m.amount} ${m.currency}`)
            })
        }
        console.log('')
    }
}

testParser()
