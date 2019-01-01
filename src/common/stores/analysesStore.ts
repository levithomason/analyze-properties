import { computed, reaction } from 'mobx'

import { FirebaseListAdapter } from '../transport'
import Analysis from './Analysis'
import sessionStore from './sessionStore'

export class AnalysesStore extends FirebaseListAdapter {
  constructor() {
    super()
    this.mountAtCurrentUser()

    reaction(() => {
      return sessionStore.currentUser && sessionStore.currentUser.key
    }, this.handleUserChange)
  }

  handleUserChange = () => this.mountAtCurrentUser()

  mountAtCurrentUser = () => {
    if (sessionStore.currentUser && sessionStore.currentUser.key) {
      this.mount(Analysis, `/analyses/${sessionStore.currentUser.key}`)
      this.reset()
    }
  }

  @computed
  get analyses() {
    return Array.from(this._map.values())
  }

  @computed
  get propertyIds() {
    return Array.from(this._map.keys())
  }

  getByPropertyId(propertyId: string): Analysis {
    // TODO: normalize property Ids to strings...
    return this._map.get(propertyId) || this._map.get(String(propertyId)) || null
  }
}

const analysesStore = new AnalysesStore()

export default analysesStore
