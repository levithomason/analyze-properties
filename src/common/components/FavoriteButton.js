import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Button from '../../ui/components/Button'

const rules = {
  root: props => ({}),
  image: ({ icon }) => ({
    marginRight: icon ? '0' : '0.325em',
    verticalAlign: 'middle',
    height: '1em',
  }),
  text: ({ icon }) =>
    Object.assign(
      {},
      icon && {
        display: 'none',
      },
    ),
}

class FavoriteButton extends Component {
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

    const src = analysis.favorite
      ? '//image.flaticon.com/icons/png/128/179/179539.png'
      : '//image.flaticon.com/icons/png/128/126/126471.png'

    return (
      <Button basic={icon} icon className={styles.root} onClick={this.handleClick} {...rest}>
        <img className={styles.image} src={src} alt="Favorite button" />
        <span className={styles.text}>Favorite</span>
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
