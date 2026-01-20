import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencySelector } from './CurrencySelector'
import { ChatGPTCard } from '@/components/chatgpt/ChatGPTCard'
import { Eye, ShieldCheck, Globe } from 'lucide-react'

export function Settings() {
    return (
        <div className="space-y-6 pb-8">
            {/* Target Currencies section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Globe size={14} className="text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">Connected Models</h3>
                </div>
                <CurrencySelector />
            </div>

            {/* Display Options using ChatGPTCard style */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Eye size={14} className="text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">Vision Settings</h3>
                </div>

                <ChatGPTCard className="p-0 border-none bg-accent/30 hover:bg-accent/40 overflow-hidden">
                    <div className="divide-y divide-border/20">
                        <div className="flex items-center justify-between p-4 px-5">
                            <div className="space-y-0.5">
                                <Label htmlFor="mode-badge" className="text-sm font-semibold tracking-tight">
                                    Badge Mode
                                </Label>
                                <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
                                    Show conversion only on hover.
                                </p>
                            </div>
                            <Switch id="mode-badge" defaultChecked={true} className="scale-75" />
                        </div>

                        <div className="flex items-center justify-between p-4 px-5">
                            <div className="space-y-0.5">
                                <Label htmlFor="auto-convert" className="text-sm font-semibold tracking-tight">
                                    Auto Recognition
                                </Label>
                                <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
                                    Automatically scan pages for prices.
                                </p>
                            </div>
                            <Switch id="auto-convert" defaultChecked={true} className="scale-75" />
                        </div>
                    </div>
                </ChatGPTCard>
            </div>

            {/* Base Currency section */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 px-1">
                    <ShieldCheck size={14} className="text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">Identity</h3>
                </div>

                <ChatGPTCard title="Base Currency" badge="Source" className="bg-transparent border-dashed">
                    <Select defaultValue="EUR">
                        <SelectTrigger className="w-full bg-background/50 border-none shadow-none h-10 px-4 rounded-xl ring-offset-transparent focus:ring-1 focus:ring-primary/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-border shadow-2xl">
                            <SelectItem value="EUR">EUR - Europen Euro</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[9px] text-muted-foreground/60 italic px-1 pt-1">
                        All models will be calculated relative to your base identity.
                    </p>
                </ChatGPTCard>
            </div>
        </div>
    )
}
