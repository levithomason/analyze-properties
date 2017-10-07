import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'

import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'
import FavoriteButton from '../../components/FavoriteButton'
import theme from '../../../ui/styles/theme.js'

class AnalysesTableRow extends Component {
  static propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func,
  }
  handleClick = e => {
    _.invokeArgs('onClick', [e, { ...this.props }], this.props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      _.some(col => this.props[col] !== nextProps[col], COLUMNS) ||
      this.props.active !== nextProps.active ||
      this.props.url !== nextProps.url ||
      this.props.image !== nextProps.image ||
      this.props.address !== nextProps.address ||
      this.props.city !== nextProps.city ||
      this.props.state !== nextProps.state ||
      this.props.zip !== nextProps.zip
    )
  }

  render() {
    const { active, analysis, styles } = this.props

    if (!analysis) return null

    const { url, image, address, city, state, zip } = analysis

    return (
      <tr onClick={this.handleClick} className={styles.tableRow}>
        <td className={styles.tableCell}>
          <a
            href={url}
            style={{
              display: 'inline-block',
              marginRight: '0.5em',
              width: '10em',
              height: '7em',
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              verticalAlign: 'middle',
            }}
            target="_blank"
          />
          <div style={{ display: 'block', verticalAlign: 'middle' }}>
            {address}
            <br />
            {city}, {state} {zip}
          </div>
        </td>
        {COLUMNS.map(({ key, format }) => (
          <td
            key={key}
            className={styles.tableCell}
            style={{
              textAlign: 'right',
              fontWeight: active ? 'bold' : 'normal',
            }}
          >
            {format(analysis[key])}
          </td>
        ))}
        <td className={styles.tableCell}>
          <FavoriteButton icon propertyId={analysis.propertyId} />
        </td>
      </tr>
    )
  }
}

export default felaConnect(tableStyles)(AnalysesTableRow)
