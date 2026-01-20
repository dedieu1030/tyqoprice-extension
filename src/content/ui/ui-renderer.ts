/**
 * UI Renderer
 * Handles the visual presentation of converted prices
 * Supports: Replacement Mode and Hover Badge Mode
 */

import type { PriceElement } from '../detector/price-detector'
import type { ConvertedPrice } from '../../shared/types'

export class UIRenderer {
    // Styles injected into the page
    private static readonly STYLES = `
    .tyqoprice-badge {
      position: absolute;
      background: #1c1917; /* stone-900 */
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Outfit', system-ui, sans-serif;
      z-index: 10000;
      pointer-events: none;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      opacity: 0;
      transition: opacity 0.2s ease;
      transform: translateY(-100%) marginTop(-5px);
      white-space: nowrap;
    }
    
    .tyqoprice-highlight {
      cursor: help;
      text-decoration: underline dotted #ea580c; /* orange-600 */
      text-underline-offset: 2px;
    }

    .tyqoprice-badge.visible {
      opacity: 1;
    }
  `

    constructor() {
        this.injectStyles()
    }

    private injectStyles() {
        if (document.getElementById('tyqoprice-styles')) return
        const style = document.createElement('style')
        style.id = 'tyqoprice-styles'
        style.textContent = UIRenderer.STYLES
        document.head.appendChild(style)
    }

    /**
     * Render converted prices based on mode
     */
    render(element: PriceElement, conversions: ConvertedPrice[], mode: 'replace' | 'badge') {
        if (mode === 'replace') {
            this.renderReplacement(element, conversions)
        } else {
            this.renderBadge(element, conversions)
        }
    }

    private renderReplacement(element: PriceElement, conversions: ConvertedPrice[]) {
        // Format: "89,50 €" or "89,50 € • $99.00"
        const newText = conversions.map(c => c.formatted).join(' • ')

        // Save original text if not already saved (for toggling back)
        if (!element.element.getAttribute('data-original-text')) {
            element.element.setAttribute('data-original-text', element.originalText)
        }

        // Replace text content safely
        // We only replace the exact matched string to preserve other text in the node
        element.element.textContent = newText // Simple replacement strategy
        element.element.setAttribute('data-tyqoprice-converted', 'true')
    }

    private renderBadge(element: PriceElement, conversions: ConvertedPrice[]) {
        const el = element.element
        el.classList.add('tyqoprice-highlight')

        const badgeText = conversions.map(c => c.formatted).join(' • ')

        // Create tooltip logic
        el.addEventListener('mouseenter', () => {
            this.showBadge(el, badgeText)
        })

        el.addEventListener('mouseleave', () => {
            this.hideBadge()
        })
    }

    private activeBadge: HTMLElement | null = null

    private showBadge(target: HTMLElement, text: string) {
        if (this.activeBadge) this.activeBadge.remove()

        const badge = document.createElement('div')
        badge.className = 'tyqoprice-badge'
        badge.textContent = text
        document.body.appendChild(badge)
        this.activeBadge = badge

        // Positioning
        const rect = target.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        badge.style.top = `${rect.top + scrollTop - 10}px` // 10px above
        badge.style.left = `${rect.left + scrollLeft}px`

        // Trigger animation
        requestAnimationFrame(() => badge.classList.add('visible'))
    }

    private hideBadge() {
        if (this.activeBadge) {
            const badge = this.activeBadge
            badge.classList.remove('visible')
            setTimeout(() => badge.remove(), 200)
            this.activeBadge = null
        }
    }
}
