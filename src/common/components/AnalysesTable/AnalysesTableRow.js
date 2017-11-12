import cx from 'classnames'
import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'
import { Icon } from 'semantic-ui-react'

import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'
import FavoriteButton from '../../components/FavoriteButton'
import theme from '../../../ui/styles/theme'
import * as rei from '../../resources/rei'

const overlayTextStyle = {
  position: 'absolute',
  padding: '0.125em',
  width: '100%',
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '11px',
  lineHeight: '1.5',
  textAlign: 'right',
  textShadow: '0 0.5px 1px rgba(0, 0, 0, 0.75)',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  background: `linear-gradient(transparent, rgba(0, 0, 0, 0.5))`,
}

class AnalysesTableRow extends Component {
  static propTypes = {
    active: PropTypes.bool,
    analysis: PropTypes.object,
    criteria: PropTypes.object,
    onClick: PropTypes.func,
  }
  handleClick = e => {
    _.invokeArgs('onClick', [e, { ...this.props }], this.props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const analysisKeys = ['url', 'image', 'address', 'city', 'state', 'zip', 'favorite']

    const currAnalysis = _.get('analysis', this.props) || {}
    const currCriteria = _.get('criteria', this.props) || {}

    const nextAnalysis = nextProps.analysis || {}
    const nextCriteria = nextProps.criteria || {}

    return (
      this.props.active !== nextProps.active ||
      _.some(col => currAnalysis[col.key] !== nextAnalysis[col.key], COLUMNS) ||
      _.some(col => currCriteria[col.key] !== nextCriteria[col.key], COLUMNS) ||
      _.some(key => currCriteria[key] !== nextCriteria[key], analysisKeys)
    )
  }

  render() {
    const { active, criteria, analysis, styles } = this.props

    if (!analysis || !criteria) return null

    const { beds, baths, url, image, address, city, state, zip } = analysis

    const check = rei.checkDeal(analysis, criteria)
    const isGoodDeal = _.every(_.identity, _.values(check))
    const checkColor = theme.statusTextColors[isGoodDeal ? 'success' : 'error'].hex()

    return (
      <tr onClick={this.handleClick} className={styles.tableRow}>
        <td className={cx(styles.tableCell, styles.tableCellCollapse)}>
          <a
            href={url}
            style={{
              position: 'relative',
              display: 'block',
              width: '12em',
              height: '8em',
              borderLeft: `3px solid ${checkColor}`,
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: active ? 1 : 0.9,
            }}
            target="_blank"
          >
            <div style={overlayTextStyle}>
              <Icon name="bed" /> {beds} <Icon name="bath" /> {baths}
              <br />
              {address}
              <br />
              {city}, {state} {zip}
            </div>
          </a>
        </td>
        {COLUMNS.map(({ key, format }) => (
          <td
            key={key}
            className={cx(styles.tableCell, styles.tableValueCell)}
            style={{
              color: _.has(key, check)
                ? theme.textColors[check[key] ? 'green' : 'red'].hex()
                : 'none',
            }}
          >
            {format(analysis[key])}
          </td>
        ))}
        <td className={styles.tableCell} style={{ textAlign: 'center' }}>
          <FavoriteButton icon propertyId={analysis.propertyId} />
        </td>
      </tr>
    )
  }
}

export default _.flow(
  felaConnect(tableStyles),
  firebaseConnect(['/analyses', '/criteria']),
  reduxConnect(({ firebase: { auth, data: { analyses, criteria } } }, { propertyId }) => ({
    analysis: _.get([auth.uid, propertyId], analyses),
    criteria: _.get(auth.uid, criteria),
  })),
)(AnalysesTableRow)
