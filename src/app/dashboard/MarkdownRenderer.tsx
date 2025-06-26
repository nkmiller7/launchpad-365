"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ReactNode, HTMLAttributes, AnchorHTMLAttributes } from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
  truncate?: boolean
  maxLength?: number
}

// Type definitions for react-markdown component props
interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode
}

interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode
}

interface ListProps extends HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  children?: ReactNode
}

interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  children?: ReactNode
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode
}

interface CodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  inline?: boolean
}

interface BlockquoteProps extends HTMLAttributes<HTMLQuoteElement> {
  children?: ReactNode
}

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children?: ReactNode
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode
}

interface TextProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}

export default function MarkdownRenderer({
  content,
  className = "",
  truncate = false,
  maxLength = 100,
}: MarkdownRendererProps) {
  const processedContent = truncate && content.length > maxLength ? `${content.substring(0, maxLength)}...` : content

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ children, ...props }: HeadingProps) => (
            <h1 className="text-xl font-bold text-gray-900 mb-2" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }: HeadingProps) => (
            <h2 className="text-lg font-semibold text-gray-900 mb-2" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }: HeadingProps) => (
            <h3 className="text-base font-medium text-gray-900 mb-1" {...props}>
              {children}
            </h3>
          ),
          // Customize paragraph styles
          p: ({ children, ...props }: ParagraphProps) => (
            <p className="text-gray-700 mb-2 last:mb-0" {...props}>
              {children}
            </p>
          ),
          // Customize list styles
          ul: ({ children, ...props }: ListProps) => (
            <ul className="list-disc list-inside text-gray-700 mb-2 space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }: ListProps) => (
            <ol className="list-decimal list-inside text-gray-700 mb-2 space-y-1" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }: ListItemProps) => (
            <li className="text-gray-700" {...props}>
              {children}
            </li>
          ),
          // Customize link styles
          a: ({ children, href, ...props }: LinkProps) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // Customize code styles
          code: ({ children, className, inline, ...props }: CodeProps) => {
            const isInline = inline || !className
            if (isInline) {
              return (
                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code
                className="block bg-gray-100 text-gray-800 p-3 rounded text-sm font-mono overflow-x-auto"
                {...props}
              >
                {children}
              </code>
            )
          },
          // Customize blockquote styles
          blockquote: ({ children, ...props }: BlockquoteProps) => (
            <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 mb-2" {...props}>
              {children}
            </blockquote>
          ),
          // Customize table styles
          table: ({ children, ...props }: TableProps) => (
            <table className="min-w-full border-collapse border border-gray-300 mb-2" {...props}>
              {children}
            </table>
          ),
          th: ({ children, ...props }: TableCellProps) => (
            <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-medium text-gray-900" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }: TableCellProps) => (
            <td className="border border-gray-300 px-3 py-2 text-gray-700" {...props}>
              {children}
            </td>
          ),
          // Customize horizontal rule
          hr: (props: HTMLAttributes<HTMLHRElement>) => <hr className="border-gray-300 my-4" {...props} />,
          // Customize strong/bold text
          strong: ({ children, ...props }: TextProps) => (
            <strong className="font-semibold text-gray-900" {...props}>
              {children}
            </strong>
          ),
          // Customize emphasis/italic text
          em: ({ children, ...props }: TextProps) => (
            <em className="italic text-gray-700" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
