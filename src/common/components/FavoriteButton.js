import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, dataToJS } from 'react-redux-firebase'
import { connect as felaConnect } from 'react-fela'
import Button from '../../ui/components/Button'

const rules = {
  root: props => ({}),
  image: props => ({
    marginRight: '0.325em',
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
    firebase.set(`/analyses/${propertyId}/favorite`, !active)
  }

  render() {
    const { active, propertyId, styles, ...rest } = this.props

    if (!propertyId) return null

    const src = active
      ? '//image.flaticon.com/icons/png/128/179/179539.png'
      : '//image.flaticon.com/icons/png/128/126/126471.png'

    return (
      <Button className={styles.root} onClick={this.handleClick} {...rest}>
        <img className={styles.image} src={src} alt="Favorite button" />
        <span className={styles.text}>Favorite</span>
      </Button>
    )
  }
}

export default _.flow(
  felaConnect(rules),
  firebaseConnect(({ propertyId }) => [`/analyses/${propertyId}/favorite`]),
  reduxConnect(({ firebase }, { propertyId }) => ({
    active: dataToJS(firebase, `analyses/${propertyId}/favorite`),
  })),
)(FavoriteButton)
