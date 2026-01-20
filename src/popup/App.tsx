import { useState } from 'react'
import { Settings as SettingsIcon, Calculator, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { ChatGPTSidebar, ChatGPTSidebarItem } from '../components/chatgpt/ChatGPTSidebar'
import { TrialBanner } from './components/TrialBanner'
import { SimpleConverter } from './components/SimpleConverter'
import { Settings } from './components/Settings'
import '../index.css'

function App() {
    const [activeTab, setActiveTab] = useState<'settings' | 'converter'>('settings')
    const [collapsed, setCollapsed] = useState(true)

    return (
        <div className="w-[380px] h-[550px] bg-background text-foreground overflow-hidden flex font-sans">
            {/* ChatGPT Style Sidebar */}
            <ChatGPTSidebar collapsed={collapsed} className="h-full">
                <div className="flex flex-col h-full">
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="px-2 py-4 flex items-center justify-center">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-primary-foreground font-bold text-lg leading-none">T</span>
                            </div>
                        </div>

                        <ChatGPTSidebarItem
                            icon={<SettingsIcon size={18} />}
                            label="Settings"
                            isActive={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                            collapsed={collapsed}
                        />
                        <ChatGPTSidebarItem
                            icon={<Calculator size={18} />}
                            label="Converter"
                            isActive={activeTab === 'converter'}
                            onClick={() => setActiveTab('converter')}
                            collapsed={collapsed}
                        />
                    </div>

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="mt-auto p-2 text-muted-foreground hover:text-foreground flex justify-center"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </ChatGPTSidebar>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-background/30">
                <header className="p-4 flex justify-between items-center border-b border-border/40">
                    <h2 className="text-sm font-bold tracking-tight capitalize">
                        {activeTab}
                    </h2>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        <Zap size={12} className="text-primary fill-primary/20" />
                        Pro Plan
                    </div>
                </header>

                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    <TrialBanner daysRemaining={7} isActive={true} />

                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === 'settings' && <Settings />}
                        {activeTab === 'converter' && <SimpleConverter />}
                    </div>
                </div>

                <footer className="p-3 border-t border-border/40 bg-background/50 backdrop-blur-sm text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground/60 font-medium tracking-tight">
                        <span>TYQOPRICE</span>
                        <span className="opacity-30">•</span>
                        <span>V1.0.0</span>
                    </div>
                </footer>
            </main>
        </div>
    )
}

export default App
