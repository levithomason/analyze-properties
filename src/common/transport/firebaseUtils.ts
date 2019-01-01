export const getPath = ref => {
  const path = []

  while (ref) {
    path.unshift(ref.key)
    ref = ref.parent
  }

  return path.join('/')
}
