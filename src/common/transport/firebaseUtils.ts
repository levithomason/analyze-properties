import FirebaseMapAdapter from './FirebaseMapAdapter'

/** Converts a firebase snapshot to a "model" shape (object with an id). */
export const snapshotToValueOrMap = snapshot => {
  if (!snapshot) return null

  if (snapshot.hasChildren()) return new FirebaseMapAdapter(snapshot.ref)

  return snapshot.toJSON()
}

export const getPath = ref => {
  const path = []

  while (ref) {
    path.unshift(ref.key)
    ref = ref.parent
  }

  return path.join('/')
}
