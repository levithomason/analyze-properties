import _ from 'lodash/fp'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Button, Form, Grid, Icon, Label } from 'semantic-ui-react'

import FirebaseMapAdapter from '../../common/transport/FirebaseMapAdapter'
import { makeDebugger } from '../../common/lib'
import { firebase } from '../../common/modules/firebase'

import Slider from '../../ui/components/Slider'

const debug = makeDebugger('views:validRoles')
const path = 'validRoles'
const store = new FirebaseMapAdapter(path)

@observer
class ValidRoles extends Component {
  state = {}

  componentDidMount() {
    this._ref = firebase.database().ref(path)

    this._ref.on('value', this.handleDataBaseChange)
  }

  componentWillUnmount() {
    this._ref.off('value', this.handleDataBaseChange)
    store.stopPulling()
    store.stopPushing()
  }

  handleDataBaseChange = snapshot => {
    const database = snapshot.toJSON()
    this.setState(() => ({ database }))
  }

  render() {
    const { database } = this.state

    const storeKeys = store._map.keys()
    const booleanKeys = storeKeys.filter(x => _.isBoolean(store._map.get(x)))
    const stringKeys = storeKeys.filter(x => _.isString(store._map.get(x)))

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
                const json = prompt('Replace the map', JSON.stringify(store._map.toJS()))
                const newMap = JSON.parse(json)
                if (newMap) store._map.replace(newMap)
              }}
            />
            Store
          </h2>
          <pre style={preStyle}>{JSON.stringify(store._map.toJS(), null, 2)}</pre>
        </Grid.Column>
        <Grid.Column>
          <h2>Store Form</h2>
          <Form>
            <Form.Group>
              <Form.Field>
                <Button.Group>
                  <Button
                    icon="lightning"
                    content="Pulling Changes"
                    active={store.isPulling}
                    onClick={() => {
                      if (store.isPulling) store.stopPulling()
                      else store.startPulling()
                    }}
                    toggle
                  />
                  <Button
                    icon="lightning"
                    content="Pushing Changes"
                    active={store.isPushing}
                    onClick={() => {
                      if (store.isPushing) store.stopPushing()
                      else store.startPushing()
                    }}
                    toggle
                  />
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <Button.Group>
                  <Button icon="cloud download" content="Pull" onClick={store.pullOnce} />
                  <Button icon="cloud upload" content="Push" onClick={store.pushOnce} />
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
          <Slider
            unit="percent"
            label="Percent"
            value={store._map.get('percent') || 0}
            min={0}
            max={1}
            step={0.00005}
            onChange={action(e => {
              store._map.set('percent', +e.target.value)
            })}
          />
          <Slider
            unit="usd"
            label="Dollars"
            value={store._map.get('dollars') || 0}
            min={0}
            max={999999}
            step={1}
            onChange={action(e => {
              store._map.set('dollars', +e.target.value)
            })}
          />
        </Grid.Column>
      </Grid>
    )
  }
}

export default ValidRoles
