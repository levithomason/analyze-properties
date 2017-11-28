import _ from 'lodash/fp'
import { action, computed, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Button, Form, Grid, Icon, Label } from 'semantic-ui-react'

// import FirebaseListAdapter from '../../common/resources/FirebaseListAdapter'
import { makeDebugger } from '../../common/lib'
import { firebase } from '../../common/modules/firebase'

import Slider from '../../ui/components/Slider'

const debug = makeDebugger('FirebaseMapAdapter')

class FirebaseMapAdapter {
  @observable isSyncingFromServer = false
  @observable isSyncingToServer = false
  @observable map = new Map()

  _lastChangeFromServer = { type: null, key: null, value: null }
  _localObserver = null
  _ref = null

  constructor(firebase, path) {
    this._ref = firebase.database().ref(path)
  }

  save = () => {
    if (this.isSyncingToServer) return

    return this._ref.set(this.map.toJS()).catch(err => {
      console.error('Failed to save:', err)
    })
  }

  fetch = () => {
    if (this.isSyncingFromServer) return

    return this._ref
      .once('value')
      .then(snapshot => {
        runInAction(() => {
          this.map.replace(snapshot.toJSON())
        })
      })
      .catch(err => {
        console.error('Failed to fetch:', err)
      })
  }

  startSyncingFromServer = () => {
    if (this.isSyncingFromServer) return
    debug('startSyncingFromServer')

    return this.fetch()
      .then(() => {
        runInAction(() => {
          this._ref.on('child_added', this._handleServerChildAdded)
          this._ref.on('child_removed', this._handleServerChildRemoved)
          this._ref.on('child_changed', this._handleServerChildChanged)

          this.isSyncingFromServer = true
        })
      })
      .catch(err => {
        throw new Error('Failed to start syncing from server: ' + err)
      })
  }

  stopSyncingFromServer = () => {
    if (!this.isSyncingFromServer) return
    debug('stopSyncingFromServer')
    this._ref.off('child_added', this._handleServerChildAdded)
    this._ref.off('child_removed', this._handleServerChildRemoved)
    this._ref.off('child_changed', this._handleServerChildChanged)
    runInAction(() => {
      this.isSyncingFromServer = false
    })
  }

  startSyncingToServer = () => {
    if (this.isSyncingToServer) return
    debug('startSyncingToServer')

    return this.save()
      .then(() => {
        this._localObserver = this.map.observe(_.debounce(300, this._handleLocalChange))
        runInAction(() => {
          this.isSyncingToServer = true
        })
      })
      .catch(err => {
        throw new Error('Failed to start syncing to server: ' + err)
      })
  }

  stopSyncingToServer = () => {
    if (!this.isSyncingToServer) return
    debug('stopSyncingToServer')
    this._localObserver()
    runInAction(() => {
      this.isSyncingToServer = false
    })
  }

  _handleLocalChange = change => {
    const { name, newValue = null, oldValue, type } = change

    // don't reciprocate received changes back to the server
    if (_.isMatch(this._lastChangeFromServer, change)) return

    debug('_handleLocalChange', change)

    switch (type) {
      case 'add':
        this._ref
          .child(name)
          .set(newValue)
          .catch(err => {
            console.error(err)
            runInAction('rollback local add', () => {
              this.map.set(name, oldValue)
            })
          })
        break

      case 'update':
        this._ref
          .child(name)
          .set(newValue)
          .catch(err => {
            console.error(err)
            runInAction('rollback local update', () => {
              this.map.set(name, oldValue)
            })
          })
        break

      case 'delete':
        this._ref
          .child(name)
          .remove()
          .catch(err => {
            console.error(err)
            runInAction('rollback local delete', () => {
              this.map.set(name, oldValue)
            })
          })
        break

      default:
        throw new Error(`Unhandled local map change.type "${change.type}"`)
    }
  }

  _handleServerChildAdded = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    if (_.isEqual(this.map.get(key), json)) return

    debug('_handleServerChildAdded', key, json)

