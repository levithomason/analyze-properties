import * as React from 'react'
import { Container } from 'semantic-ui-react'

import Suggest, { SuggestResult } from '../../common/components/Suggest/Suggest'
import AnalysisWorksheet from '../../common/components/AnalysisWorksheet'

import Header from '../../ui/components/Header'
import Logo from '../../common/components/Logo'
type CalculatorProps = {}

type CalculatorState = {
  propertyId?: string
}

class Calculator extends React.Component<CalculatorProps, CalculatorState> {
  state = {}

  handleSelectProperty = (e, result: SuggestResult) => {
    this.setState({ propertyId: result.propertyId })
  }

  render() {
    const { propertyId } = this.state

    return (
      <Container>
        <Header textAlign="center">
          <Logo size="large" />
          <br />
          Analyze Properties
        </Header>

        <br />

        <Suggest onSelect={this.handleSelectProperty} />
        <AnalysisWorksheet propertyId={propertyId} />
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </Container>
    )
  }
}

export default Calculator
