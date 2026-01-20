/**
 * Messaging Utility
 * Helper for communicating with the background script
 */

import { ExchangeRates } from '../../shared/types'

export class Messenger {
    async getRates(base: string): Promise<ExchangeRates> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'GET_RATES', baseCurrency: base }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError)
                } else if (response && response.success) {
                    resolve(response.rates)
                } else {
                    reject(new Error(response?.error || 'Unknown error'))
                }
            })
        })
    }
}
