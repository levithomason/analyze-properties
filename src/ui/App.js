import React, { Component } from 'react'

import './styles/ui.scss'

import Box from './components/Box'
import Button from './components/Button'
import Code from './components/Code'
import Container from './components/Container'
import Divider from './components/Divider'
import Form from './components/Form'
import Grid from './components/Grid'
import Header from './components/Header'
import Input from './components/Input'
import Loader from './components/Loader'
import Menu from './components/Menu'
import Message from './components/Message'
import Slider from './components/Slider'
import Stat from './components/Stat'
import Tabs from './components/Tabs'

import theme from './styles/theme'

const DocHeader = ({ children }) => (
  <h1>
    <a
      href={`#${children}`}
      style={{ color: '#000', opacity: 0.4, fontWeight: 100, textDecoration: 'none' }}
    >
      {children}
    </a>
  </h1>
)

const DocSubheader = ({ children }) => (
  <h2>
    <a
      href={`#${children}`}
      style={{ color: '#000', opacity: 0.3, fontWeight: 100, textDecoration: 'none' }}
    >
      {children}
    </a>
  </h2>
)

const renderBorders = (Component, props) => (
  <div>
    <DocSubheader>borders {props && JSON.stringify(props, null, 2)}</DocSubheader>
    {Object.keys(theme.borders).map(border => (
      <Component key={border} {...props} border={border}>
        {border}
      </Component>
    ))}
  </div>
)

const renderColors = (Component, props) => (
  <div>
    <DocSubheader>colors {props && JSON.stringify(props, null, 2)}</DocSubheader>
    {Object.keys(theme.colors).map(c => (
      <Component key={c} {...props} color={c}>
        {c}
      </Component>
    ))}
  </div>
)

const renderInverted = (Component, props) => (
  <div>
    <DocSubheader>inverted {props && JSON.stringify(props, null, 2)}</DocSubheader>
    <Component {...props} inverted>
      no color
    </Component>
    {Object.keys(theme.colors).map(c => (
      <Component key={c} {...props} inverted color={c}>
        {c}
      </Component>
    ))}
  </div>
)

const renderRadii = (Component, props) => (
  <div>
    <DocSubheader>radius {props && JSON.stringify(props, null, 2)}</DocSubheader>
    {Object.keys(theme.radii).map(radius => (
      <Component key={radius} {...props} radius={radius} inverted>
        {radius}
      </Component>
    ))}
  </div>
)

const renderShadows = (Component, props) => (
  <div>
    <DocSubheader>shadows {props && JSON.stringify(props, null, 2)}</DocSubheader>
    {Object.keys(theme.shadows).map(shadow => (
      <Component key={shadow} {...props} shadow={shadow}>
        {shadow}
      </Component>
    ))}
  </div>
)

class App extends Component {
  state = {
    activeTab: 'Tab 2',
    activeItem: 'Item 2',
  }

  handleTabChange = (e, { activeTab }) => {
    this.setState((prevState, props) => ({ activeTab }))
  }

  handleMenuItemClick = (e, { activeItem }) => {
    this.setState((prevState, props) => ({ activeItem }))
  }

  render() {
    const { activeItem, activeTab } = this.state

    return (
      <Container>
        <DocHeader>Box</DocHeader>
        {renderColors(Box)}
        {renderInverted(Box)}
        {renderShadows(Box)}
        {renderBorders(Box)}
        {renderRadii(Box)}
        {renderRadii(Box, { circular: true })}

        <DocHeader>Button</DocHeader>
        <Button>Default</Button>
        <Button fluid>Fluid</Button>

        <DocHeader>Code</DocHeader>
        <Code>const greet = name => console.debug(`Hi ${name}!`)</Code>

        <DocHeader>Divider</DocHeader>
        <Divider />

        <DocHeader>Form</DocHeader>
        <Form>
          <Form.Field label="Username">
            <Input placeholder="Username" />
          </Form.Field>
          <Form.Field label="Password">
            <Input placeholder="Password" />
          </Form.Field>
        </Form>

        <DocHeader>Grid</DocHeader>
        <Grid />

        <DocHeader>Header</DocHeader>
        <Header>A default header</Header>
        <Header as="h1">An h1 header</Header>
        <Header as="h2">An h2 header</Header>
        <Header as="h3">An h3 header</Header>
        <Header as="h4">An h4 header</Header>
        <Header as="h5">An h5 header</Header>
        <Header as="h6">An h6 header</Header>

        <h2>Colors</h2>
        {renderColors(Header)}

        <DocHeader>Input</DocHeader>
        <Input />

        <DocHeader>Loader</DocHeader>
        <Loader />

        <DocHeader>Menu</DocHeader>
        <Menu
          onItemClick={this.handleMenuItemClick}
          activeItem={activeItem}
          items={['Item 1', 'Item 2', 'Item 3']}
        />

        <DocHeader>Message</DocHeader>
        <Message>A default message </Message>
        <Message status="info">An info message</Message>
        <Message status="success">A success message</Message>
        <Message status="warning">A warning message</Message>
        <Message status="error">An error message</Message>

        <DocHeader>Slider</DocHeader>
        <Slider />

        <DocHeader>Stat</DocHeader>
        <Stat />

        <DocHeader>Tabs</DocHeader>
        <Tabs
          onTabChange={this.handleTabChange}
          activeTab={activeTab}
          panes={[
            { menuItem: 'Tab 1', render: () => 'Tab 1 Content' },
            { menuItem: 'Tab 2', render: () => 'Tab 2 Content' },
            { menuItem: 'Tab 3', render: () => 'Tab 3 Content' },
            { menuItem: 'Tab 4', render: () => 'Tab 4 Content' },
            { menuItem: 'Tab 5', render: () => 'Tab 5 Content' },
          ]}
        />
      </Container>
    )
  }
}

export default App
