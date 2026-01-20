/**
 * Text Parser State Machine
 * Detects price patterns in text nodes (e.g., "$19.99", "20 €", "1,234.50 USD")
 */

import { CURRENCY_SYMBOLS, ISO_CODES } from './currency-symbols'

export interface PriceMatch {
    raw: string        // Le texte complet détecté (ex: "$19.99")
    amount: number     // Le montant numérique (ex: 19.99)
    currency: string   // Le code ISO de la devise (ex: "USD")
    index: number      // La position dans le texte
    length: number     // La longueur du match
}

export class TextParser {
    // Regex pour détecter les montants : 1,234.56 ou 1.234,56 ou 1 234,56
    // Supporte les séparateurs . , et espace
    private static readonly AMOUNT_REGEX = /[\d]+(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?/

    /**
     * Trouve tous les prix dans un texte
     */
    find(text: string): PriceMatch[] {
        const matches: PriceMatch[] = []

        // 1. Chercher les symboles de devise ($10, 10€)
        for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
            this.findWithSymbol(text, symbol, code, matches)
        }

        // 2. Chercher les codes ISO (10 USD, USD 10)
        for (const code of ISO_CODES) {
            this.findWithSymbol(text, code, code, matches)
        }

        // Trier les matches par index et retirer les chevauchements
        return this.filterOverlaps(matches)
    }

    private findWithSymbol(text: string, symbol: string, code: string, matches: PriceMatch[]) {
        // Échapper les caractères spéciaux pour la regex
        const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        // Patterns possibles :
        // 1. Symbole avant : $10.99, $ 10.99
        // 2. Symbole après : 10.99$, 10.99 $

        const regex = new RegExp(
            // Symbole avant (group 1) OU Symbole après (group 2)
            `(${escapedSymbol}\\s*${TextParser.AMOUNT_REGEX.source})|(${TextParser.AMOUNT_REGEX.source}\\s*${escapedSymbol})`,
            'g' // Global flag to find all matches
        )

        let match
        while ((match = regex.exec(text)) !== null) {
            const raw = match[0]
            const amountStr = raw.replace(symbol, '').trim()
            const amount = this.parseAmount(amountStr)

            if (!isNaN(amount)) {
                matches.push({
                    raw,
                    amount,
                    currency: code,
                    index: match.index,
                    length: raw.length
                })
            }
        }
    }

    private parseAmount(amountStr: string): number {
        // Normaliser le format numérique
        // 1.234,56 -> 1234.56
        // 1,234.56 -> 1234.56

        // Retirer les espaces insécables
        let clean = amountStr.replace(/\s/g, '').replace(/\u00A0/g, '')

        // Déterminer le séparateur décimal (le dernier . ou ,)
        const lastComma = clean.lastIndexOf(',')
        const lastDot = clean.lastIndexOf('.')

        let decimalSeparator = '.'
        if (lastComma > lastDot) decimalSeparator = ','

        // Si ',' est le séparateur décimal, on remplace les autres '.' par rien et ',' par '.'
        if (decimalSeparator === ',') {
            clean = clean.replace(/\./g, '').replace(',', '.')
        } else {
            // Si '.' est le séparateur décimal, on remplace les ',' par rien
            clean = clean.replace(/,/g, '')
        }

        return parseFloat(clean)
    }

    private filterOverlaps(matches: PriceMatch[]): PriceMatch[] {
        // Trier par position
        matches.sort((a, b) => a.index - b.index)

        const result: PriceMatch[] = []
        let lastEnd = -1

        for (const match of matches) {
            // Si ce match commence après la fin du dernier match accepté
            if (match.index >= lastEnd) {
                result.push(match)
                lastEnd = match.index + match.length
            }
            // Si chevauchement, on garde le plus long (généralement le plus précis)
            else {
                const lastMatch = result[result.length - 1]
                if (match.length > lastMatch.length) {
                    result.pop()
                    result.push(match)
                    lastEnd = match.index + match.length
                }
            }
        }

        return result
    }
}
