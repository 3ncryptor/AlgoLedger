import { describe, expect, test } from 'vitest'
import { parseHtmlContent } from '../../src/leetcode/parse-html-content'

const TWO_SUM_CONTENT =
  '<p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>\n\n<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>\n\n<p>You can return the answer in any order.</p>\n\n<p>&nbsp;</p>\n<p><strong class="example">Example 1:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [2,7,11,15], target = 9\n<strong>Output:</strong> [0,1]\n<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].\n</pre>\n\n<p><strong class="example">Example 2:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [3,2,4], target = 6\n<strong>Output:</strong> [1,2]\n</pre>\n\n<p><strong class="example">Example 3:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [3,3], target = 6\n<strong>Output:</strong> [0,1]\n</pre>\n\n<p>&nbsp;</p>\n<p><strong>Constraints:</strong></p>\n\n<ul>\n\t<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>\n\t<li><strong>Only one valid answer exists.</strong></li>\n</ul>\n\n<p>&nbsp;</p>\n<strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than <code>O(n<sup>2</sup>)</code> time complexity?'

describe('parseHtmlContent', () => {
  test('extracts the statement as everything before the first example marker, using the real Two Sum content', () => {
    const result = parseHtmlContent(TWO_SUM_CONTENT)

    expect(result.statement).toContain('Given an array of integers')
    expect(result.statement).not.toContain('Example 1')
  })

  test('splits all three real examples into separate entries', () => {
    const result = parseHtmlContent(TWO_SUM_CONTENT)

    expect(result.examples).toHaveLength(3)
    expect(result.examples[0]).toContain('nums = [2,7,11,15]')
    expect(result.examples[1]).toContain('nums = [3,2,4]')
    expect(result.examples[2]).toContain('nums = [3,3]')
  })

  test('extracts each real constraint as a separate list item', () => {
    const result = parseHtmlContent(TWO_SUM_CONTENT)

    expect(result.constraints).toHaveLength(4)
    expect(result.constraints[0]).toContain('nums.length')
    expect(result.constraints[3]).toContain('Only one valid answer exists')
  })

  test('returns empty statement/examples/constraints gracefully for empty input', () => {
    const result = parseHtmlContent('')

    expect(result).toEqual({ statement: '', examples: [], constraints: [] })
  })
})
