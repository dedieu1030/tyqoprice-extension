import { useState, useEffect } from 'react'
import { Check, Plus, X, Activity, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MultiSourceRateManager } from '@/lib/multi-source-rate-manager'
import { ChatGPTCard } from '@/components/chatgpt/ChatGPTCard'

export function CurrencySelector() {
    const [targetCurrencies, setTargetCurrencies] = useState<string[]>(['USD', 'GBP'])
    const [open, setOpen] = useState(false)
    const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([])

    useEffect(() => {
        const manager = new MultiSourceRateManager()
        manager.getCurrencies().then(setAvailableCurrencies).catch(console.error)
    }, [])

    const addCurrency = (code: string) => {
        if (targetCurrencies.length >= 5) return
        if (!targetCurrencies.includes(code)) {
            setTargetCurrencies([...targetCurrencies, code])
            setOpen(false)
        }
    }

    const removeCurrency = (code: string) => {
        setTargetCurrencies(targetCurrencies.filter(c => c !== code))
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-3">
                {targetCurrencies.map(code => (
                    <ChatGPTCard
                        key={code}
                        title={`${code} - ${code === 'USD' ? 'US Dollar' : code === 'GBP' ? 'British Pound' : 'Currency'}`}
                        badge="Target"
                        headerAction={
                            <button
                                onClick={() => removeCurrency(code)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        }
                    >
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border/40 pt-2 mt-1">
                            <div className="flex flex-row justify-between items-center text-[11px] py-1 border-b border-border/20">
                                <div className="text-muted-foreground flex items-center gap-1">
                                    <Activity size={10} />
                                    Rate
                                </div>
                                <div className="font-mono font-semibold">1.0842</div>
                            </div>
                            <div className="flex flex-row justify-between items-center text-[11px] py-1 border-b border-border/20">
                                <div className="text-muted-foreground flex items-center gap-1">
                                    <TrendingUp size={10} />
                                    24h Chg
                                </div>
                                <div className="font-mono font-semibold text-emerald-500">+0.12%</div>
                            </div>
                        </div>
                    </ChatGPTCard>
                ))}

                {targetCurrencies.length < 5 && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full border-dashed border-2 h-14 rounded-2xl gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                                <Plus className="w-4 h-4" />
                                <span className="font-semibold text-sm">Add Currency Model</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[240px]" align="center">
                            <Command className="rounded-xl border shadow-md">
                                <CommandInput placeholder="Search currency..." className="h-9" />
                                <CommandEmpty>No currency found.</CommandEmpty>
                                <ScrollArea className="h-[200px]">
                                    <CommandGroup>
                                        {availableCurrencies
                                            .filter(c => !targetCurrencies.includes(c))
                                            .map((code) => (
                                                <CommandItem
                                                    key={code}
                                                    value={code}
                                                    onSelect={() => addCurrency(code)}
                                                    className="flex items-center gap-2 px-3"
                                                >
                                                    <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold">
                                                        {code[0]}
                                                    </div>
                                                    <span className="flex-1">{code}</span>
                                                    {targetCurrencies.includes(code) && <Check className="h-4 w-4" />}
                                                </CommandItem>
                                            ))}
                                    </CommandGroup>
                                </ScrollArea>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
            <p className="px-1 text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-60">
                MAX 5 MODELS ENABLED SIMULTANEOUSLY
            </p>
        </div>
    )
}
