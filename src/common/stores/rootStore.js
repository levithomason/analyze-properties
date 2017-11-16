import { useStrict } from 'mobx'

import roleStore from './RoleStore'
import userStore from './UserStore'

// only allow state changes in an @action
useStrict(true)

const rootStore = {
  roleStore,
  userStore,
}

export default rootStore
