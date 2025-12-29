import type { CodeLanguage, CodeToken, CodeTokenType } from './types'

const JS_KEYWORDS = new Set([
  'async',
  'await',
  'catch',
  'const',
  'else',
  'false',
  'finally',
  'function',
  'if',
  'let',
  'new',
  'null',
  'return',
  'throw',
  'true',
  'try',
  'var',
  'let',
])

const PHP_KEYWORDS = new Set([
  'catch',
  'echo',
  'else',
  'false',
  'finally',
  'function',
  'if',
  'new',
  'null',
  'return',
  'throw',
  'true',
  'try',
])

const JAVA_KEYWORDS = new Set([
  'abstract',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'if',
  'implements',
  'import',
  'instanceof',
  'int',
  'interface',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'strictfp',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'void',
  'volatile',
  'while',
])

const CURL_KEYWORDS = new Set(['curl', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

const isDigit = (char: string) => char >= '0' && char <= '9'
const isAlpha = (char: string) =>
  (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
const isIdentifierStart = (char: string) => isAlpha(char) || char === '_' || char === '$'
const isIdentifierPart = (char: string) =>
  isIdentifierStart(char) || isDigit(char)

export const tokenizeCode = (code: string, language: CodeLanguage): CodeToken[] => {
  const tokens: CodeToken[] = []
  const push = (type: CodeTokenType, value: string) => {
    if (!value) return
    const last = tokens[tokens.length - 1]
    if (last?.type === type) {
      last.value += value
      return
    }
    tokens.push({ type, value })
  }

  const punctuationChars = new Set(['{', '}', '[', ']', '(', ')', ',', '.', ':', ';'])
  const operatorChars = new Set(['=', '+', '-', '*', '/', '!', '?', '<', '>', '|', '&', '\\'])
  const twoCharOperators = new Set(['=>', '==', '!=', '&&', '||', '??'])

  const peekNonWhitespace = (start: number) => {
    for (let index = start; index < code.length; index += 1) {
      const char = code[index]
      if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
        return { char, index }
      }
    }
    return null
  }

  let index = 0
  while (index < code.length) {
    const char = code[index]

    const isLineCommentStart =
      (language === 'javascript' || language === 'php' || language === 'java') &&
      char === '/' &&
      code[index + 1] === '/'
    const isBlockCommentStart =
      (language === 'javascript' || language === 'php' || language === 'java') &&
      char === '/' &&
      code[index + 1] === '*'

    if (language === 'bash' && char === '#') {
      const lineEnd = code.indexOf('\n', index)
      const end = lineEnd === -1 ? code.length : lineEnd
      push('comment', code.slice(index, end))
      index = end
      continue
    }

    if (isLineCommentStart) {
      const lineEnd = code.indexOf('\n', index)
      const end = lineEnd === -1 ? code.length : lineEnd
      push('comment', code.slice(index, end))
      index = end
      continue
    }

    if (isBlockCommentStart) {
      const endIndex = code.indexOf('*/', index + 2)
      const end = endIndex === -1 ? code.length : endIndex + 2
      push('comment', code.slice(index, end))
      index = end
      continue
    }

    const stringDelimiter =
      char === '"' || char === "'" || (language === 'javascript' && char === '`')
    if (stringDelimiter) {
      const delimiter = char
      let end = index + 1
      while (end < code.length) {
        const current = code[end]
        if (current === '\\') {
          end += 2
          continue
        }
        if (current === delimiter) {
          end += 1
          break
        }
        end += 1
      }
      const raw = code.slice(index, end)
      if (language === 'json' && delimiter === '"') {
        const next = peekNonWhitespace(end)
        push(next?.char === ':' ? 'property' : 'string', raw)
      } else {
        push('string', raw)
      }
      index = end
      continue
    }

    if (language === 'bash' && char === '-' && code[index + 1] && code[index + 1] !== ' ') {
      let end = index + 1
      while (end < code.length) {
        const current = code[end]
        if (current === ' ' || current === '\t' || current === '\n' || current === '\r') {
          break
        }
        end += 1
      }
      push('keyword', code.slice(index, end))
      index = end
      continue
    }

    if (isDigit(char)) {
      let end = index + 1
      while (end < code.length) {
        const current = code[end]
        if (!isDigit(current) && current !== '.') {
          break
        }
        end += 1
      }
      push('number', code.slice(index, end))
      index = end
      continue
    }

    if (char === '$' && language === 'php') {
      let end = index + 1
      while (end < code.length && isIdentifierPart(code[end])) {
        end += 1
      }
      push('variable', code.slice(index, end))
      index = end
      continue
    }

    if (isIdentifierStart(char)) {
      let end = index + 1
      while (end < code.length && isIdentifierPart(code[end])) {
        end += 1
      }

      const word = code.slice(index, end)
      const next = peekNonWhitespace(end)

      if (language === 'bash' && CURL_KEYWORDS.has(word)) {
        push('keyword', word)
        index = end
        continue
      }

      if (language === 'javascript' && JS_KEYWORDS.has(word)) {
        push('keyword', word)
        index = end
        continue
      }

      if (language === 'php' && PHP_KEYWORDS.has(word)) {
        push('keyword', word)
        index = end
        continue
      }

      if (language === 'java' && JAVA_KEYWORDS.has(word)) {
        push('keyword', word)
        index = end
        continue
      }

      if (next?.char === '(') {
        push('function', word)
        index = end
        continue
      }

      push('text', word)
      index = end
      continue
    }

    if (punctuationChars.has(char)) {
      push('punctuation', char)
      index += 1
      continue
    }

    if (operatorChars.has(char)) {
      const twoChar = code.slice(index, index + 2)
      if (twoCharOperators.has(twoChar)) {
        push('operator', twoChar)
        index += 2
        continue
      }
      push('operator', char)
      index += 1
      continue
    }

    push('text', char)
    index += 1
  }

  return tokens
}
