import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRightLeft } from 'lucide-react'
import { ECBRateManager } from '@/lib/ecb-rate-manager'

export function SimpleConverter() {
    const [amount, setAmount] = useState<string>('1')
    const [from, setFrom] = useState<string>('USD')
    const [to, setTo] = useState<string>('EUR')
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [currencies, setCurrencies] = useState<string[]>([])

    useEffect(() => {
        // Load currencies
        const manager = new ECBRateManager()
        manager.getCurrencies().then(setCurrencies).catch(console.error)
    }, [])

    useEffect(() => {
        handleConvert()
    }, [amount, from, to])

    const handleConvert = async () => {
        if (!amount || isNaN(Number(amount))) return

        setLoading(true)
        try {
            // In a real extension environment, we would use chrome.runtime.sendMessage
            // asking background script to convert. Here we instantiate logic directly for simplicity in UI
            // or use the same shared logic.
            // For this demo component:
            const manager = new ECBRateManager()
            const val = await manager.convert(Number(amount), from, to)
            setResult(val.toLocaleString(undefined, {
                style: 'currency',
                currency: to
            }))
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                        className="h-9 font-mono"
                    />
                </div>
                <div className="pb-2 text-muted-foreground">
                    <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Select value={from} onValueChange={setFrom}>
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {currencies.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Select value={to} onValueChange={setTo}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {currencies.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
                <div className="text-xs text-muted-foreground mb-1">Result</div>
                <div className="text-2xl font-bold text-stone-900 dark:text-stone-50 font-mono tracking-tight">
                    {loading ? '...' : result}
                </div>
            </div>
        </div>
    )
}
