import PropTypes from 'prop-types'
import React from 'react'

const Logo = ({ size }) => (
  <img width={size} src={`/icon${size * 2}.png`} alt="Analyze Properties" />
)

Logo.propTypes = {
  size: PropTypes.oneOf([8, 24, 64, '8', '24', '64']),
}

Logo.defaultProps = {
  size: 24,
}

export default Logo
