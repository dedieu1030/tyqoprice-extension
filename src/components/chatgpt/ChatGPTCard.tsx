import React from 'react';
import { cn } from "@/lib/utils";

interface ChatGPTCardProps {
    children: React.ReactNode;
    title?: string;
    badge?: string;
    className?: string;
    headerAction?: React.ReactNode;
}

export function ChatGPTCard({
    children,
    title,
    badge,
    className,
    headerAction
}: ChatGPTCardProps) {
    return (
        <div className={cn(
            "group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:bg-accent/50",
            className
        )}>
            {(title || badge || headerAction) && (
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {badge && (
                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                                {badge}
                            </span>
                        )}
                        {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
                    </div>
                    {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
                </div>
            )}
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    );
}
