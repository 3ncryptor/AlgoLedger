export type NameIndex = Record<string, string[]>

export const EMPTY_NAME_INDEX: NameIndex = {}

export function addToIndex(index: NameIndex, name: string, entryId: string): NameIndex {
  const existing = index[name] ?? []
  if (existing.includes(entryId)) return index

  return { ...index, [name]: [...existing, entryId] }
}

export function addManyToIndex(index: NameIndex, names: string[], entryId: string): NameIndex {
  return names.reduce((acc, name) => addToIndex(acc, name, entryId), index)
}

export function removeFromIndex(index: NameIndex, name: string, entryId: string): NameIndex {
  const existing = index[name]
  if (!existing || !existing.includes(entryId)) return index

  const filtered = existing.filter((id) => id !== entryId)
  const next = { ...index }
  if (filtered.length > 0) {
    next[name] = filtered
  } else {
    delete next[name]
  }
  return next
}
