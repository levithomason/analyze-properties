import * as React from 'react'
import { Line, Text, Tooltip } from 'recharts'

import { usd } from '../../lib'

export const animationDuration = 200

export const containerDimensions = {
  width: '100%',
  height: 100,
}

export const lineChartProps = {
  margin: { top: 15, right: 15, bottom: 0, left: 15 },
}

export const createTooltip = props => (
  <Tooltip
    {...props}
    animationDuration={animationDuration}
    wrapperStyle={{
      padding: '2px',
      color: '#333',
      fontSize: '12px',
      background: '#eee',
      border: 'none',
    }}
    labelStyle={{ padding: '1px', lineHeight: 1, border: 'none' }}
    itemStyle={{ padding: '1px', lineHeight: 1, border: 'none' }}
    formatter={usd}
  />
)

export const createLine = ({ labelValueFormatter, ...props }) => (
  <Line
    {...props}
    animationDuration={animationDuration}
    type="monotone"
    label={({ x, y, stroke, value }) => (
      <Text x={x} y={y} dy={-6} fill={stroke} fontSize={10} textAnchor="middle">
        {labelValueFormatter(value)}
      </Text>
    )}
  />
)
