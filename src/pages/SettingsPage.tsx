import { motion } from 'framer-motion'
import { SettingsThemeSection } from '@/components/settings/SettingsThemeSection'
import { SettingsPomodoroSection } from '@/components/settings/SettingsPomodoroSection'
import { SettingsGeneralSection } from '@/components/settings/SettingsGeneralSection'
import { SettingsKeyboardSection } from '@/components/settings/SettingsKeyboardSection'
import { SettingsDataSection } from '@/components/settings/SettingsDataSection'

export function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="mx-auto max-w-3xl px-4 py-6 md:px-6 lg:px-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Settings</h1>
      </div>

      <div className="space-y-8">
        <SettingsThemeSection />
        <div className="border-t border-gray-200" />
        <SettingsGeneralSection />
        <div className="border-t border-gray-200" />
        <SettingsPomodoroSection />
        <div className="border-t border-gray-200" />
        <SettingsKeyboardSection />
        <div className="border-t border-gray-200" />
        <SettingsDataSection />
      </div>
    </motion.div>
  )
}
