import { inject, observer } from 'mobx-react'
import * as React from 'react'

import Button from '../../ui/components/Button'
import { AnalysesStore } from '../stores/analysesStore'

interface IFavoriteButtonProps {
  analysesStore: AnalysesStore
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
  }

  render() {
    if (!this.analysis) return null

    const { analysesStore, icon, propertyId, ...rest } = this.props

    const iconClass = this.analysis.favorite ? 'fa-heart' : 'fa-heart-o'

    return (
      <Button basic={icon} icon onClick={this.handleClick} {...rest}>
        <i className={`fa ${iconClass}`} />
        {!icon && 'Favorite'}
      </Button>
    )
  }
}

export default FavoriteButton
