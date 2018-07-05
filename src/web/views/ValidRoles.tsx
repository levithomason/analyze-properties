import _ from 'lodash/fp'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Button, Form, Grid, Icon, Label } from 'semantic-ui-react'

import FirebaseMapAdapter from '../../common/transport/FirebaseMapAdapter'
import { makeDebugger } from '../../common/lib'
import { firebase } from '../../common/modules/firebase'

const debug = makeDebugger('views:validRoles')
const path = 'validRoles'
const store = new FirebaseMapAdapter(path)

@observer
class ValidRoles extends React.Component {
  state = {}

  componentDidMount() {
    this._ref = firebase.database().ref(path)

    this._ref.on('value', this.handleDataBaseChange)
    store.pullOnce()
  }

  componentWillUnmount() {
    this._ref.off('value', this.handleDataBaseChange)
    store.stopPulling()
    store.stopPushing()
  }

  handleDataBaseChange = snapshot => {
    const database = snapshot.toJSON()
    this.setState({ database })
  }

  handlePullingClick = () => {
    store.isPulling ? store.stopPulling() : store.startPulling()
  }

  handlePushingClick = () => {
    store.isPushing ? store.stopPushing() : store.startPushing()
  }

  render() {
    const { database } = this.state

    const storeKeys = Array.from(store._map.keys())
    const booleanKeys = storeKeys.filter(x => typeof store._map.get(x) === 'boolean')
    const stringKeys = storeKeys.filter(x => typeof store._map.get(x) === 'string')

    const preStyle = {
      overflowX: 'hidden',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      fontSize: '0.875em',
      maxHeight: '20em',
      background: 'whitesmoke',
    }

    return (
      <Grid padded columns="equal">
        <Grid.Column>
          <h2>
            <Icon
              link
              color="blue"
              name="pencil"
              onClick={() => {
                const json = prompt('Update the database', JSON.stringify(database))
                const newDB = JSON.parse(json)
                if (newDB) this._ref.set(newDB)
              }}
            />
            Firebase
          </h2>
          <pre style={preStyle}>{JSON.stringify(database, null, 2)}</pre>
          <h2>
            <Icon
              link
              color="blue"
              name="pencil"
              onClick={() => {
                const json = prompt('Replace the map', JSON.stringify(store.asJS))
                const newMap = JSON.parse(json)
                if (newMap) store._map.replace(newMap)
              }}
            />
            Store
          </h2>
          <pre style={preStyle}>{JSON.stringify(store.asJS, null, 2)}</pre>
        </Grid.Column>
        <Grid.Column>
          <h2>Store Form</h2>
          <Form>
            <Form.Group>
              <Form.Field>
                <Button.Group>
                  <Button
                    toggle
                    icon="lightning"
                    content="Start Pulling"
                    active={store.isPulling}
                    onClick={this.handlePullingClick}
                  />
                  <Button
                    toggle
                    icon="lightning"
                    content="Start Pushing"
                    active={store.isPushing}
                    onClick={this.handlePushingClick}
                  />
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <Button.Group>
                  <Button icon="cloud download" content="Pull Once" onClick={store.pullOnce} />
                  <Button icon="cloud upload" content="Push Once" onClick={store.pushOnce} />
                </Button.Group>
              </Form.Field>
            </Form.Group>
            <Form.Group>
              {_.map(
                key => (
                  <Form.Checkbox
                    key={key}
                    label={key}
                    checked={!!store._map.get(key)}
                    onChange={action((e, data) => store._map.set(key, data.checked))}
                  />
                ),
                booleanKeys,
              )}
            </Form.Group>
            <Form.Field>
              {_.map(
                key => (
                  <Label
                    key={key}
                    as="a"
                    content={key}
                    color={store._map.get(key) ? 'green' : null}
                    onClick={action(e => {
                      e.stopPropagation()
                      store._map.set(key, !store._map.get(key))
                    })}
                    onRemove={action(e => {
                      e.stopPropagation()
                      store._map.delete(key)
                    })}
                  />
                ),
                booleanKeys,
              )}
            </Form.Field>
            {!_.isEmpty(booleanKeys) && (
              <Form.Dropdown
                value={booleanKeys.filter(x => store._map.get(x))}
                onChange={action((e, data) => {
                  booleanKeys.forEach(key => {
                    store._map.set(key, _.includes(key, data.value))
                  })
                })}
                onAddItem={action((e, data) => {
                  store._map.set(data.value, true)
                })}
                options={booleanKeys.map(key => ({ key, text: key, value: key }))}
                search
                selection
                multiple
                allowAdditions
              />
            )}
            {_.map(
              key => (
                <Form.TextArea
                  label={key}
                  key={key}
                  rows={1}
                  style={{ maxHeight: '8em' }}
                  value={String(store._map.get(key))}
                  onChange={action(e => {
                    store._map.set(key, e.target.value)
                  })}
                  autoHeight
                />
              ),
              stringKeys,
            )}
          </Form>
        </Grid.Column>
      </Grid>
    )
  }
}

export default ValidRoles
