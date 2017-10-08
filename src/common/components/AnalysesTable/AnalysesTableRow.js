import cx from 'classnames'
import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'

import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'
import FavoriteButton from '../../components/FavoriteButton'
import theme from '../../../ui/styles/theme'

class AnalysesTableRow extends Component {
  static propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func,
  }
  handleClick = e => {
    _.invokeArgs('onClick', [e, { ...this.props }], this.props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const analysisKeys = ['url', 'image', 'address', 'city', 'state', 'zip', 'favorite']

    return (
      this.props.active !== nextProps.active ||
      _.some(col => this.props.analysis[col] !== nextProps.analysis[col], COLUMNS) ||
      _.some(key => this.props.analysis[key] !== nextProps.analysis[key], analysisKeys)
    )
  }

  render() {
    const { active, analysis, styles } = this.props

    if (!analysis) return null

    const { url, image, address, city, state, zip } = analysis

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
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            target="_blank"
          >
            <span
              style={{
                position: 'absolute',
                padding: '0.125em',
                width: '100%',
                bottom: '0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '11px',
                textShadow: '0 1px rgba(0, 0, 0, 0.75)',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                background: `linear-gradient(transparent, rgba(0, 0, 0, 0.5))`,
              }}
            >
              {address}
              <br />
              {city}, {state}
            </span>
          </a>
        </td>
        {COLUMNS.map(({ key, format }) => (
          <td key={key} className={cx(styles.tableCell, styles.tableValueCell)}>
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

export default felaConnect(tableStyles)(AnalysesTableRow)
