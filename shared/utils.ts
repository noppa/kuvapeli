export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result
}
export type Uuid = string & { __uuid: true }
export type DateLike = Date | string

type ShallowObject = Record<string, string | number | boolean | Uuid | DateLike>

export function shallowJsonObjectsEqual(
  a: ShallowObject,
  b: ShallowObject,
): boolean {
  const keysA = Object.keys(a).sort()
  const keysB = Object.keys(b).sort()
  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) {
      return false
    }
    if (JSON.stringify(a[keysA[i]]) !== JSON.stringify(b[keysB[i]])) {
      return false
    }
  }
}
