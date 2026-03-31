export type RestogenBusinessType = "Yemekhane" | "Restoran"

export type RestogenInventoryImage = {
  base64: string
  mimeType: string
}

export type RestogenSettings = {
  name: string
  businessName: string
  businessType: RestogenBusinessType
  dailyAvgCapacity: number
  city: string
  todaysMenu: string
  inventoryImage: RestogenInventoryImage
  chefNote?: string
  createdAt: string
}

const STORAGE_KEY = "restogen_settings"

export function loadRestogenSettings(): RestogenSettings | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<RestogenSettings>

    if (typeof parsed.name !== "string" || !parsed.name.trim()) return null
    if (
      typeof parsed.businessName !== "string" ||
      !parsed.businessName.trim()
    )
      return null
    if (
      parsed.businessType !== "Yemekhane" && parsed.businessType !== "Restoran"
    )
      return null
    if (
      typeof parsed.dailyAvgCapacity !== "number" ||
      !Number.isFinite(parsed.dailyAvgCapacity) ||
      parsed.dailyAvgCapacity <= 0
    )
      return null
    if (typeof parsed.city !== "string" || !parsed.city.trim()) return null
    if (
      typeof parsed.todaysMenu !== "string" ||
      !parsed.todaysMenu.trim()
    )
      return null
    if (!parsed.inventoryImage) return null
    if (
      typeof parsed.inventoryImage.base64 !== "string" ||
      !parsed.inventoryImage.base64.trim()
    )
      return null
    if (
      typeof parsed.inventoryImage.mimeType !== "string" ||
      !parsed.inventoryImage.mimeType.trim()
    )
      return null

    return parsed as RestogenSettings
  } catch {
    return null
  }
}

export function saveRestogenSettings(settings: RestogenSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function clearRestogenSettings(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

