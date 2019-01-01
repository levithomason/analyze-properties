import { inject, observer } from 'mobx-react'
import * as React from 'react'

import Button from '../../ui/components/Button'
import { AnalysesStore } from '../stores/analysesStore'

interface IFavoriteButtonProps {
  analysesStore?: AnalysesStore
  propertyId: string
  icon?: boolean
}

@inject('analysesStore')
@observer
class FavoriteButton extends React.Component<IFavoriteButtonProps> {
  get analysis() {
    const { analysesStore, propertyId } = this.props

    return analysesStore.getByPropertyId(propertyId)
  }

  handleClick = () => {
    this.analysis.favorite = !this.analysis.favorite
    this.analysis.pushOnce()
  }

  render() {
    const { icon } = this.props

    const iconClass = this.analysis && this.analysis.favorite ? 'fa-heart' : 'fa-heart-o'

    return (
      <Button basic={icon} color="red" icon onClick={this.handleClick} disabled={!this.analysis}>
        <i className={`fa ${iconClass}`} />
        {!icon && 'Favorite'}
      </Button>
    )
  }
}

export default FavoriteButton
