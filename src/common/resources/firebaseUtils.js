import _ from 'lodash/fp'

/** Converts a firebase snapshot to a "model" shape (object with an id). */
export const snapshotToValueOrModel = snapshot => {
  if (!snapshot) return null

  const val = snapshot.val()

  if (_.isPlainObject(val)) return { id: snapshot.key, ...val }

  return val
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
