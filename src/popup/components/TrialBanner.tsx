
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Zap } from 'lucide-react'

interface TrialBannerProps {
    daysRemaining: number
    isActive: boolean
}

export function TrialBanner({ daysRemaining, isActive }: TrialBannerProps) {
    if (!isActive) return null

    // Calculate progress percentage (inverse: 7 days = 0%, 0 days = 100%)
    const percentage = ((7 - daysRemaining) / 7) * 100

    return (
        <Card className="p-4 bg-gradient-to-r from-stone-900 to-stone-800 text-stone-50 border-none mb-4">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-500/20 rounded-full">
                        <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                    </div>
                    <span className="font-medium text-sm">Free Trial Active</span>
                </div>
                <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-full">
                    {daysRemaining} days left
                </span>
            </div>

            <div className="space-y-1">
                <Progress value={percentage} className="h-1.5 bg-white/20" />
                <div className="flex justify-between text-[10px] text-stone-400">
                    <span>Started</span>
                    <Button variant="link" className="h-auto p-0 text-[10px] text-orange-400 hover:text-orange-300">
                        Upgrade to Pro
                    </Button>
                </div>
            </div>
        </Card>
    )
}
