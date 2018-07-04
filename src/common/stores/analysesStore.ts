import { computed, reaction } from 'mobx'

import { FirebaseListAdapter } from '../transport'
import Analysis from './Analysis'
import sessionStore from './sessionStore'

export class AnalysesStore extends FirebaseListAdapter {
  constructor() {
    super(Analysis, '/analyses')
    reaction(() => sessionStore.asJS, this.reset)
  }

  @computed
  get analyses() {
    return Array.from(this._map.values())
  }

  @computed
  get propertyIds() {
    return Array.from(this._map.keys())
  }

  getByPropertyId = propertyId => this._map.get(propertyId) || null
}

const analysesStore = new AnalysesStore()

export default analysesStore
