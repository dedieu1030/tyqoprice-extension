import React from 'react';
import { cn } from "@/lib/utils";

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick: () => void;
    collapsed?: boolean;
}

export function ChatGPTSidebarItem({
    icon,
    label,
    isActive,
    onClick,
    collapsed
}: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                collapsed && "justify-center px-0"
            )}
            title={label}
        >
            <div className="flex h-5 w-5 items-center justify-center shrink-0">
                {icon}
            </div>
            {!collapsed && <span className="truncate">{label}</span>}
        </button>
    );
}

interface ChatGPTSidebarProps {
    children: React.ReactNode;
    className?: string;
    collapsed?: boolean;
}

export function ChatGPTSidebar({
    children,
    className,
    collapsed
}: ChatGPTSidebarProps) {
    return (
        <div className={cn(
            "flex flex-col gap-1 border-r border-border bg-background/50 p-2 backdrop-blur-sm transition-all duration-300",
            collapsed ? "w-14" : "w-48",
            className
        )}>
            {children}
        </div>
    );
}
