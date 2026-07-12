import type { Problem, Submission } from '@algoledger/schemas'

export const twoSumProblem: Problem = {
  problemId: '1',
  frontendId: '1',
  title: 'Two Sum',
  slug: 'two-sum',
  difficulty: 'Easy',
  topics: ['Array', 'Hash Table'],
  companyTags: [],
  statement:
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  examples: ['Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]'],
  constraints: ['2 <= nums.length <= 10^4'],
  url: 'https://leetcode.com/problems/two-sum/',
}

export const acceptedSubmission: Submission = {
  submissionId: '2065366985',
  questionId: '1',
  typedCode: 'class Solution:\n    def twoSum(self, nums, target):\n        pass\n',
  language: 'python3',
  runtime: '0 ms',
  memory: '18 MB',
  acceptedAt: '2026-07-13T10:00:00.000Z',
}
