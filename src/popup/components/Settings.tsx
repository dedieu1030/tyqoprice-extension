
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencySelector } from './CurrencySelector'

export function Settings() {
    return (
        <div className="space-y-4 py-4">
            {/* Target Currencies section */}
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Target Currencies</CardTitle>
                </CardHeader>
                <CardContent>
                    <CurrencySelector />
                </CardContent>
            </Card>

            {/* Toggles section */}
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Display Options</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="mode-badge" className="text-sm font-medium">
                                Badge Mode (Hover)
                            </Label>
                            <p className="text-[10px] text-muted-foreground">
                                Show converted price only when hovering original price.
                            </p>
                        </div>
                        <Switch id="mode-badge" defaultChecked={true} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="auto-convert" className="text-sm font-medium">
                                Auto Convert
                            </Label>
                            <p className="text-[10px] text-muted-foreground">
                                Automatically detect prices on new pages.
                            </p>
                        </div>
                        <Switch id="auto-convert" defaultChecked={true} />
                    </div>
                </CardContent>
            </Card>

            {/* Base Currency section */}
            <div className="space-y-2 pt-2">
                <Label className="text-xs text-muted-foreground">Your Base Currency</Label>
                <Select defaultValue="EUR">
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
