import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: props => ({
    flex: '1',
  }),
}

class GridColumn extends Component {
  render() {
    const { ElementType, styles, theme, ...rest } = this.props

    return <ElementType {...rest} />
  }
}

export default createComponent({ rules })(GridColumn)
