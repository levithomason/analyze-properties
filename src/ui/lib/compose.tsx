const compose = (first, ...rest) => (...args) =>
  rest.reduce((acc, fn) => {
    return fn(acc)
  }, first(...args))

export default compose
