import { Tabs, TabsContent, TabsList, TabsTrigger, Toaster } from '@algoledger/ui'
import { AboutTab } from './tabs/AboutTab'
import { AnalyticsTab } from './tabs/AnalyticsTab'
import { AppearanceTab } from './tabs/AppearanceTab'
import { GitHubTab } from './tabs/GitHubTab'
import { PlatformsTab } from './tabs/PlatformsTab'

export function Options() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <header>
        <h1 className="text-xl font-semibold">AlgoLedger Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your GitHub connection, platforms, and stats.
        </p>
      </header>

      <Tabs defaultValue="github" orientation="vertical" className="flex-1 items-start gap-6">
        <TabsList variant="line" className="w-40 shrink-0">
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <div className="min-w-0 flex-1">
          <TabsContent value="github">
            <GitHubTab />
          </TabsContent>
          <TabsContent value="platforms">
            <PlatformsTab />
          </TabsContent>
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>
          <TabsContent value="about">
            <AboutTab />
          </TabsContent>
        </div>
      </Tabs>

      <Toaster />
    </main>
  )
}
