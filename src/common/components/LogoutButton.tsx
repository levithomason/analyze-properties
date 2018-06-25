import * as React from 'react'
import { firebaseConnect } from 'react-redux-firebase'

import Button from '../../ui/components/Button'

class LogoutButton extends React.Component {
  handleLogout = () => {
    const { firebase } = this.props
    firebase.logout()
  }

  render() {
    const { firebase, ...rest } = this.props
    return (
      <Button {...rest} onClick={this.handleLogout}>
        Logout
      </Button>
    )
  }
}

export default firebaseConnect()(LogoutButton)
