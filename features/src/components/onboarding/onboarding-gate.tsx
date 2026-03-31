"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadRestogenSettings } from "@/lib/restogen-settings"
import { OnboardingWizard } from "./onboarding-wizard"

function FullScreenLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <p className="text-sm text-ink-muted">Hoş geldiniz…</p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-1/2 animate-pulse bg-sage" />
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          İlk kurulum adımlarını hazırlıyorum.
        </p>
      </div>
    </div>
  )
}

export function OnboardingGate() {
  const router = useRouter()
  const [shouldShow, setShouldShow] = useState<boolean | null>(null)

  useEffect(() => {
    const show = !loadRestogenSettings()
    setShouldShow(show)
    if (!show) router.replace("/dashboard")
  }, [router])

  if (shouldShow === null) return <FullScreenLoading />
  if (shouldShow === false) return null

  return <OnboardingWizard />
}

