'use client'

import { useEffect, useState } from 'react'

type Status = 'idle' | 'running' | 'accepted'
type DescTab = 'description' | 'editorial' | 'solutions' | 'submissions'
type BottomTab = 'testcase' | 'result'

const DESC_TABS: { key: DescTab; label: string }[] = [
  { key: 'description', label: 'Description' },
  { key: 'editorial', label: 'Editorial' },
  { key: 'solutions', label: 'Solutions' },
  { key: 'submissions', label: 'Submissions' },
]

const CODE_LINES = [
  '# from typing import List',
  '',
  'class Solution:',
  '    def twoSum(self, nums: List[int], target: int) -> List[int]:',
  '        seen = {}',
  '        for idx, val in enumerate(nums):',
  '            complement = target - val',
  '            if complement in seen:',
  '                return [seen[complement], idx]',
  '            seen[val] = idx',
  '        return []',
  '',
]

const CASES = [
  { nums: '[2,7,11,15]', target: '9' },
  { nums: '[3,2,4]', target: '6' },
  { nums: '[3,3]', target: '6' },
]

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-3.5 animate-spin text-white/60"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={2} opacity={0.25} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function IconGlyph({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

function highlightCode(line: string) {
  const keywordPattern = /\b(class|def|for|in|if|return|import|from)\b|(#.*)|(\{\}|\[\])|(self)/g
  const parts = line.split(keywordPattern).filter((part) => part !== undefined && part !== '')

  return parts.map((part, index) => {
    if (/^(class|def|for|in|if|return|import|from)$/.test(part)) {
      return (
        <span key={index} className="text-purple-400">
          {part}
        </span>
      )
    }
    if (part.startsWith('#')) {
      return (
        <span key={index} className="text-white/30">
          {part}
        </span>
      )
    }
    if (part === 'self') {
      return (
        <span key={index} className="text-orange-300/80">
          {part}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function SolveScene() {
  const [status, setStatus] = useState<Status>('idle')
  const [descTab, setDescTab] = useState<DescTab>('description')
  const [manualBottomTab, setManualBottomTab] = useState<BottomTab | null>(null)
  const [selectedCase, setSelectedCase] = useState(0)
  const bottomTab = manualBottomTab ?? (status === 'accepted' ? 'result' : 'testcase')

  useEffect(() => {
    if (status !== 'running') return
    const timeout = setTimeout(() => setStatus('accepted'), 900)
    return () => clearTimeout(timeout)
  }, [status])

  return (
    <div className="flex h-full flex-col bg-[#1a1a1a] text-[0.7rem] text-white/80">
      <div className="flex items-center gap-4 border-b border-white/10 bg-[#242424] px-4 py-2">
        <div className="flex items-center gap-3 text-white/35">
          <IconGlyph d="M4 6h16M4 12h16M4 18h16" />
          <IconGlyph d="m15 6-6 6 6 6" />
          <IconGlyph d="m9 6 6 6-6 6" />
          <IconGlyph d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" />
        </div>

        <div className="flex flex-1 items-center justify-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-white/60 transition-colors hover:bg-white/5"
          >
            <IconGlyph d="M8 5v14l11-7z" />
          </button>
          <button
            type="button"
            onClick={() => setStatus('running')}
            disabled={status === 'running'}
            className="flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3.5 py-1.5 text-xs font-semibold text-white transition-transform active:scale-[0.96] disabled:opacity-60"
          >
            {status === 'running' && <Spinner />}
            Submit
          </button>
        </div>

        <div className="flex items-center gap-3 text-white/35">
          <IconGlyph d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          <IconGlyph d="M12 2 4 7v6c0 5 3.6 8 8 9 4.4-1 8-4 8-9V7Z" />
          <IconGlyph d="M4 5h16M4 12h16M4 19h16" />
          <IconGlyph d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 17.58a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 13 1.65 1.65 0 0 0 3.17 12H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 7.05a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 2.34l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09c0 .68.39 1.29 1 1.51.62.24 1.33.1 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.43.49-.57 1.2-.33 1.82.22.61.83 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.68 0-1.29.39-1.51 1Z" />
          <span className="flex items-center gap-1 text-[0.65rem] text-white/45">
            <IconGlyph d="M12 2c-1 3-4 4-4 8a4 4 0 0 0 8 0c0-1.5-.7-2.3-1.2-3.1.2 1-.3 1.6-1 1.6-1.4 0-1-2-1.8-3.5-.4-.7-.7-1.4-1-3Z" />
            0
          </span>
          <IconGlyph d="M12 6v6l4 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <IconGlyph d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          <span className="size-6 rounded-full bg-white/10" aria-hidden="true" />
          <span className="rounded bg-orange-500/15 px-2 py-0.5 text-[0.6rem] font-semibold text-orange-400">
            Premium
          </span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 overflow-hidden">
        <div className="flex flex-col overflow-hidden border-r border-white/10">
          <div className="flex items-center gap-4 border-b border-white/10 px-4 py-2 text-white/45">
            {DESC_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setDescTab(tab.key)}
                className={`border-b-2 pb-1.5 pt-1 text-[0.7rem] font-medium transition-colors ${
                  descTab === tab.key
                    ? 'border-[#2563eb] text-white'
                    : 'border-transparent hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {descTab !== 'description' ? (
              <div className="flex h-full items-center justify-center text-white/30">
                {descTab === 'submissions'
                  ? 'No submissions yet.'
                  : '🔒 Available with LeetCode Premium'}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-white">1. Two Sum</p>
                  {status === 'accepted' && (
                    <span className="flex items-center gap-1 text-heatmap-4">
                      Solved
                      <IconGlyph d="M4 12.5 9.5 18 20 6" />
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-heatmap-4/15 px-2 py-0.5 font-medium text-heatmap-4">
                    Easy
                  </span>
                  <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-white/50">
                    <IconGlyph d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83Z" />
                    Topics
                  </span>
                  <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-white/50">
                    <IconGlyph d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                    Companies
                  </span>
                  <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-white/50">
                    <IconGlyph d="M12 17h.01M12 13.5a1.5 1.5 0 0 1 1-1.42c.7-.26 1.5-.9 1.5-1.83A2.25 2.25 0 0 0 12 8a2.25 2.25 0 0 0-2.24 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                    Hint
                  </span>
                </div>

                <p className="mt-4 leading-relaxed text-white/70">
                  Given an array of integers{' '}
                  <code className="rounded bg-white/10 px-1 text-white/85">nums</code> and an
                  integer <code className="rounded bg-white/10 px-1 text-white/85">target</code>,
                  return <em>indices</em> of the two numbers such that they add up to{' '}
                  <code className="rounded bg-white/10 px-1 text-white/85">target</code>.
                </p>
                <p className="mt-3 leading-relaxed text-white/70">
                  You may assume that each input would have <strong>exactly</strong> one solution,
                  and you may not use the <em>same</em> element twice.
                </p>
                <p className="mt-3 leading-relaxed text-white/70">
                  You can return the answer in any order.
                </p>

                {CASES.map((example, index) => (
                  <div key={index} className="mt-5">
                    <p className="font-semibold text-white/85">Example {index + 1}:</p>
                    <div className="mt-1.5 rounded-lg bg-white/5 p-3 font-mono leading-relaxed text-white/70">
                      <p>
                        <span className="font-semibold text-white/85">Input:</span> nums ={' '}
                        {example.nums}, target = {example.target}
                      </p>
                      <p>
                        <span className="font-semibold text-white/85">Output:</span>{' '}
                        {index === 1 ? '[1,2]' : '[0,1]'}
                      </p>
                    </div>
                  </div>
                ))}

                <p className="mt-5 font-semibold text-white/85">Constraints:</p>
                <ul className="mt-1.5 list-inside list-disc space-y-1 font-mono text-white/60">
                  <li>2 ≤ nums.length ≤ 10⁴</li>
                  <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                  <li>Only one valid answer exists.</li>
                </ul>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-white/35">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <IconGlyph d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                69.3K
              </span>
              <span className="flex items-center gap-1">
                <IconGlyph d="m17 14 5 8-5-8Zm0 0H7l5-8 5 8ZM7 14l-5 8 5-8Z" />
              </span>
              <span className="flex items-center gap-1">
                <IconGlyph d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z" />
                2K
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-heatmap-4" /> 2685 Online
            </span>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-white/60">
            <div className="flex items-center gap-2">
              <IconGlyph d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />
              <span className="font-medium">Python3</span>
              <IconGlyph d="m6 9 6 6 6-6" />
              <span className="mx-1 text-white/20">|</span>
              <IconGlyph d="M12 22c5.5-2.5 8-6 8-11V5l-8-3-8 3v6c0 5 2.5 8.5 8 11Z" />
              <span>Auto</span>
              <IconGlyph d="m6 9 6 6 6-6" />
            </div>
            <div className="flex items-center gap-2.5 text-white/35">
              <IconGlyph d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              <IconGlyph d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
              <IconGlyph d="M7 8h10M7 12h6M12 20l-5-5h3V4h4v11h3Z" />
              <IconGlyph d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <IconGlyph d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </div>
          </div>

          <div className="flex flex-1 overflow-auto bg-[#151515] font-mono">
            <div className="select-none border-r border-white/5 px-3 py-3 text-right text-white/20">
              {CODE_LINES.map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>
            <div className="flex-1 px-3 py-3 text-white/80">
              {CODE_LINES.map((line, index) => (
                <div key={index} className="whitespace-pre">
                  {highlightCode(line)}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-3 py-1 text-[0.65rem] text-white/30">
            <span>Saved</span>
            <span>Ln 1, Col 1</span>
          </div>

          <div className="flex h-36 flex-col border-t border-white/10">
            <div className="flex items-center gap-4 border-b border-white/10 px-4 py-1.5 text-white/45">
              <button
                type="button"
                onClick={() => setManualBottomTab('testcase')}
                className={`flex items-center gap-1 text-[0.7rem] font-medium transition-colors ${
                  bottomTab === 'testcase' ? 'text-white' : 'hover:text-white/70'
                }`}
              >
                <IconGlyph d="M9 11 12 14 22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                Testcase
              </button>
              <button
                type="button"
                onClick={() => setManualBottomTab('result')}
                className={`flex items-center gap-1 text-[0.7rem] font-medium transition-colors ${
                  bottomTab === 'result' ? 'text-white' : 'hover:text-white/70'
                }`}
              >
                <IconGlyph d="m4 17 6-6-6-6M12 19h8" />
                Test Result
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {bottomTab === 'testcase' && (
                <>
                  <div className="flex gap-2">
                    {CASES.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedCase(index)}
                        className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                          selectedCase === index
                            ? 'bg-white/10 text-white'
                            : 'bg-white/5 text-white/50 hover:text-white/80'
                        }`}
                      >
                        Case {index + 1}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-white/40">Input</p>
                  <p className="mt-1 font-mono text-white/70">nums =</p>
                  <p className="font-mono text-white/85">{CASES[selectedCase]!.nums}</p>
                </>
              )}

              {bottomTab === 'result' &&
                (status === 'accepted' ? (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-base font-bold text-heatmap-4">Accepted</span>
                      <span className="text-white/40">Runtime: 0 ms</span>
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      {CASES.map((_, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-heatmap-4"
                        >
                          <IconGlyph d="M4 12.5 9.5 18 20 6" />
                          Case {index + 1}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-white/40">Input</p>
                    <p className="mt-1 font-mono text-white/70">nums =</p>
                    <p className="font-mono text-white/85">{CASES[selectedCase]!.nums}</p>
                  </>
                ) : (
                  <p className="text-white/30">You must run your code first.</p>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
