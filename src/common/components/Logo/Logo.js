import PropTypes from 'prop-types'
import React from 'react'
import icon16 from '../../public/icon16.png'
import icon48 from '../../public/icon48.png'
import icon128 from '../../public/icon128.png'

const iconsBySize = {
  8: icon16,
  24: icon48,
  64: icon128,
}

const Logo = ({ size }) => <img width={size} src={iconsBySize[size]} alt="Logo" />

Logo.propTypes = {
  size: PropTypes.oneOf([8, 24, 64, '8', '24', '64']),
}

Logo.defaultProps = {
  size: 24,
}

export default Logo
