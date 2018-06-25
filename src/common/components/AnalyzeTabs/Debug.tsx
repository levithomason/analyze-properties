import _ from 'lodash/fp'
import * as React from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

export interface IDebugProps {
  analysis?: object
  propertyId: string | number
}

const wrapperStyle = {
  display: 'flex',
  padding: '0.25em',
  width: '100%',
  borderBottom: '1px solid #eee',
  textWrap: 'wrap',
  wordWrap: 'break-word',
}
const labelStyle = {
  flex: '0 0 auto',
  width: 'auto',
  fontWeight: 'bold',
}
const valueStyle = {
  flex: '1',
  textAlign: 'right',
}

const Debug = ({ analysis }: IDebugProps) => (
  <div>
    {_.keys(analysis)
      .sort()
      .map(key => (
        <div key={key} style={wrapperStyle}>
          <div style={labelStyle}>{key}</div>
          <div style={valueStyle}>{analysis[key]}</div>
        </div>
      ))}
  </div>
)

export default _.flow(
  firebaseConnect(['/analyses']),
  reduxConnect(({ firebase: { auth, data: { analyses } } }, { propertyId }) => ({
    analysis: _.get([auth.uid, propertyId], analyses),
  })),
)(Debug)
