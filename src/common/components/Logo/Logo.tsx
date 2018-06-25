import * as React from 'react'
import icon16 from '../../public/icon16.png'
import icon48 from '../../public/icon48.png'
import icon128 from '../../public/icon128.png'

import { Image } from 'semantic-ui-react'

export interface ILogoProps {
  size?: 'small'| 'medium'| 'large'
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

const Logo: React.SFC = ({ size }: ILogoProps) => <Image width={widthBySize[size]} src={iconsBySize[size]} alt="Logo" />

Logo.defaultProps = {
  size: 'medium',
}

export default Logo
