export const SUBMIT_PATH_PATTERN = /\/problems\/[\w-]+\/submit\/?$/
export const CHECK_PATH_PATTERN = /\/submissions\/detail\/\d+\/(?:v2\/)?check\/?$/
export const GRAPHQL_PATH_PATTERN = /\/graphql\/?$/

/**
 * Cheap pre-filter checked before reading/parsing a response body. LeetCode pages make many
 * requests (analytics, ads, recommendations, etc.) that can never be a submit/check/graphql
 * exchange — skipping the expensive clone+text+JSON.parse for those is the difference between
 * patching fetch/XHR being nearly free vs. adding real overhead to every request on the page.
 */
export function shouldIntercept(url: string): boolean {
  return (
    SUBMIT_PATH_PATTERN.test(url) || CHECK_PATH_PATTERN.test(url) || GRAPHQL_PATH_PATTERN.test(url)
  )
}
