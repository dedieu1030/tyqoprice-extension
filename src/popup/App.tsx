
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings as SettingsIcon, Calculator, Zap } from 'lucide-react'
import { TrialBanner } from './components/TrialBanner'
import { SimpleConverter } from './components/SimpleConverter'
import { Settings } from './components/Settings'
import { Badge } from '@/components/ui/badge'
import '../index.css'

function App() {
    return (
        <div className="w-[360px] min-h-[500px] bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-50 overflow-hidden flex flex-col">
            {/* Premium Header */}
            <header className="p-5 flex justify-between items-center border-b border-stone-100 dark:border-stone-900 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-primary-foreground font-bold text-xl leading-none">T</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight leading-none">Tyqoprice</h1>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium tracking-wide uppercase">Universal Converter</p>
                    </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-900 border-none">
                    v1.0.0
                </Badge>
            </header>

            <main className="flex-1 p-5 overflow-y-auto">
                <TrialBanner daysRemaining={7} isActive={true} />

                <Tabs defaultValue="settings" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl mb-6">
                        <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 data-[state=active]:shadow-sm gap-2 py-2">
                            <SettingsIcon className="w-4 h-4" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="converter" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 data-[state=active]:shadow-sm gap-2 py-2">
                            <Calculator className="w-4 h-4" />
                            Converter
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="settings" className="mt-0 animate-in fade-in-50 duration-300">
                        <Settings />
                    </TabsContent>

                    <TabsContent value="converter" className="mt-0 animate-in fade-in-50 duration-300">
                        <SimpleConverter />
                    </TabsContent>
                </Tabs>
            </main>

            <footer className="p-4 border-t border-stone-100 dark:border-stone-900 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>Make with</span>
                    <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span>by Tyqo Team</span>
                </div>
            </footer>
        </div>
    )
}

export default App
