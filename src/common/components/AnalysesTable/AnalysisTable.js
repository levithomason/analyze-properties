import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import AnalysesTableRow from './AnalysesTableRow'
import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'

class AnalysesTable extends Component {
  static propTypes = {
    onRowClick: PropTypes.func,
    onInitialSort: PropTypes.func,
    selectedPropertyId: PropTypes.string,
  }

  state = {
    analyses: null,
    sortBy: null,
    sortDirection: null,
  }

  componentWillMount() {
    this.setState((prevState, props) => ({ analyses: _.values(props.analyses) }))
  }

  componentWillReceiveProps(nextProps) {
    this.sortByDefault(nextProps)
  }

  componentWillUpdate(nextProps, nextState) {
    if (!_.isEqual(this.props.analyses, nextProps.analyses)) {
      this.setState((prevState, props) => ({ analyses: _.values(nextProps.analyses) }))
    }
  }

  sortByDefault = props => {
    const analyses = _.flow(
      _.orderBy(
        ..._.unzip([
          ['favorite', 'desc'],
          ['cashFlow', 'desc'],
          ['cashNeeded', 'asc'],
          ['cashOnCash', 'desc'],
          ['capRate', 'desc'],
          ['rentToValue', 'desc'],
          ['grossRentMultiplier', 'desc'],
          ['debtServiceCoverageRatio', 'desc'],
        ]),
      ),
    )(props.analyses)

    this.setState(
      () => ({ analyses }),
      () => _.invokeArgs('onInitialSort', [null, { ...props, analyses }], this.props),
    )
  }

  sortBy = sortBy => () => {
    this.setState((prevState, props) => {
      // changed headers, sort asc
      // same header, toggle direction
      const sortDirection =
        prevState.sortBy !== sortBy ? 'asc' : prevState.sortDirection === 'asc' ? 'desc' : 'asc'

      const analyses = _.orderBy([sortBy], [sortDirection], prevState.analyses)

      return { analyses, sortBy, sortDirection }
    })
  }

  render() {
    const { onRowClick, selectedPropertyId, styles } = this.props
    const { analyses } = this.state

    if (_.isEmpty(analyses)) return null

    return (
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.headerCell}>Location</th>
            {COLUMNS.map(({ key, label }) => (
              <th key={key} className={styles.headerCell}>
                {label}
              </th>
            ))}
            <th className={styles.headerCell}>{/* Favorite */}</th>
          </tr>
        </thead>
        <tbody>
          {analyses.slice(0).map(analysis => {
            const propertyId = _.get('propertyId', analysis)
            const active = selectedPropertyId && propertyId === selectedPropertyId

            return (
              <AnalysesTableRow
                key={propertyId}
                active={active}
                analysis={analysis}
                onClick={onRowClick}
              />
            )
          })}
        </tbody>
      </table>
    )
  }
}

export default _.flow(
  felaConnect(tableStyles),
  firebaseConnect(['/analyses']),
  reduxConnect(({ firebase: { auth, data: { analyses } } }) => ({
    analyses: _.get(auth.uid, analyses),
  })),
)(AnalysesTable)
