import * as React from 'react'
import { inject } from 'mobx-react'
import { AnalysesStore } from '../../stores/analysesStore'
import { Button, Modal, Menu, Icon, Tab } from 'semantic-ui-react'
import { div } from 'firebase-bolt/lib/ast'

export type ResearchProps = {
  analysesStore?: AnalysesStore
  propertyId: string
}

@inject('analysesStore')
class Research extends React.Component<ResearchProps> {
  state = {
    open: false,
    url: '',
  }

  handleClose = () => this.setState({ open: false })

  render() {
    const { open, url } = this.state
    const { analysesStore, propertyId } = this.props

    const analysis = analysesStore.getByPropertyId(propertyId)
    console.log(analysis)

    if (!analysis) return null

    const { city, state, zip } = analysis

    return (
      <div style={{ padding: '1em' }}>
        <Modal
          trigger={<Button compact icon="book" fluid content="Research" />}
          size="large"
          scrolling
          onClose={this.handleClose}
          closeIcon
          header={
            <div>
              <Menu
                secondary
                pointing
                items={[
                  {
                    key: 'worldpopulationreview',
                    content: `World Population Review`,
                    onClick: () => {
                      this.setState({
                        url: `http://worldpopulationreview.com/search/?query=${city}+${state}`,
                      })
                    },
                  },
                  {
                    key: 'bestplaces',
                    content: `Sperling's Best Places`,
                    onClick: () => {
                      this.setState({
                        url: `https://www.bestplaces.net/housing/zip-code/${state}/${city}/${zip}`,
                      })
                    },
                  },
                  {
                    key: 'zillow-rent',
                    content: (
                      <span>
                        <Icon name="money" size="small" /> Zillow Rent Comp{' '}
                        <Icon name="external" size="small" />
                      </span>
                    ),
                    onClick: () => {
                      this.setState({
                        url: `https://www.zillow.com/rental-manager/rent-comp-estimator/`,
                      })
                    },
                  },
                  {
                    key: 'rentometer',
                    href: `https://rentometer.com/`,
                    target: '_blank',
                    rel: 'nofollow noreferrer',
                    children: (
                      <span>
                        <Icon name="money" size="small" /> Rentometer{' '}
                        <Icon name="external" size="small" />
                      </span>
                    ),
                  },
                  {
                    key: 'zillow-values',
                    href: `https://www.zillow.com/${city}-${state}/home-values`,
                    target: '_blank',
                    rel: 'nofollow noreferrer',
                    children: (
                      <span>
                        <Icon name="chart line" size="small" /> Zillow Home Values{' '}
                        <Icon name="external" size="small" />
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          }
          content={<iframe src={url} frameBorder={0} style={{ width: '100%', height: '85vh' }} />}
        />
      </div>
    )
  }
}

export default Research
