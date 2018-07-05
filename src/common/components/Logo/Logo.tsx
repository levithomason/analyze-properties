import * as React from 'react'
import icon16 from '../../public/icon16.png'
import icon48 from '../../public/icon48.png'
import icon128 from '../../public/icon128.png'

export interface ILogoProps {
  size?: 'small' | 'medium' | 'large'
}

const iconsBySize = {
  small: icon16,
  medium: icon48,
  large: icon128,
}

const widthBySize = {
  small: 8,
  medium: 24,
  large: 64,
}

const Logo: React.SFC<ILogoProps> = ({ size }) => (
  <img
    alt="Logo"
    src={iconsBySize[size]}
    style={{ width: widthBySize[size], verticalAlign: 'bottom' }}
  />
)

Logo.defaultProps = {
  size: 'medium',
}

export default Logo
