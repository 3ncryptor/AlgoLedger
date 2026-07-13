'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

type View = 'root' | 'folder' | 'file'
type FileName = 'README.md' | 'metadata.json' | 'solution.py'

const FILES: FileName[] = ['README.md', 'metadata.json', 'solution.py']

const SOLUTION_CODE = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for idx, val in enumerate(nums):
            complement = target - val
            if complement in seen:
                return [seen[complement], idx]
            seen[val] = idx
        return []`

function Badge({ label, message, color }: { label: string; message: string; color: string }) {
  return (
    <span className="inline-flex overflow-hidden rounded text-[0.65rem] font-medium">
      <span className="bg-[#2a2a2a] px-1.5 py-0.5 text-white/50">{label}</span>
      <span className={`px-1.5 py-0.5 text-black ${color}`}>{message}</span>
    </span>
  )
}

function PyCode({ code }: { code: string }) {
  const keywordPattern = /\b(class|def|for|in|if|return)\b|(self)/g

  return (
    <>
      {code.split('\n').map((line, lineIndex) => {
        const parts = line.split(keywordPattern).filter((part) => part !== undefined && part !== '')
        return (
          <div key={lineIndex} className="whitespace-pre">
            {parts.map((part, partIndex) => {
              if (/^(class|def|for|in|if|return)$/.test(part)) {
                return (
                  <span key={partIndex} className="text-purple-400">
                    {part}
                  </span>
                )
              }
              if (part === 'self') {
                return (
                  <span key={partIndex} className="text-orange-300/80">
                    {part}
                  </span>
                )
              }
              return <span key={partIndex}>{part}</span>
            })}
          </div>
        )
      })}
    </>
  )
}

const FILE_PREVIEWS: Record<FileName, React.ReactNode> = {
  'README.md': (
    <div className="text-xs leading-relaxed text-white/70">
      <p className="text-lg font-bold text-white"># 1. Two Sum</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge label="Difficulty" message="Easy" color="bg-[#4c1]" />
        <Badge label="Topic" message="Array" color="bg-[#08c]" />
        <Badge label="Topic" message="Hash Table" color="bg-[#08c]" />
        <Badge label="Language" message="python3" color="bg-[#fe7d37]" />
      </div>

      <p className="mt-4 font-semibold text-white/85">## Metadata</p>
      <table className="mt-2 w-full border-collapse text-left font-mono text-[0.65rem]">
        <thead>
          <tr className="border-b border-white/10 text-white/50">
            <th className="py-1 pr-4 font-medium">Field</th>
            <th className="py-1 font-medium">Value</th>
          </tr>
        </thead>
        <tbody className="text-white/70">
          <tr className="border-b border-white/5">
            <td className="py-1 pr-4">Runtime</td>
            <td className="py-1">0 ms</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-1 pr-4">Memory</td>
            <td className="py-1">16.8 MB</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-1 pr-4">Submission Date</td>
            <td className="py-1">2026-07-13</td>
          </tr>
          <tr>
            <td className="py-1 pr-4">Platform</td>
            <td className="py-1">LeetCode</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-4 font-semibold text-white/85">## Problem Statement</p>
      <p className="mt-1.5">
        Given an array of integers <code className="rounded bg-white/10 px-1">nums</code> and an
        integer <code className="rounded bg-white/10 px-1">target</code>, return indices of the two
        numbers such that they add up to <code className="rounded bg-white/10 px-1">target</code>.
      </p>
      <p className="mt-2">
        You may assume that each input would have exactly one solution, and you may not use the same
        element twice.
      </p>
      <p className="mt-2">You can return the answer in any order.</p>

      <p className="mt-4 font-semibold text-white/85">## Examples</p>
      <p className="mt-1.5 font-semibold">Example 1:</p>
      <pre className="mt-1 rounded-lg bg-white/5 p-2.5 font-mono text-[0.65rem] text-white/70">
        {
          'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].'
        }
      </pre>
      <p className="mt-2 font-semibold">Example 2:</p>
      <pre className="mt-1 rounded-lg bg-white/5 p-2.5 font-mono text-[0.65rem] text-white/70">
        {'Input: nums = [3,2,4], target = 6\nOutput: [1,2]'}
      </pre>
      <p className="mt-2 font-semibold">Example 3:</p>
      <pre className="mt-1 rounded-lg bg-white/5 p-2.5 font-mono text-[0.65rem] text-white/70">
        {'Input: nums = [3,3], target = 6\nOutput: [0,1]'}
      </pre>

      <p className="mt-4 font-semibold text-white/85">## Constraints</p>
      <ul className="mt-1.5 list-inside list-disc space-y-0.5 font-mono text-white/60">
        <li>2 &lt;= nums.length &lt;= 10^4</li>
        <li>-10^9 &lt;= nums[i], target &lt;= 10^9</li>
        <li>Only one valid answer exists.</li>
      </ul>

      <p className="mt-4 font-semibold text-white/85">## Solution</p>
      <pre className="mt-1.5 overflow-x-auto rounded-lg bg-white/5 p-3 font-mono text-[0.65rem] leading-relaxed text-white/75">
        <PyCode code={SOLUTION_CODE} />
      </pre>

      <p className="mt-4">
        <span className="text-sky-400 underline">View on LeetCode</span>
      </p>
    </div>
  ),
  'metadata.json': (
    <pre className="overflow-x-auto font-mono text-[0.7rem] leading-relaxed text-white/70">
      {'{\n'}
      {'  "difficulty": "Easy",\n'}
      {'  "topics": ["Array", "Hash Table"],\n'}
      {'  "language": "python3",\n'}
      {'  "runtime": "0 ms"\n'}
      {'}'}
    </pre>
  ),
  'solution.py': (
    <pre className="overflow-x-auto font-mono text-[0.7rem] leading-relaxed text-white/70">
      <PyCode code={SOLUTION_CODE} />
    </pre>
  ),
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0 text-white/50"
      aria-hidden="true"
    >
      <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0 text-white/40"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

export function CommitScene() {
  const [view, setView] = useState<View>('root')
  const [openFile, setOpenFile] = useState<FileName | null>(null)

  return (
    <div className="flex h-full flex-col bg-[#0d0d0d]">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-5 py-3">
        <span data-anim="dot" className="size-2 rounded-full bg-heatmap-4" />
        <span className="font-mono text-xs text-white/60">feat(leetcode): solve 0001-two-sum</span>
        <span className="ml-auto text-[0.65rem] text-white/30">just now</span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-b border-white/5 px-5 py-2.5 font-mono text-xs text-white/50">
        <button type="button" onClick={() => setView('root')} className="hover:text-white">
          AlgoLedger
        </button>
        <span>/</span>
        <button type="button" onClick={() => setView('root')} className="hover:text-white">
          leetcode
        </button>
        {view !== 'root' && (
          <>
            <span>/</span>
            <button type="button" onClick={() => setView('folder')} className="hover:text-white">
              0001-two-sum
            </button>
          </>
        )}
        {view === 'file' && openFile && (
          <>
            <span>/</span>
            <span className="text-white/80">{openFile}</span>
          </>
        )}
      </div>

      <motion.div
        key={view + (openFile ?? '')}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="min-h-0 flex-1 overflow-y-auto p-2"
      >
        {view === 'root' && (
          <button
            type="button"
            onClick={() => setView('folder')}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
          >
            <FolderIcon />
            0001-two-sum
          </button>
        )}

        {view === 'folder' && (
          <div className="flex flex-col">
            {FILES.map((file) => (
              <button
                key={file}
                type="button"
                onClick={() => {
                  setOpenFile(file)
                  setView('file')
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
              >
                <FileIcon />
                {file}
              </button>
            ))}
          </div>
        )}

        {view === 'file' && openFile && (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
            {FILE_PREVIEWS[openFile]}
          </div>
        )}
      </motion.div>

      <div className="shrink-0 border-t border-white/10 px-5 py-3 text-xs text-white/40">
        1 commit · 3 files changed
      </div>
    </div>
  )
}
