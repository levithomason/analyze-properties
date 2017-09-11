import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import AnalysesTableRow from './AnalysesTableRow'
import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'

class Analyses extends Component {
  static defaultProps = {
    filter: _.identity,
  }
  // state = {
  //   analyses: {},
  //   sortBy: null,
  //   sortDirection: null,
  // }
  //
  // componentWillMount() {
  //   this.setState((prevState, props) => ({ analyses: _.values(props.analyses) }))
  // }
  //
  // componentWillUpdate(nextProps, nextState) {
  //   if (!_.isEqual(this.props.analyses, nextProps.analyses)) {
  //     this.setState((prevState, props) => ({ analyses: _.values(nextProps.analyses) }))
  //   }
  // }
  //
  // sortBy = sortBy => () => {
  //   this.setState((prevState, props) => {
  //     // changed headers, sort asc
  //     // same header, toggle direction
  //     const sortDirection = prevState.sortBy !== sortBy
  //       ? 'asc'
  //       : prevState.sortDirection === 'asc' ? 'desc' : 'asc'
  //
  //     const analyses = _.orderBy([sortBy], [sortDirection], prevState.analyses)
  //
  //     return { analyses, sortBy, sortDirection }
  //   })
  // }

  render() {
    const { analyses, filter, styles } = this.props
    const filteredAnalyses = _.flow(
      _.filter(filter),
      _.orderBy(
        ..._.unzip([
          ['cashFlow', 'desc'],
          ['cashNeeded', 'asc'],
          ['cashOnCash', 'desc'],
          ['capRate', 'desc'],
          ['rentToValue', 'desc'],
          ['grossRentMultiplier', 'desc'],
          ['debtServiceCoverageRatio', 'desc'],
        ]),
      ),
    )(analyses)

    return (
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.headerCell}>{/* Favorite */}</th>
            <th className={styles.headerCell}>Location</th>
            <th className={styles.headerCell}>Notes</th>
            {COLUMNS.map(({ key, label }) => (
              <th key={key} className={styles.headerCell}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredAnalyses.map(analysis => {
            const { propertyId } = analysis

            return <AnalysesTableRow key={propertyId} analysis={analysis} />
          })}
        </tbody>
      </table>
    )
  }
}

export default _.flow(
  felaConnect(tableStyles),
  firebaseConnect(['/analyses']),
  reduxConnect(({ firebase: { data: { analyses } } }) => ({
    analyses,
  })),
)(Analyses)
