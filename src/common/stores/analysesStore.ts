import { computed, reaction } from 'mobx'

import { FirebaseListAdapter } from '../transport'
import Analysis from './Analysis'
import sessionStore from './sessionStore'

export class AnalysesStore extends FirebaseListAdapter {
  constructor() {
    super()
    reaction(() => {
      return sessionStore.currentUser && sessionStore.currentUser.key
    }, this.init.bind(this))
  }

  init() {
    if (sessionStore.currentUser) {
      super.init(Analysis, `/analyses/${sessionStore.currentUser.key}`)
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
    return this._map.get(propertyId) || null
  }
}

const analysesStore = new AnalysesStore()

export default analysesStore
