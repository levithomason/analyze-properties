export interface IUser {
  createdAt?: string
  displayName?: string
  email?: string
  emailVerified?: boolean
  isAnonymous?: boolean
  lastLoginAt?: string
  phoneNumber?: null
  photoURL?: string
  uid?: string
}

class User implements IUser {
  createdAt?: string
  displayName?: string
  email?: string
  emailVerified?: boolean
  isAnonymous?: boolean
  lastLoginAt?: string
  phoneNumber?: null
  photoURL?: string
  uid?: string

  constructor(user: IUser) {
    this.createdAt = user.createdAt || null
    this.displayName = user.displayName || null
    this.email = user.email || null
    this.emailVerified = user.emailVerified || null
    this.isAnonymous = user.isAnonymous || null
    this.lastLoginAt = user.lastLoginAt || null
    this.phoneNumber = user.phoneNumber || null
    this.photoURL = user.photoURL || null
    this.uid = user.uid || null
  }

  toJSON() {
    return {
      createdAt: this.createdAt,
      displayName: this.displayName,
      email: this.email,
      emailVerified: this.emailVerified,
      isAnonymous: this.isAnonymous,
      lastLoginAt: this.lastLoginAt,
      phoneNumber: this.phoneNumber,
      photoURL: this.photoURL,
      uid: this.uid,
    }
  }
}

export default User
