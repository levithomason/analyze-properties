import _ from 'lodash/fp'
import * as React from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import * as rei from '../resources/rei'

import Button from '../../ui/components/Button'

class NewAnalysisButton extends React.Component {
  state = {}

  createDefaultAnalysis = () => {
    const { auth, firebase, propertyId } = this.props
    console.debug('NewAnalysisButton.createDefaultAnalysis()', { uid: auth.uid, propertyId })

    this.setState(() => ({ isFetching: true }))

    rei
      .getDefaultAnalysis(propertyId)
      .then(defaultAnalysis => {
        console.log('NewAnalysisButton.createDefaultAnalysis() defaultAnalysis', defaultAnalysis)
        firebase.set(`/analyses/${auth.uid}/${propertyId}`, defaultAnalysis)

        this.setState(() => ({ isFetching: false }))
      })
      .catch(error => {
        console.log('NewAnalysisButton.createDefaultAnalysis() error', error)
        this.setState(() => ({ isFetching: false }))
        throw error
      })
  }

  render() {
    const { analysis, auth, dispatch, firebase, propertyId, ...rest } = this.props
    const { isFetching } = this.state

    if (!propertyId || !!analysis) return null

    return (
      <Button onClick={this.createDefaultAnalysis} disabled={isFetching} {...rest}>
        New Analysis
      </Button>
    )
  }
}

export default _.flow(
  firebaseConnect(['/analyses']),
  reduxConnect(({ firebase: { auth, data: { analyses } } }, { propertyId }) => ({
    analysis: _.get([auth.uid, propertyId], analyses),
    auth,
  })),
)(NewAnalysisButton)
