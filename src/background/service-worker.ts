import { ECBRateManager } from '../lib/ecb-rate-manager'

// Initialiser le gestionnaire
const rateManager = new ECBRateManager()

// Alarme pour la mise à jour quotidienne (toutes les 24h)
chrome.alarms.create('updateRates', { periodInMinutes: 60 * 24 })

// Écouter l'alarme
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'updateRates') {
        await updateRates()
    }
})

// Mettre à jour au démarrage si nécessaire
chrome.runtime.onStartup.addListener(async () => {
    await updateRates()
})

// Lors de l'installation ou mise à jour
chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
    console.log('📦 Extension installed:', details.reason)
    await updateRates()
})

// Fonction de mise à jour
async function updateRates() {
    try {
        console.log('🔄 Background: Updating exchange rates...')
        // On met à jour pour EUR par défaut (base)
        // Les autres devises seront gérées par conversion ou fetch à la demande
        await rateManager.getRates('EUR')
        console.log('✅ Background: Rates updated successfully')
    } catch (error) {
        console.error('❌ Background: Failed to update rates:', error)
    }
}

// Gestion des messages depuis le content script ou popup
chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request.type === 'GET_RATES') {
        rateManager.getRates(request.baseCurrency || 'EUR')
            .then(rates => sendResponse({ success: true, rates }))
            .catch(error => sendResponse({ success: false, error: error.message }))
        return true // Asynchronous response
    }

    if (request.type === 'CONVERT') {
        rateManager.convert(request.amount, request.from, request.to)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }))
        return true
    }
})
