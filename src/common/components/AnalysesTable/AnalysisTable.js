import cx from 'classnames'
import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'
import { Checkbox, Icon, Input, Label, Menu } from 'semantic-ui-react'

import AnalysesTableRow from './AnalysesTableRow'
import COLUMNS from './COLUMNS'
import tableStyles from './tableStyles'

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

  componentDidMount() {
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

  handleSearchChange = (e, { value }) => this.setState(() => ({ searchQuery: value }))

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
      // changed headers, sort ascending
      // same header, toggle direction
      const sortDirection =
        prevState.sortBy !== sortBy ? 'asc' : prevState.sortDirection === 'asc' ? 'desc' : null

      if (sortDirection === null) sortBy = null

      return { sortBy, sortDirection }
    })
  }

  toggleOnlyFavorites = () => {
    this.setState(prevState => ({ onlyFavorites: !prevState.onlyFavorites }))
  }

  clearSort = () => this.setState(() => ({ sortBy: null, sortDirection: null }))

  render() {
    const { onRowClick, selectedPropertyId, styles } = this.props
    const { analyses, onlyFavorites, searchQuery, sortBy, sortDirection } = this.state

    if (_.isEmpty(analyses)) return null

    const orderedAnalyses = _.flow(
      _.orderBy([sortBy], [sortDirection]),
      _.filter(analysis => {
        const regExp = new RegExp(_.escapeRegExp(searchQuery), 'gi')

        const isSearchHit = searchQuery ? _.some(val => regExp.test(val), analysis) : true
        const isFilterMatch = onlyFavorites ? analysis.favorite : true

        return isSearchHit && isFilterMatch
      }),
    )(analyses)

    return (
      <div>
        <Menu text style={{ display: 'inline-flex' }}>
          <Menu.Item>
            <Input
              icon="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
          </Menu.Item>
          <Menu.Item>
            <Checkbox
              label="Favorites only"
              onChange={this.toggleOnlyFavorites}
              checked={onlyFavorites}
            />
          </Menu.Item>
        </Menu>
        {sortBy && (
          <Label
            horizontal
            basic
            color="blue"
            content={_.find({ key: sortBy }, COLUMNS).label}
            detail={_.capitalize(sortDirection) + 'ending'}
            onRemove={this.clearSort}
            style={{ margin: '0 1em' }}
          />
        )}
        <div>
          <strong>{orderedAnalyses.length.toLocaleString()}</strong>&nbsp;results
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.headerCell}>{/* Location */}</th>
              {COLUMNS.map(({ key, label }) => (
                <th key={key} className={styles.headerCell} onClick={this.sortBy(key)}>
                  <Icon name={cx('sort', sortBy === key && sortDirection + 'ending')} />
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
