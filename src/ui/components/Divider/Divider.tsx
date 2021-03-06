import * as React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ fitted, hidden, relaxed, section, thick }) =>
    Object.assign(
      {
        margin: '0.5em auto',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderStyle: 'solid',
        borderTopWidth: '1px',
        borderLeftWidth: 0,
        borderRightWidth: 0,
        width: '100%',
      },
      fitted && { margin: '0 auto' },
      hidden && { opacity: 0 },
      relaxed && { width: '90%' },
      section && { margin: '2em auto' },
      thick && { borderTopWidth: '2px' },
    ),
}
class Divider extends React.Component {
  render() {
    const {
      ElementType,
      styles,
      theme,
      fitted,
      hidden,
      relaxed,
      section,
      thick,
      ...rest
    } = this.props
    return <ElementType {...rest} />
  }
}

export default createComponent({ defaultElementType: 'hr', rules })(Divider)
