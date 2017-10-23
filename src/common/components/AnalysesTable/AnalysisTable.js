import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import AnalysesTableRow from './AnalysesTableRow'
import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'

import Button from '../../../ui/components/Button/Button'

class AnalysesTable extends Component {
  static propTypes = {
    onRowClick: PropTypes.func,
    onInitialSort: PropTypes.func,
    selectedPropertyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    analyses: PropTypes.object,
  }

  state = {
    analyses: null,
    onlyFavorites: true,
    sortBy: null,
    sortDirection: null,
  }

  componentWillMount() {
    this.setState((prevState, props) => ({
      analyses: this.sortAnalysesByBestDeal(this.props.analyses),
    }))
  }

  componentWillReceiveProps(nextProps) {
    this.setState((prevState, props) => ({
      analyses: this.sortAnalysesByBestDeal(nextProps.analyses),
    }))
  }

  componentWillUpdate(nextProps, nextState) {
    if (!_.isEqual(this.props.analyses, nextProps.analyses)) {
      this.setState((prevState, props) => ({
        analyses: this.sortAnalysesByBestDeal(nextProps.analyses),
      }))
    }
  }

  sortAnalysesByBestDeal = analyses => {
    const isFirstSort = _.isEmpty(this.state.analyses) && !_.isEmpty(analyses)

    const sortedAnalyses = _.flow(
      _.orderBy(
        ..._.unzip([
          ['favorite', 'desc'],
          ['cashOnCash', 'desc'],
          ['cashNeeded', 'asc'],
          ['cashFlow', 'desc'],
          // ['capRate', 'desc'],
          // ['rentToValue', 'desc'],
          ['grossRentMultiplier', 'desc'],
          // ['debtServiceCoverageRatio', 'desc'],
        ]),
      ),
    )(analyses)

    if (isFirstSort) {
      _.invokeArgs('onInitialSort', [null, { ...this.props, analyses: sortedAnalyses }], this.props)
    }

    return sortedAnalyses
  }

  sortBy = sortBy => () => {
    this.setState((prevState, props) => {
      // changed headers, sort asc
      // same header, toggle direction
      const sortDirection =
        prevState.sortBy !== sortBy ? 'asc' : prevState.sortDirection === 'asc' ? 'desc' : null

      if (sortDirection === null) sortBy = null

      return { sortBy, sortDirection }
    })
  }

  toggleOnlyFavorites = () =>
    this.setState(prevState => ({ onlyFavorites: !prevState.onlyFavorites }))

  render() {
    const { onRowClick, selectedPropertyId, styles } = this.props
    const { analyses, onlyFavorites, sortBy, sortDirection } = this.state

    if (_.isEmpty(analyses)) return null

    const orderedAnalyses = _.orderBy(
      [sortBy],
      [sortDirection],
      onlyFavorites ? _.filter('favorite', analyses) : analyses,
    )

    return (
      <div>
        <div>
          <Button onClick={this.toggleOnlyFavorites}>
            Show {onlyFavorites ? 'all deals' : 'favorites'}
          </Button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.headerCell}>{/* Location */}</th>
              {COLUMNS.map(({ key, label }) => (
                <th key={key} className={styles.headerCell} onClick={this.sortBy(key)}>
                  {sortBy === key ? (
                    <i className={`fa fa-sort-${sortDirection === 'asc' ? 'asc' : 'desc'}`} />
                  ) : (
                    <i className="fa fa-sort" />
                  )}{' '}
                  {label}
                </th>
              ))}
              <th className={styles.headerCell}>{/* Favorite */}</th>
            </tr>
          </thead>
          <tbody>
            {orderedAnalyses.map(analysis => {
              const propertyId = _.get('propertyId', analysis)
              const active = selectedPropertyId && propertyId === selectedPropertyId

              return (
                <AnalysesTableRow
                  key={propertyId}
                  active={active}
                  propertyId={propertyId}
                  onClick={onRowClick}
                />
              )
            })}
          </tbody>
        </table>
      </div>
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
