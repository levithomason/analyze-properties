import _ from 'lodash'

class EventStack {
  processors = {
    // [eventName]: () => { /* processes handlers[eventName] */ }
  }

  handlers = {
    // [eventName]: [handler, ...]
  }

  compactProcessors = eventName => {
    // console.log('EventStack.compactProcessors()', eventName)

    // empty stack, remove processor
    if (_.isEmpty(this.handlers[eventName])) {
      // console.log('...EventStack: stack is empty, remove document listener')
      document.removeEventListener(eventName, this.processors[eventName])
      delete this.processors[eventName]
    }
  }

  // TODO right now this treats all handlers as "once" handlers
  processor = eventName => event => {
    // console.log('EventStack.processor()', eventName)
    const nextHandler = this.handlers[eventName].pop()

    if (nextHandler) nextHandler(event)

    this.compactProcessors(eventName)
  }

  sub = (eventName, handler) => {
    // console.log('EventStack.sub()', eventName, handler)
    this.handlers[eventName] = this.handlers[eventName] || []

    this.handlers[eventName].push(handler)
    // console.log('...EventStack: handlers', this.handlers[eventName])

    // stack has handlers and there is no processor, add processor
    if (!_.isEmpty(this.handlers[eventName]) && !this.processors[eventName]) {
      // console.log('...EventStack: stack has handler, add document listener')
      this.processors[eventName] = this.processor(eventName)
      document.addEventListener(eventName, this.processors[eventName])
    }
  }

  unsub = (eventName, handler) => {
    // console.log('EventStack.unsub()', eventName, handler)
    this.handlers[eventName] = this.handlers[eventName].filter(h => h !== handler)
    // console.log('...EventStack: handlers', this.handlers[eventName])

    this.compactProcessors(eventName)
  }
}

export default new EventStack()
