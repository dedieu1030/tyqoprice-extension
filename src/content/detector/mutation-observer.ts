/**
 * Mutation Observer for Price Detection
 * Detects dynamic content changes (AJAX, SPA navigations) and triggers price detection
 */

export class DynamicContentObserver {
    private observer: MutationObserver | null = null
    private callback: (elements: HTMLElement[]) => void
    private isObserving = false

    // Throttle configuration
    private pendingElements: Set<HTMLElement> = new Set()
    private throttleTimeout: number | null = null
    private readonly THROTTLE_DELAY = 500 // ms

    constructor(callback: (elements: HTMLElement[]) => void) {
        this.callback = callback
    }

    start() {
        if (this.isObserving) return

        this.observer = new MutationObserver((mutations) => {
            this.handleMutations(mutations)
        })

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true // Detect text changes
        })

        this.isObserving = true
        console.log('👀 Dynamic Content Observer started')
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect()
            this.observer = null
        }
        this.isObserving = false
        this.pendingElements.clear()
        if (this.throttleTimeout) {
            clearTimeout(this.throttleTimeout)
            this.throttleTimeout = null
        }
    }

    private handleMutations(mutations: MutationRecord[]) {
        let hasNewContent = false

        for (const mutation of mutations) {
            // Handle added nodes
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement
                    // Skip script, style, and our own injected elements
                    if (this.shouldSkipElement(element)) continue

                    this.pendingElements.add(element)
                    hasNewContent = true
                }
            }

            // Handle text changes
            if (mutation.type === 'characterData' && mutation.target.parentElement) {
                this.pendingElements.add(mutation.target.parentElement)
                hasNewContent = true
            }
        }

        if (hasNewContent) {
            this.scheduleProcessing()
        }
    }

    private shouldSkipElement(element: HTMLElement): boolean {
        const tagName = element.tagName.toLowerCase()
        return (
            tagName === 'script' ||
            tagName === 'style' ||
            tagName === 'noscript' ||
            tagName === 'iframe' ||
            element.hasAttribute('data-tyqoprice-ignore') || // Our own UI elements
            element.closest('[data-tyqoprice-ignore]') !== null
        )
    }

    private scheduleProcessing() {
        if (this.throttleTimeout) return

        this.throttleTimeout = window.setTimeout(() => {
            this.processPending()
            this.throttleTimeout = null
        }, this.THROTTLE_DELAY)
    }

    private processPending() {
        if (this.pendingElements.size === 0) return

        const elements = Array.from(this.pendingElements)
        this.pendingElements.clear()

        //console.log(`⚡ Processing ${elements.length} dynamic elements`)
        this.callback(elements)
    }
}
