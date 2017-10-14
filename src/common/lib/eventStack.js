import _ from 'lodash/fp'

class EventStack {
  processors = {
    // [eventName]: () => { /* processes handlers[eventName] */ }
  }

  handlers = {
    // [eventName]: [handler, ...]
  }

  compactProcessors = eventName => {
    // console.debug('EventStack.compactProcessors()', eventName)

    // empty stack, remove processor
    if (_.isEmpty(this.handlers[eventName])) {
      // console.debug('...EventStack: stack is empty, remove document listener')
      document.removeEventListener(eventName, this.processors[eventName])
      delete this.processors[eventName]
    }
  }

  // TODO right now this treats all handlers as "once" handlers
  processor = eventName => event => {
    // console.debug('EventStack.processor()', eventName)
    const nextHandler = this.handlers[eventName].pop()

    if (nextHandler) nextHandler(event)

    this.compactProcessors(eventName)
  }

  sub = (eventName, handler) => {
    // console.debug('EventStack.sub()', eventName, handler)
    this.handlers[eventName] = this.handlers[eventName] || []

    this.handlers[eventName].push(handler)
    // console.debug('...EventStack: handlers', this.handlers[eventName])

    // stack has handlers and there is no processor, add processor
    if (!_.isEmpty(this.handlers[eventName]) && !this.processors[eventName]) {
      // console.debug('...EventStack: stack has handler, add document listener')
      this.processors[eventName] = this.processor(eventName)
      document.addEventListener(eventName, this.processors[eventName])
    }
  }

  unsub = (eventName, handler) => {
    // console.debug('EventStack.unsub()', eventName, handler)
    this.handlers[eventName] = this.handlers[eventName].filter(h => h !== handler)
    // console.debug('...EventStack: handlers', this.handlers[eventName])

    this.compactProcessors(eventName)
  }
}

export default new EventStack()
