import * as React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: props => ({
    flex: '1',
  }),
}

class GridColumn extends React.Component {
  render() {
    const { ElementType, styles, theme, ...rest } = this.props

    return <ElementType {...rest} />
  }
}

export default createComponent({ rules })(GridColumn)
