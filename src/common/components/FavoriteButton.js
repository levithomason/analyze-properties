import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, dataToJS } from 'react-redux-firebase'
import { connect as felaConnect } from 'react-fela'

const rules = {
  root: props => {
    const { active, fluid, icon } = props

    return Object.assign(
      {
        padding: '0.5em 1em',
        margin: '0',
        fontSize: '1em',
        background: '#DDD',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        opacity: '0.5',
      },
      fluid && {
        display: 'block',
        width: '100%',
      },
      active && {
        opacity: 1,
      },
      icon && {
        background: 'none',
        padding: '0.5em',
      },
    )
  },
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
    const { active, propertyId, styles } = this.props

    if (!propertyId) return null

    const src = active
      ? '//image.flaticon.com/icons/png/128/179/179539.png'
      : '//image.flaticon.com/icons/png/128/126/126471.png'

    return (
      <button className={styles.root} onClick={this.handleClick}>
        <img className={styles.image} src={src} alt="Favorite button" />
        <span className={styles.text}>Favorite</span>
      </button>
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
