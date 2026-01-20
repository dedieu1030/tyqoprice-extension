import { Clock } from 'lucide-react'

interface TrialBannerProps {
    daysRemaining: number
    isActive: boolean
}

export function TrialBanner({ daysRemaining, isActive }: TrialBannerProps) {
    if (!isActive) return null

    return (
        <div className="relative overflow-hidden rounded-xl bg-primary/10 border border-primary/20 p-3 mb-4 group transition-all hover:bg-primary/[0.15]">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Clock size={16} />
                </div>
                <div className="flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-primary leading-none mb-1">
                        Free Trial Active
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-tight">
                        {daysRemaining} days left <span className="text-muted-foreground font-medium">• Upgrade to Pro for lifetime access</span>
                    </p>
                </div>
                <button className="text-[10px] font-bold text-primary hover:underline underline-offset-4 decoration-2">
                    UPGRADE
                </button>
            </div>
            {/* Background minimal aesthetic */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl" />
        </div>
    )
}
