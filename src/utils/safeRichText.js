const ALLOWED_TAG_RE = /<(strong|b)>(.*?)<\/\1>/gis

export function toSafeRichTextSegments(value) {
  const text = String(value ?? '')
  const segments = []
  let lastIndex = 0
  let match

  while ((match = ALLOWED_TAG_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), strong: false })
    }

    segments.push({ text: match[2], strong: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), strong: false })
  }

  return segments.length > 0 ? segments : [{ text, strong: false }]
}
