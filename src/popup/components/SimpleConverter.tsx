import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeftRight, Sparkles } from 'lucide-react'
import { MultiSourceRateManager } from '@/lib/multi-source-rate-manager'
import { ChatGPTCard } from '@/components/chatgpt/ChatGPTCard'

export function SimpleConverter() {
    const [amount, setAmount] = useState<string>('1')
    const [from, setFrom] = useState<string>('USD')
    const [to, setTo] = useState<string>('EUR')
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [currencies, setCurrencies] = useState<string[]>([])

    useEffect(() => {
        const manager = new MultiSourceRateManager()
        manager.getCurrencies().then(setCurrencies).catch(console.error)
    }, [])

    useEffect(() => {
        handleConvert()
    }, [amount, from, to])

    const handleConvert = async () => {
        if (!amount || isNaN(Number(amount))) return
        setLoading(true)
        try {
            const manager = new MultiSourceRateManager()
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

    const swap = () => {
        setFrom(to)
        setTo(from)
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Sparkles size={14} className="text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">Reasoning Engine</h3>
                </div>

                <ChatGPTCard className="p-5 border-none bg-accent/30">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Simulation Amount</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                                className="h-12 text-lg font-mono bg-background/50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Source</Label>
                                <Select value={from} onValueChange={setFrom}>
                                    <SelectTrigger className="h-10 bg-background/50 border-none rounded-xl shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {currencies.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <button
                                onClick={swap}
                                className="mb-0.5 h-10 w-10 flex items-center justify-center rounded-xl bg-background/50 text-muted-foreground hover:text-primary hover:bg-background transition-all"
                            >
                                <ArrowLeftRight size={16} />
                            </button>

                            <div className="flex-1 space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Target</Label>
                                <Select value={to} onValueChange={setTo}>
                                    <SelectTrigger className="h-10 bg-background/50 border-none rounded-xl shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {currencies.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </ChatGPTCard>
            </div>

            <div className="space-y-3">
                <ChatGPTCard badge="Output" title="Calculated result" className="bg-primary/5 border-primary/10">
                    <div className="py-4 text-center">
                        <div className="text-3xl font-bold text-foreground font-mono tracking-tighter">
                            {loading ? '...' : result || '—'}
                        </div>
                    </div>
                </ChatGPTCard>
            </div>
        </div>
    )
}
