import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { firebaseConnect } from 'react-redux-firebase'

import * as rei from '../../resources/rei'
import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'
import FavoriteButton from '../../components/FavoriteButton'

class AnalysesTableRow extends Component {
  render() {
    const { analysis = {}, styles } = this.props
    const { url, image, notes, address, city, state, zip } = analysis

    return (
      <tr>
        <td className={styles.tableCell}>
          <FavoriteButton icon propertyId={analysis.propertyId} />
        </td>
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
        <td className={styles.tableCell}>{notes}</td>
        {COLUMNS.map(({ key, format }) => {
          return (
            <td key={key} className={styles.tableCell} style={{ textAlign: 'right' }}>
              {format(analysis[key])}
            </td>
          )
        })}
      </tr>
    )
  }
}

export default _.flow(felaConnect(tableStyles))(AnalysesTableRow)
