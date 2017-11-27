import _ from 'lodash/fp'
import { action, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Form, Grid, Icon, Label } from 'semantic-ui-react'

// import FirebaseListAdapter from '../../common/resources/FirebaseListAdapter'
import { makeDebugger } from '../../common/lib'
import { firebase } from '../../common/modules/firebase'

const db = firebase.database()

import Slider from '../../ui/components/Slider'

const debug = makeDebugger('stores:validRoles')

class FirebaseMapAdapter {
  @observable isSyncingFromServer = false
  @observable isSyncingToServer = false

  constructor(path, opts) {
    this._map = observable(new Map())
    this._ref = db.ref(path)
    this._lastChangeFromServer = { type: null, key: null, value: null }
    this._opts = opts
  }

  @action
  resolveRelations = () => {
    _.forEach(relation => {
      debug('resolve relation', relation)
      db
        .ref(relation.usingKeys)
        .once('value')
        .then(snapshot => {
          const usingJSON = snapshot.toJSON()
          debug('relation using', usingJSON)

          const keys = Object.keys(usingJSON)
          debug('relation using keys', keys)

          const promises = keys.map(usingKey => {
            return db
              .ref(relation.from)
              .child(usingKey)
              .child(this._ref.key)
              .once('value')
              .then(snapshot => ({ [usingKey]: snapshot.toJSON() }))
          })

          return Promise.all(promises)
        })
        .then(relations => {
          const result = Object.assign({}, ...relations)

          debug('relations results', result)

          runInAction(() => {
            this._map.set(relation.to, result)
          })
        })
    }, this._opts.relations)
  }

  @action
  startSyncingFromServer = () => {
    if (this.isSyncingFromServer) return
    debug('startSyncingFromServer')
    this.isSyncingFromServer = true

    return this._ref
      .once('value')
      .then(snapshot => {
        runInAction(() => {
          this._map.replace(snapshot.toJSON())
        })
        return this.resolveRelations()
      })
      .then(() => {
        this._ref.on('child_added', this._handleServerChildAdded)
        this._ref.on('child_removed', this._handleServerChildRemoved)
        this._ref.on('child_changed', this._handleServerChildChanged)
      })
      .catch(err => {
        throw new Error('Failed to start syncing from server: ' + err)
      })
  }

  @action
  stopSyncingFromServer = () => {
    if (!this.isSyncingFromServer) return
    debug('stopSyncingFromServer')
    this.isSyncingFromServer = false
    this._ref.off('child_added', this._handleServerChildAdded)
    this._ref.off('child_removed', this._handleServerChildRemoved)
    this._ref.off('child_changed', this._handleServerChildChanged)
  }

  @action
  startSyncingToServer = () => {
    if (this.isSyncingToServer) return
    debug('startSyncingToServer')
    this.isSyncingToServer = true
    this._ref.set(this._map.toJS()).catch(err => {
      throw new Error('Failed to start syncing to server: ' + err)
    })
    this._localObserver = this._map.observe(_.debounce(200, this._handleLocalChange))
  }

  @action
  stopSyncingToServer = () => {
    if (!this.isSyncingToServer) return
    debug('stopSyncingToServer')
    this.isSyncingToServer = false
    this._localObserver()
  }

  @action
  _handleLocalChange = change => {
    const { name, newValue = null, oldValue, type } = change

    // don't reciprocate received changes back to the server
    if (_.isMatch(this._lastChangeFromServer, change)) return

    debug('_handleLocalChange', change)

    const ref = this._ref.child(name)

    switch (type) {
      case 'add':
        ref.set(newValue).catch(err => {
          console.error(err)
          runInAction('rollback local add', () => {
            this._map.set(name, oldValue)
          })
        })
        break

      case 'update':
        ref.set(newValue).catch(err => {
          console.error(err)
          runInAction('rollback local update', () => {
            this._map.set(name, oldValue)
          })
        })
        break

      case 'delete':
        ref.remove()
        break

      default:
        throw new Error(`Unhandled local map change.type "${change.type}"`)
    }
  }

  @action
  _handleServerChildAdded = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    if (_.isEqual(this._map.get(key), json)) return

    debug('_handleServerChildAdded', key, json)

    this._lastChangeFromServer = { type: 'add', name: key, newValue: json }
    this._map.set(key, json)
  }

  @action
  _handleServerChildChanged = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    if (_.isEqual(this._map.get(key), json)) return

    debug('_handleServerChildChanged', key, json)

    this._lastChangeFromServer = { type: 'update', name: key, newValue: json }
    this._map.set(key, json)
  }

  @action
  _handleServerChildRemoved = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    if (!this._map.has(key)) return

    debug('_handleServerChildRemoved', key, json)

    this._lastChangeFromServer = { type: 'delete', name: key }
    this._map.delete(key)
  }
}

const path = 'stage/users/1ipKfRwn37P2HgfFDKlqLpJBr662'

const store = new FirebaseMapAdapter(path, {
  relations: [
    {
      usingKeys: 'validRoles',
      from: 'roles',
      to: 'roles',
    },
  ],
})
// store.startSyncingFromServer().then(() => {
//   store.startSyncingToServer()
// })

@observer
class ValidRoles extends Component {
  state = {}

  componentDidMount() {
    this._ref = db.ref(path)

    this._ref.on('value', this.handleDataBaseChange)
  }

  componentWillUnmount() {
    this._ref.off('value', this.handleDataBaseChange)
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
                const json = prompt('Replace the store._map', JSON.stringify(store._map.toJS()))
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
              <Form.Button
                icon="lightning"
                content="From Server"
                active={store.isSyncingFromServer}
                onClick={() => {
                  if (store.isSyncingFromServer) store.stopSyncingFromServer()
                  else store.startSyncingFromServer()
                }}
                toggle
              />
              <Form.Button
                icon="lightning"
                content="To Server"
                active={store.isSyncingToServer}
                onClick={() => {
                  if (store.isSyncingToServer) store.stopSyncingToServer()
                  else store.startSyncingToServer()
                }}
                toggle
              />
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
