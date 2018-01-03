import FirebaseMapAdapter from './FirebaseMapAdapter'

/** Converts a firebase snapshot to a "model" shape (object with an id). */
export const snapshotToValueOrMap = snapshot => {
  if (!snapshot) return null

  if (snapshot.hasChildren()) return new FirebaseMapAdapter(snapshot.ref)

  return snapshot.toJSON()
}

/** Converts a firebase auth user object to a "model" shape (object with an id). */
export const authUserToModel = user => {
  const userObj = user || {}

  return {
    id: userObj.uid || null,
    displayName: userObj.displayName || null,
    email: userObj.email || null,
    phoneNumber: userObj.phoneNumber || null,
    photoURL: userObj.photoURL || null,
  }
}

export const getPath = ref => {
  const path = []

  while (ref) {
    path.unshift(ref.key)
    ref = ref.parent
  }

  return path.join('/')
}
