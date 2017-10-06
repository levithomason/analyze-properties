import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'

import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'
import FavoriteButton from '../../components/FavoriteButton'

class AnalysesTableRow extends Component {
  handleClick = e => {
    _.invokeArgs('onClick', [e, { ...this.props }], this.props)
  }

  render() {
    const { analysis, styles } = this.props

    if (!analysis) return null

    const { url, image, notes, address, city, state, zip } = analysis

    return (
      <tr onClick={this.handleClick} className={styles.tableRow}>
        <td className={styles.tableCell}>
          <a
            href={url}
            style={{
              display: 'inline-block',
              marginRight: '0.5em',
              width: '13em',
              height: '8em',
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
        {/*<td className={styles.tableCell}>{notes}</td>*/}
        {COLUMNS.map(({ key, format }) => (
          <td key={key} className={styles.tableCell} style={{ textAlign: 'right' }}>
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
