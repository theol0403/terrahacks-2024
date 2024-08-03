export const pageSummaryPromptHighlight = `Summarize the highlights of the content and output a useful summary in a few sentences.`

export const replylanguagePrompt = (language: string) => {
  return `Please write in ${language} language.`
}

export const pageSummaryPrompt = ({
  content,
  language,
  prompt,
}: {
  content: string
  language: string
  prompt?: string
}) => {
  return `Content: ${content}
Instructions: ${prompt ? prompt : pageSummaryPromptHighlight}
${replylanguagePrompt(language)}`
}

