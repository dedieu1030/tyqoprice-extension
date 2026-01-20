/**
 * Price Detector
 * Orchestrates parsing and element detection
 */

import { TextParser, PriceMatch } from './text-parser'
import { DynamicContentObserver } from './mutation-observer'

export interface PriceElement {
    element: HTMLElement
    matches: PriceMatch[]
    originalText: string
}

export class PriceDetector {
    private parser: TextParser
    private observer: DynamicContentObserver
    private detectedElements: Map<HTMLElement, PriceElement> = new Map()

    constructor() {
        this.parser = new TextParser()
        this.observer = new DynamicContentObserver((elements) => {
            this.scanElements(elements)
        })
    }

    start() {
        // 1. Initial scan of the entire body
        console.log('🔍 Starting initial full page scan...')
        this.scanElements([document.body])

        // 2. Start observing changes
        this.observer.start()
    }

    stop() {
        this.observer.stop()
        this.detectedElements.clear()
    }

    private scanElements(roots: HTMLElement[]) {
        const newpriceElements: PriceElement[] = []

        for (const root of roots) {
            // Utiliser TreeWalker pour trouver efficacement les noeuds de texte
            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        // Skip script/style contents
                        const parent = node.parentElement
                        if (!parent) return NodeFilter.FILTER_REJECT

                        const tagName = parent.tagName.toLowerCase()
                        if (['script', 'style', 'noscript', 'iframe'].includes(tagName)) {
                            return NodeFilter.FILTER_REJECT
                        }

                        // Skip already processed elements if they haven't changed
                        // (Simplification: for now we re-scan to be safe)

                        return NodeFilter.FILTER_ACCEPT
                    }
                }
            )

            let node: Node | null
            while ((node = walker.nextNode())) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim().length > 0) {
                    const text = node.textContent
                    const matches = this.parser.find(text)

                    if (matches.length > 0) {
                        const element = node.parentElement as HTMLElement

                        // Éviter les doublons ou re-processing inutile
                        if (this.detectedElements.has(element)) continue

                        const priceElement = {
                            element,
                            matches,
                            originalText: text
                        }

                        this.detectedElements.set(element, priceElement)
                        newpriceElements.push(priceElement)

                        // Mark element for debug/styling
                        // element.style.border = '1px solid red' // DEBUG ONLY
                        element.setAttribute('data-tyqoprice-detected', 'true')
                    }
                }
            }
        }

        if (newpriceElements.length > 0) {
            console.log(`💰 Detected ${newpriceElements.length} new price elements`)
            // TODO: Trigger conversion renderer here
            this.dispatchPricesFound(newpriceElements)
        }
    }

    // Event dispatching system would go here
    private onPricesFoundCallback: ((prices: PriceElement[]) => void) | null = null

    onPricesFound(callback: (prices: PriceElement[]) => void) {
        this.onPricesFoundCallback = callback
    }

    private dispatchPricesFound(prices: PriceElement[]) {
        if (this.onPricesFoundCallback) {
            this.onPricesFoundCallback(prices)
        }
    }
}
