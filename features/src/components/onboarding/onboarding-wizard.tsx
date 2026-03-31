"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type {
  RestogenBusinessType,
  RestogenInventoryImage,
  RestogenSettings,
} from "@/lib/restogen-settings"
import { saveRestogenSettings } from "@/lib/restogen-settings"
import { fileToCompressedBase64 } from "@/lib/image-file"

type StepId = 0 | 1 | 2 | 3 | 4

type WizardState = {
  name: string
  businessName: string
  businessType: RestogenBusinessType
  dailyAvgCapacity: number
  city: string
  todaysMenu: string
  inventoryImage: RestogenInventoryImage | null
  chefNote: string
}

const businessTypes: RestogenBusinessType[] = ["Yemekhane", "Restoran"]

function dataUrlFromInventoryImage(img: RestogenInventoryImage): string {
  return `data:${img.mimeType};base64,${img.base64}`
}

function StepTitle({ step }: { step: StepId }) {
  const titles: Record<StepId, string> = {
    0: "Hoş geldin",
    1: "İşletmeni tanıt",
    2: "Şehir bilgisi",
    3: "Menü ve envanter",
    4: "Şefin notu",
  }

  return (
    <p className="text-sm font-medium text-ink-muted">{titles[step]}</p>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/10" aria-hidden>
      <div
        className="h-full bg-sage transition-[width] duration-500 ease-out"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  )
}

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<StepId>(0)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)

  const [state, setState] = useState<WizardState>({
    name: "",
    businessName: "",
    businessType: "Yemekhane",
    dailyAvgCapacity: 250,
    city: "",
    todaysMenu: "",
    inventoryImage: null,
    chefNote: "",
  })

  const progress = useMemo(() => {
    return (step + 1) / 5
  }, [step])

  const stepErrors = useMemo(() => {
    const errors: string[] = []

    if (step === 0) {
      if (!state.name.trim()) errors.push("İsim gerekli")
      if (!state.businessName.trim()) errors.push("İşletme adı gerekli")
    }

    if (step === 1) {
      if (!state.businessType) errors.push("İşletme tipi gerekli")
      if (!Number.isFinite(state.dailyAvgCapacity) || state.dailyAvgCapacity <= 0) {
        errors.push("Günlük ortalama kapasite 0’dan büyük olmalı")
      }
    }

    if (step === 2) {
      if (!state.city.trim()) errors.push("Şehir bilgisi gerekli")
    }

    if (step === 3) {
      if (!state.todaysMenu.trim()) errors.push("Günün menüsü gerekli")
      if (!state.inventoryImage) errors.push("Envanter fotoğrafı gerekli")
    }

    return errors
  }, [step, state])

  const finishErrors = useMemo(() => {
    const errors: string[] = []
    if (!state.name.trim()) errors.push("İsim gerekli")
    if (!state.businessName.trim()) errors.push("İşletme adı gerekli")
    if (
      !state.businessType ||
      !Number.isFinite(state.dailyAvgCapacity) ||
      state.dailyAvgCapacity <= 0
    )
      errors.push("İşletme tipi ve kapasite gerekli")
    if (!state.city.trim()) errors.push("Şehir bilgisi gerekli")
    if (!state.todaysMenu.trim()) errors.push("Günün menüsü gerekli")
    if (!state.inventoryImage) errors.push("Envanter fotoğrafı gerekli")
    return errors
  }, [state])

  const canFinish = finishErrors.length === 0

  function handleNext() {
    setSaveError(null)
    if (stepErrors.length > 0) return
    setStep((s) => (s < 4 ? ((s + 1) as StepId) : s))
  }

  function handleBack() {
    setSaveError(null)
    setStep((s) => (s > 0 ? ((s - 1) as StepId) : s))
  }

  async function handleInventoryFile(file: File) {
    setSaveError(null)
    setImgLoading(true)
    try {
      const { base64, mimeType } = await fileToCompressedBase64(file, 1024)
      if (!base64) throw new Error("Fotoğraf işlenemedi")
      setState((prev) => ({
        ...prev,
        inventoryImage: { base64, mimeType },
      }))
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Fotoğraf işlenemedi")
    } finally {
      setImgLoading(false)
    }
  }

  async function handleFinish() {
    setSaveError(null)
    if (step !== 4) return

    if (!canFinish) {
      setSaveError(`Lütfen tamamlayın: ${finishErrors.join(" · ")}`)
      return
    }

    setIsSaving(true)
    try {
      const settings: RestogenSettings = {
        name: state.name.trim(),
        businessName: state.businessName.trim(),
        businessType: state.businessType,
        dailyAvgCapacity: state.dailyAvgCapacity,
        city: state.city.trim(),
        todaysMenu: state.todaysMenu.trim(),
        inventoryImage: state.inventoryImage as RestogenInventoryImage,
        chefNote: state.chefNote.trim() || undefined,
        createdAt: new Date().toISOString(),
      }

      saveRestogenSettings(settings)
      router.replace("/dashboard")
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Ayarlar kaydedilemedi. Tekrar deneyin.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const previewUrl = useMemo(() => {
    if (!state.inventoryImage) return null
    return dataUrlFromInventoryImage(state.inventoryImage)
  }, [state.inventoryImage])

  const title = useMemo(() => {
    return `RestoGen AI ilk kurulum`
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="flex w-full max-h-[90vh] max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="relative shrink-0 bg-gradient-to-r from-sage/15 via-clay-light/40 to-sage/15 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">{title}</h2>
              <StepTitle step={step} />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-ink-muted">Adım {step + 1} / 5</p>
              <ProgressBar value={progress} />
            </div>
          </div>

          <p className="mt-4 text-sm text-ink-muted">
            Bu adımlar sadece ilk açılışta sorulur. Daha sonra işlemler panelden devam eder.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {saveError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
              {saveError}
            </div>
          ) : null}

          {step === 0 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="name">
                  İsim ve İşletme Adı
                </label>
                <input
                  id="name"
                  type="text"
                  value={state.name}
                  onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                  placeholder="Örn: Ayşe Demir"
                  aria-label="Şef ismi"
                />
                <input
                  id="businessName"
                  type="text"
                  value={state.businessName}
                  onChange={(e) =>
                    setState((p) => ({ ...p, businessName: e.target.value }))
                  }
                  className="mt-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                  placeholder="Örn: Demir Restoran"
                  aria-label="İşletme adı"
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="businessType">
                  İşletme Tipi ve Günlük Ortalama Kapasite
                </label>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="businessType">
                      İşletme tipi
                    </label>
                    <select
                      id="businessType"
                      value={state.businessType}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          businessType: e.target.value as RestogenBusinessType,
                        }))
                      }
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                      aria-label="İşletme tipi"
                    >
                      {businessTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="sr-only" htmlFor="dailyAvgCapacity">
                      Günlük ortalama kapasite
                    </label>
                    <input
                      id="dailyAvgCapacity"
                      type="number"
                      min={1}
                      value={state.dailyAvgCapacity}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          dailyAvgCapacity: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                      aria-label="Günlük ortalama kapasite"
                      placeholder="Örn: 250"
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-ink-muted">
                  Sadece hazırlık tahminleri için kullanılır.
                </p>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="city">
                  Bulunduğunuz Şehir (Hava durumu API’si için gerekli)
                </label>
                <input
                  id="city"
                  type="text"
                  value={state.city}
                  onChange={(e) => setState((p) => ({ ...p, city: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                  placeholder="Örn: İstanbul"
                  aria-label="Şehir"
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="todaysMenu">
                  Günün Menüsü ve Envanter Fotoğrafı
                </label>
                <textarea
                  id="todaysMenu"
                  value={state.todaysMenu}
                  onChange={(e) =>
                    setState((p) => ({ ...p, todaysMenu: e.target.value }))
                  }
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                  placeholder="Örn: Mercimek çorbası, nohut yemeği, salata…"
                  aria-label="Günün menüsü"
                />
              </div>

              <div className="rounded-xl bg-black/[0.02] p-4 shadow-sm">
                <label className="block text-sm font-medium text-ink" htmlFor="inventoryPhoto">
                  Envanter Fotoğrafı (dosya yükleme / kamera)
                </label>
                <input
                  id="inventoryPhoto"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="mt-2 w-full text-sm text-ink-muted"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    void handleInventoryFile(f)
                    e.target.value = ""
                  }}
                  aria-label="Envanter fotoğrafı"
                  disabled={imgLoading}
                />

                {previewUrl ? (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-ink-muted">Önizleme</p>
                    <div className="mt-2 overflow-hidden rounded-xl bg-white shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Envanter önizleme"
                        className="max-h-64 w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-3 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink focus-ring"
                      onClick={() => setState((p) => ({ ...p, inventoryImage: null }))}
                    >
                      Fotoğrafı kaldır
                    </button>
                  </div>
                ) : null}

                {imgLoading ? (
                  <p className="mt-3 text-xs text-ink-muted">Fotoğraf işleniyor…</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="chefNote">
                  Şefin Notu (Opsiyonel)
                </label>
                <textarea
                  id="chefNote"
                  value={state.chefNote}
                  onChange={(e) =>
                    setState((p) => ({ ...p, chefNote: e.target.value }))
                  }
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus-ring"
                  placeholder="Mutfakla ilgili dikkat etmemi istediğin özel bir durum var mı?"
                  aria-label="Şef notu"
                />
              </div>
              <div className="rounded-xl bg-black/[0.02] p-4 shadow-sm">
                <p className="text-sm font-medium text-ink">Özet</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-muted">
                  <li>
                    Şef: {state.name || "—"} · İşletme: {state.businessName || "—"}
                  </li>
                  <li>
                    Tip: {state.businessType} · Kapasite: {state.dailyAvgCapacity}
                  </li>
                  <li>Şehir: {state.city || "—"}</li>
                  <li>Menü: {state.todaysMenu ? "Hazır" : "—"}</li>
                </ul>
              </div>
            </div>
          ) : null}

          {stepErrors.length > 0 && step !== 4 ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
              Lütfen şu alanları tamamlayın: {stepErrors.join(" · ")}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 border-t border-black/5 px-6 py-4">
          <button
            type="button"
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink focus-ring disabled:opacity-50"
            disabled={step === 0 || isSaving}
            onClick={() => handleBack()}
          >
            Geri
          </button>

          {step < 4 ? (
            <button
              type="button"
              className="rounded-lg bg-sage px-5 py-2 text-sm font-medium text-white focus-ring disabled:opacity-50"
              disabled={imgLoading || isSaving}
              onClick={() => handleNext()}
            >
              Devam
            </button>
          ) : (
            <button
              type="button"
              className="rounded-lg bg-sage px-5 py-2 text-sm font-medium text-white focus-ring disabled:opacity-50"
              disabled={isSaving || imgLoading || !canFinish}
              onClick={() => void handleFinish()}
            >
              Kaydet ve Dashboard’a Git
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

