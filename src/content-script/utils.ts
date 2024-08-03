import { extractFromHtml } from '@/utils/article-extractor/cjs/article-extractor.esm'

export const getPageSummaryContntent = async () => {
  const html = document.querySelector('html')?.outerHTML
  const url = location.href
  if (!html) {
    return
  }

  const article = await extractFromHtml(html, url)

  return article
}

