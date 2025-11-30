/**
 * HTML utility functions.
 */

/**
 * Strip HTML tags from a string and return plain text.
 * Also removes image tags, scripts, and style elements.
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return ''

  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div')
  temp.innerHTML = html

  // Remove unwanted elements
  const unwantedTags = ['img', 'script', 'style', 'iframe', 'svg']
  unwantedTags.forEach((tag) => {
    const elements = temp.getElementsByTagName(tag)
    while (elements[0]) {
      elements[0].remove()
    }
  })

  // Get text content and clean up whitespace
  return temp.textContent?.trim().replace(/\s+/g, ' ') || ''
}

/**
 * Process HTML content for safe rendering.
 * Handles HTML entity decoding and ensures proper formatting.
 */
export function processHtmlContent(html: string | null | undefined): string {
  if (!html) return ''

  // Create a temporary DOM element to decode HTML entities
  const temp = document.createElement('textarea')
  temp.innerHTML = html
  const decoded = temp.value

  // If the content doesn't contain any HTML tags, wrap it in paragraphs
  if (!decoded.match(/<[^>]+>/)) {
    // Plain text content - convert newlines to paragraphs
    return decoded
      .split(/\n\n+/)
      .map((para) => para.trim())
      .filter((para) => para.length > 0)
      .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('')
  }

  return decoded
}
