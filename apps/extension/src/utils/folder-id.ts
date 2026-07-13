export function folderIdToTitle(folderId: string): string {
  const folder = folderId.split('/').at(-1) ?? folderId
  const slug = folder.replace(/^\d+-/, '')

  return slug
    .split('-')
    .map((word) => (word.length > 0 ? word[0]!.toUpperCase() + word.slice(1) : word))
    .join(' ')
}
