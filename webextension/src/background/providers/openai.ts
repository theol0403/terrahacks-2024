import { fetchSSE } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'
import { DEFAULT_MODEL, DEFAULT_API_HOST, SECRET_KEY } from '@/config'

export class OpenAIProvider implements Provider {
  token = SECRET_KEY
  model = DEFAULT_MODEL

  private buildMessages(prompt: string) {
    return [{ role: 'user', content: prompt }]
  }

  async generateAnswer(params: GenerateAnswerParams) {
    const apiHost = DEFAULT_API_HOST
    const apiPath = undefined

    let url = ''
    let reqParams = {
      model: this.model,
      // prompt: this.buildPrompt(params.prompt),
      // messages: this.buildMessages(params.prompt),
      stream: true,
      max_tokens: 800,
      // temperature: 0.5,
    }
    url = `https://${apiHost}${apiPath || '/v1/chat/completions'}`
    reqParams = { ...reqParams, ...{ messages: this.buildMessages(params.prompt) } }

    let result = ''
    await fetchSSE(url, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(reqParams),
      onMessage(message) {
        console.debug('sse message', message)
        if (message === '[DONE]') {
          params.onEvent({ type: 'done' })
          return
        }
        let data
        try {
          data = JSON.parse(message)
          const text =
            data.choices[0].delta.content

          if (text === undefined || text === '<|im_end|>' || text === '<|im_sep|>') {
            return
          }
          result += text
          params.onEvent({
            type: 'answer',
            data: {
              text: result,
              messageId: data.id,
              conversationId: data.id,
            },
          })
        } catch (err) {
          // console.error(err)
          return
        }
      },
    })
    return {}
  }
}
