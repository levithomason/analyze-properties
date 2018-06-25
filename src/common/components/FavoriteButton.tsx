import cx from 'classnames'
import _ from 'lodash/fp'
import * as React from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Button from '../../ui/components/Button'
import theme from '../../ui/styles/theme'

const rules = {
  icon: ({ icon }) => ({
    color: theme.textColors.red.hex(),
    // marginRight: icon ? '0' : '0.325em',
    // verticalAlign: 'middle',
    // height: '1em',
  }),
  text: ({ icon }) => {
    return Object.assign(
      {},
      icon && {
        display: 'none',
      },
    )
  },
}

class FavoriteButton extends React.Component {
  handleClick = () => {
    const { analysis, auth, firebase, propertyId } = this.props
    firebase.set(`/analyses/${auth.uid}/${propertyId}/favorite`, !analysis.favorite)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return _.get('analysis.favorite', this.props) !== _.get('analysis.favorite', nextProps)
  }

  render() {
    const { analysis, auth, dispatch, firebase, icon, propertyId, styles, ...rest } = this.props

    if (!analysis) return null

    const classes = analysis.favorite ? 'fa fa-heart' : 'fa fa-heart-o'

    return (
      <Button basic={icon} icon onClick={this.handleClick} {...rest}>
        <i className={cx(classes, styles.icon)} /> <span className={styles.text}>Favorite</span>
      </Button>
    )
  }
}

export default _.flow(
  felaConnect(rules),
  firebaseConnect(['/analyses']),
  reduxConnect(({ firebase: { auth, data: { analyses } } }, { propertyId }) => ({
    analysis: _.get([auth.uid, propertyId], analyses),
    auth,
  })),
)(FavoriteButton)
