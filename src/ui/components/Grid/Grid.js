import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'
import GridColumn from './GridColumn'

const rules = {
  root: props => ({
    display: 'flex',
  }),
}

class Grid extends Component {
  render() {
    const { ElementType, styles, theme, ...rest } = this.props

    return <ElementType {...rest} />
  }
}

Grid.Column = GridColumn

export default createComponent({ rules })(Grid)
