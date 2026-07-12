export function getProblemFolderName(frontendId: string, slug: string): string {
  const padded = frontendId.padStart(4, '0')
  return `${padded}-${slug}`
}
