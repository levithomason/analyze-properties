import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, isLoaded, dataToJS } from 'react-redux-firebase'

import * as rei from '../resources/rei'

import Button from '../../ui/components/Button'

class NewAnalysisButton extends Component {
  state = {}

  createDefaultAnalysis = () => {
    console.debug('NewAnalysisButton.createDefaultAnalysis()')
    const { firebase, propertyId } = this.props

    this.setState(() => ({ isFetching: true }))

    rei
      .getDefaultAnalysis(propertyId)
      .then(defaultAnalysis => {
        firebase.set(`/analyses/${propertyId}`, defaultAnalysis)

        this.setState(() => ({ isFetching: false }))
      })
      .catch(err => {
        throw err
      })
  }

  render() {
    const { active, analysis, dispatch, firebase, propertyId, ...rest } = this.props
    const { isFetching } = this.state

    if (!propertyId || !isLoaded(analysis) || analysis) return null

    return (
      <Button onClick={this.createDefaultAnalysis} disabled={isFetching} {...rest}>
        Analyze
      </Button>
    )
  }
}

export default _.flow(
  firebaseConnect(({ propertyId }) => [`/analyses/${propertyId}`]),
  reduxConnect(({ firebase }, { propertyId }) => {
    return {
      analysis: dataToJS(firebase, `analyses/${propertyId}`),
    }
  }),
)(NewAnalysisButton)