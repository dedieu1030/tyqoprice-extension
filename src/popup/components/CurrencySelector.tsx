
import { useState, useEffect } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ECBRateManager } from '@/lib/ecb-rate-manager'

export function CurrencySelector() {
    const [targetCurrencies, setTargetCurrencies] = useState<string[]>(['USD', 'GBP'])
    const [open, setOpen] = useState(false)
    const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([])

    useEffect(() => {
        const manager = new ECBRateManager()
        manager.getCurrencies().then(setAvailableCurrencies).catch(console.error)
    }, [])

    const addCurrency = (code: string) => {
        if (targetCurrencies.length >= 5) return // Max 5 limit
        if (!targetCurrencies.includes(code)) {
            setTargetCurrencies([...targetCurrencies, code])
            setOpen(false)
        }
    }

    const removeCurrency = (code: string) => {
        setTargetCurrencies(targetCurrencies.filter(c => c !== code))
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {targetCurrencies.map(code => (
                    <Badge key={code} variant="secondary" className="px-3 py-1 text-sm font-medium gap-2">
                        {code}
                        <button
                            onClick={() => removeCurrency(code)}
                            className="hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full p-0.5 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}

                {targetCurrencies.length < 5 && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 border-dashed gap-1 text-xs">
                                <Plus className="w-3 h-3" />
                                Add Currency
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[200px]" align="start">
                            <Command>
                                <CommandInput placeholder="Search currency..." />
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
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${targetCurrencies.includes(code) ? "opacity-100" : "opacity-0"
                                                            }`}
                                                    />
                                                    {code}
                                                </CommandItem>
                                            ))}
                                    </CommandGroup>
                                </ScrollArea>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
            <p className="text-[10px] text-muted-foreground">
                Select up to 5 currencies to display simultaneously.
            </p>
        </div>
    )
}