    this._lastChangeFromServer = { type: 'add', name: key, newValue: json }
    runInAction(() => {
      this.map.set(key, json)
    })
  }

  _handleServerChildChanged = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    if (_.isEqual(this.map.get(key), json)) return

    debug('_handleServerChildChanged', key, json)

    this._lastChangeFromServer = { type: 'update', name: key, newValue: json }
    runInAction(() => {
      this.map.set(key, json)
    })
  }

  _handleServerChildRemoved = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    if (!this.map.has(key)) return

    debug('_handleServerChildRemoved', key, json)

    this._lastChangeFromServer = { type: 'delete', name: key }
    runInAction(() => {
      this.map.delete(key)
    })
  }
}

const path = 'validRoles'
const store = new FirebaseMapAdapter(firebase, path)

@observer
class ValidRoles extends Component {
  state = {}

  componentDidMount() {
    this._ref = firebase.database().ref(path)

    this._ref.on('value', this.handleDataBaseChange)
  }

  componentWillUnmount() {
    this._ref.off('value', this.handleDataBaseChange)
    store.stopSyncingFromServer()
    store.stopSyncingToServer()
  }

  handleDataBaseChange = snapshot => {
    const database = snapshot.toJSON()
    this.setState(() => ({ database }))
  }

  render() {
    const { database } = this.state

    const storeKeys = store.map.keys()
    const booleanKeys = storeKeys.filter(x => _.isBoolean(store.map.get(x)))
    const stringKeys = storeKeys.filter(x => _.isString(store.map.get(x)))

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
                const json = prompt('Replace the map', JSON.stringify(store.map.toJS()))
                const newMap = JSON.parse(json)
                if (newMap) store.map.replace(newMap)
              }}
            />
            Store
          </h2>
          <pre style={preStyle}>{JSON.stringify(store.map.toJS(), null, 2)}</pre>
        </Grid.Column>
        <Grid.Column>
          <h2>Store Form</h2>
          <Form>
            <Form.Group>
              <Form.Field>
                <Button.Group>
                  <Button
                    icon="lightning"
                    content="From Server"
                    active={store.isSyncingFromServer}
                    onClick={() => {
                      if (store.isSyncingFromServer) store.stopSyncingFromServer()
                      else store.startSyncingFromServer()
                    }}
                    toggle
                  />
                  <Button
                    icon="lightning"
                    content="To Server"
                    active={store.isSyncingToServer}
                    onClick={() => {
                      if (store.isSyncingToServer) store.stopSyncingToServer()
                      else store.startSyncingToServer()
                    }}
                    toggle
                  />
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <Button.Group>
                  <Button icon="cloud download" content="Fetch" onClick={store.fetch} />
                  <Button icon="cloud upload" content="Save" onClick={store.save} />
                </Button.Group>
              </Form.Field>
            </Form.Group>
            <Form.Group>
              {_.map(
                key => (
                  <Form.Checkbox
                    key={key}
                    label={key}
                    checked={!!store.map.get(key)}
                    onChange={action((e, data) => store.map.set(key, data.checked))}
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
                    color={store.map.get(key) ? 'green' : null}
                    onClick={action(e => {
                      e.stopPropagation()
                      store.map.set(key, !store.map.get(key))
                    })}
                    onRemove={action(e => {
                      e.stopPropagation()
                      store.map.delete(key)
                    })}
                  />
                ),
                booleanKeys,
              )}
            </Form.Field>
            {!_.isEmpty(booleanKeys) && (
              <Form.Dropdown
                value={booleanKeys.filter(x => store.map.get(x))}
                onChange={action((e, data) => {
                  booleanKeys.forEach(key => {
                    store.map.set(key, _.includes(key, data.value))
                  })
                })}
                onAddItem={action((e, data) => {
                  store.map.set(data.value, true)
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
                  value={String(store.map.get(key))}
                  onChange={action(e => {
                    store.map.set(key, e.target.value)
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
            value={store.map.get('percent') || 0}
            min={0}
            max={1}
            step={0.00005}
            onChange={action(e => {
              store.map.set('percent', +e.target.value)
            })}
          />
          <Slider
            unit="usd"
            label="Dollars"
            value={store.map.get('dollars') || 0}
            min={0}
            max={999999}
            step={1}
            onChange={action(e => {
              store.map.set('dollars', +e.target.value)
            })}
          />
        </Grid.Column>
      </Grid>
    )
  }
}

export default ValidRoles
