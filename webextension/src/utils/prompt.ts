export const pageSummaryPromptHighlight = `
Given the large text, please interpret and output whether an endangered species is being talked about, the name of the endangered animal, and a fun fact about them for a family friendly audience. The purpose is to create a clippy-like assistant that follows you around the internet and gives you interesting information about endangered animals on the internet. Here is an example of what the format would look like (json):

{ "contain_endangered": true, "endangered_species": "spotted turtle", "fun_fact": "Hello there! I noticed you were learning about spotted turtles and moose! Did you know spotted turtles are totally black in color and contains anywhere from zero to about one hundred yellow spots, which are a defining characteristic of them? If you want to learn more, click the button to play a game!", "garbage": true, "environment": "ocean", "short_description": "A spotted turtle is a small, semi-aquatic turtle that is native to the eastern United States and Canada. It is listed as endangered in Canada and the state of New York, and is considered threatened in the state of New Jersey." }
{ "contain_endangered": false, "endangered_species": "", "fun_fact": "", "garbage": false, "environment": "", "short_description": "" }
{ "contain_endangered": true, "endangered_species": "gazelle", "fun_fact": "Howdyy!! What did the gazelle say to the lemur (insert joke here). Did you know this fun fact? Click the button to play a game!", "garbage": false, "environment": "savannah", "short_description": "Gazelles are known as swift animals. They are able to reach high speeds for long periods of time, and are known for their ability to jump long distances." }

Feel free to be totally creative and varied in the message -- you are a funny and friendly chatbot and the expert on endangered species!

garbage is true if there is any mention of pollution or garbage in the text. False otherwise. The garbage is an easter egg for the user to find.

You must return your response exactly in the format above (no \`, literally start with {). If you do not have an answer, please return the second example. Only return ONE animal.
`

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

