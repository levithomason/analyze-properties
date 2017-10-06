import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, getFirebase } from 'react-redux-firebase'

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
    const { active, firebase, propertyId } = this.props
    firebase.set(`/analyses/${getFirebase().auth.uid}/${propertyId}/favorite`, !active)
  }

  render() {
    const { active, dispatch, firebase, analysis, propertyId, styles, ...rest } = this.props

    const src = active
      ? '//image.flaticon.com/icons/png/128/179/179539.png'
      : '//image.flaticon.com/icons/png/128/126/126471.png'

    return (
      <Button icon className={styles.root} onClick={this.handleClick} {...rest}>
        <img className={styles.image} src={src} alt="Favorite button" />
        <span className={styles.text}>Favorite</span>
      </Button>
    )
  }
}

export default _.flow(
  felaConnect(rules),
  firebaseConnect(({ propertyId }) => `/analyses/${getFirebase().auth.uid}/${propertyId}/favorite`),
  reduxConnect(({ firebase: { data: { analyses } } }, { propertyId }) => ({
    analysis: _.get([getFirebase().auth.uid, propertyId], analyses),
    active: _.get([propertyId, 'favorite'], analyses),
  })),
)(FavoriteButton)
