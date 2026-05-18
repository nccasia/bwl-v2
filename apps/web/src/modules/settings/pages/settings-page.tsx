'use client'

import React from 'react'
import { AppearanceSection } from '../components/appearance-section'
import { BrandColorSection } from '../components/brand-color-section'
import { QuickAccessSection } from '../components/quick-access-section'
import { MessagingSection } from '../components/messaging-section'

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black italic tracking-tighter mb-2">Settings</h1>
        <p className="text-zinc-500 font-medium">Customize your experience</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
           <AppearanceSection />
           <BrandColorSection />
           <MessagingSection />
        </div>
        
        <div className="lg:col-span-1 h-full">
           <QuickAccessSection />
        </div>
      </div>
    </div>
  )
}
