export type ParsedPhoto = { url: string; caption: string }

const DRIVE_FILE = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
const DRIVE_ID_PARAM = /[?&]id=([a-zA-Z0-9_-]+)/

export function toHostedImageUrl(raw: string): string | null {
  const value = raw.trim()
  if (!/^https:\/\//i.test(value)) return null

  const isDrive = value.includes('drive.google.com') || value.includes('docs.google.com')
  if (!isDrive) return value

  const id = value.match(DRIVE_FILE)?.[1] || value.match(DRIVE_ID_PARAM)?.[1]
  if (!id) return null
  return `https://lh3.googleusercontent.com/d/${id}=w1600`
}

export function parsePhotoLines(text: string): { photos: ParsedPhoto[]; rejected: string[] } {
  const photos: ParsedPhoto[] = []
  const rejected: string[] = []

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [left, ...rest] = trimmed.split('|')
    const url = toHostedImageUrl(left.trim())
    if (!url) {
      rejected.push(trimmed)
      continue
    }
    photos.push({ url, caption: rest.join('|').trim() })
  }

  return { photos, rejected }
}
