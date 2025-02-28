import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

const userConfigWithDefaultValue: {
  prompt: string
  promptSearch: string
  promptPage: string
  promptComment: string
  enableSites: string[] | null
  pageSummaryWhitelist: string
  pageSummaryBlacklist: string
  continueConversation: boolean
} = {
  prompt: '',
  promptSearch: '',
  promptPage: '',
  promptComment: '',
  enableSites: null,
  pageSummaryWhitelist: '',
  pageSummaryBlacklist: '127.0.0.1',
  continueConversation: true,
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export const APP_TITLE = `Didi the Dodo`

export const DEFAULT_MODEL = 'gpt-4o-mini'
export const DEFAULT_API_HOST = 'api.openai.com'
export const SECRET_KEY = "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";
