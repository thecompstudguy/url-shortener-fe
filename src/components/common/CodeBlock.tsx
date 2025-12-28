import type { CodeLanguage, CodeToken } from '../../utils/types'
import { tokenizeCode } from '../../utils/tokenizer'

interface CodeBlockProps {
  code: string
  language: CodeLanguage
}

export const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const tokens = tokenizeCode(code, language)
  return (
    <pre className={`code-block language-${language}`}>
      <code>
        {tokens.map((token: CodeToken, tokenIndex: number) => (
          <span
            key={`${language}-${tokenIndex}`}
            className={token.type === 'text' ? undefined : `token token-${token.type}`}
          >
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  )
}
