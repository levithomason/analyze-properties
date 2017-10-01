import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

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

const Debug = ({ analysis }) => (
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

Debug.propTypes = {
  analysis: PropTypes.object,
  propertyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

export default _.flow(
  firebaseConnect(({ propertyId }) => [`/analyses/${propertyId}`]),
  reduxConnect(({ firebase: { data: { analyses } } }, { propertyId }) => ({
    analysis: _.get(propertyId, analyses),
  })),
)(Debug)
