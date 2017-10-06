import React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: props => ({
    padding: '0 1em',
    width: '100%',
    margin: 'auto',
    '@media (min-width: 48em)': { width: '48em' }, // 768px  @ 16px rem
    '@media (min-width: 64em)': { width: '64em' }, // 1024px @ 16px rem
    '@media (min-width: 75em)': { width: '75em' }, // 1200px @ 16px rem
    '@media (min-width: 90em)': { width: '90em' }, // 1440px @ 16px rem
  }),
}

const Container = ({ ElementType, styles, theme, ...rest }) => {
  return <ElementType {...rest} />
}

export default createComponent({ rules })(Container)
