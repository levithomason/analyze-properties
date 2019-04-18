import { inject } from 'mobx-react'
import * as React from 'react'
import { firebaseConnect } from 'react-redux-firebase'
import { Button } from 'semantic-ui-react'

import { SessionStore } from '../stores/sessionStore'
import router from '../router'

interface LogoutButtonProps {
  sessionStore: SessionStore
}

@inject('sessionStore')
class LogoutButton extends React.Component<LogoutButtonProps> {
  handleLogout = () => {
    const { sessionStore } = this.props
    sessionStore.logout()
    router.navigate('/')
  }

  render() {
    const { sessionStore, ...rest } = this.props
    return (
      <Button {...rest} onClick={this.handleLogout}>
        Logout
      </Button>
    )
  }
}

export default firebaseConnect()(LogoutButton)
