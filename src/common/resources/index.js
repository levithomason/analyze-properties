import FirebaseListAdapter from './FirebaseListAdapter'
import SessionResource from './SessionResource'

export const users = new FirebaseListAdapter('/users')
export const roles = new FirebaseListAdapter('/roles')
export const session = new SessionResource()
