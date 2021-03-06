import keyboardKey from 'keyboard-key'
import _ from 'lodash/fp'
import * as React from 'react'
import { Input, List } from 'semantic-ui-react'

import * as rei from '../../../common/resources/rei'

export type SuggestResult = {
  address: string
  propertyId: string
}

export type SuggestProps = {
  onSelect?: (e: React.SyntheticEvent, result: SuggestResult) => void
}

type SuggestState = {
  results: SuggestResult[]
  selectedIndex: number
  searchQuery: string
}

class Suggest extends React.Component<SuggestProps, SuggestState> {
  state = {
    results: [],
    selectedIndex: 0,
    searchQuery: '',
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick)
  }

  componentDidUpdate(prevProps, prevState) {
    const hadResults = !_.isEmpty(prevState.results)
    const hasResults = !_.isEmpty(this.state.results)

    const receivedResults = !hadResults && hasResults
    const removedResults = hadResults && !hasResults
    const removedSearchQuery = !this.state.searchQuery && prevState.searchQuery

    if (receivedResults) {
      document.addEventListener('keydown', this.handleDocumentKeyDown)
    } else if (removedResults) {
      document.removeEventListener('keydown', this.handleDocumentKeyDown)
    }

    if (removedSearchQuery) {
      this.setState(() => ({ results: [] }))
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick)
    document.removeEventListener('keydown', this.handleDocumentKeyDown)
  }

  close = () => {
    this.setState(() => ({ selectedIndex: 0, results: [] }))
  }

  getSuggestions = _.debounce(250, value => {
    if (!value) {
      this.setState(() => ({ results: null }))
      return
    }

    rei.suggest(value).then(results => {
      this.setState(() => ({ results }))
    })
  })

  getResultByAddress = address => _.find({ address }, this.state.results)
  getSelectedResult = () => this.state.results[this.state.selectedIndex]

  moveSelectionBy = (e, amount) => {
    e.preventDefault()

    this.setState(prevState => {
      const { selectedIndex, results } = prevState
      return {
        selectedIndex: Math.max(0, Math.min(selectedIndex + amount, results.length - 1)),
      }
    })
  }

  handleDocumentClick = e => {
    if (this.ref.contains(e.target)) return

    this.close()
  }

  handleDocumentKeyDown = e => {
    console.debug('Suggest.handleDocumentKeyDown()')
    const key = keyboardKey.getKey(e)

    switch (key) {
      case 'ArrowDown':
        this.moveSelectionBy(e, 1)
        break

      case 'ArrowUp':
        this.moveSelectionBy(e, -1)
        break

      case 'Enter':
        e.stopPropagation()
        e.preventDefault()
        this.select(e, this.getSelectedResult())
        break

      case 'Escape':
        e.stopPropagation()
        e.preventDefault()
        this.close()
        break

      default:
        break
    }
  }

  handleItemClick = (e, item) => {
    const result = this.getResultByAddress(item.content)

    this.select(e, result)
  }

  handleRef = c => (this.ref = c)

  handleSearchChange = e => {
    const { value } = e.target
    this.setState(() => ({ searchQuery: value, selectedIndex: 0 }))
    this.getSuggestions(value)
  }

  select = (e, result: SuggestResult) => {
    const { onSelect } = this.props

    this.setState({ searchQuery: result.address })

    this.close()

    if (onSelect) onSelect(e, result)
  }

  clearQuery = () => {
    this.setState({ searchQuery: '' })
  }

  render() {
    const { selectedIndex, searchQuery, results } = this.state
    const hasResults = !_.isEmpty(results)
    const items = hasResults
      ? results.map((result, i) => ({
          key: result.address,
          // icon: 'home',
          active: selectedIndex === i,
          content: result.address,
        }))
      : []

    return (
      <div style={{ position: 'relative' }} ref={this.handleRef}>
        <Input
          fluid
          size="large"
          value={searchQuery}
          onChange={this.handleSearchChange}
          placeholder="Address"
        />
        {hasResults && (
          <List
            link
            selection
            size="large"
            relaxed="very"
            onItemClick={this.handleItemClick}
            items={items}
            style={{
              position: 'absolute',
              padding: '0.5em',
              margin: '0.2rem 0 0 0',
              left: 0,
              right: 0,
              top: '100%',
              background: '#fff',
              boxShadow: '0 0.1em 0.5em rgba(0, 0, 0, 0.2)',
              zIndex: '100',
            }}
          />
        )}
      </div>
    )
  }
}

export default Suggest
