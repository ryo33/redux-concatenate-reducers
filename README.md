redux-concatenate-reducers
====
Concatenates reducers and merges states returned by them.

## Description
It concatenates reducers, merging states they return.  
When initializing, it sequencially calls the reducers with undefined for the first argument and merges the results.  
Otherwise, it sequentially calls the reducers and merges the result, then it passes a next merged state to a next reducer.

## Example
```javascript
import concatenateReducers from 'redux-concatenate-reducers'

const reducer = concatenateReducers([
  (state = { a: 1 }, action) => {
    const { a } = state
    const { type, payload } = action
    switch (type) {
      case 'ADD':
        return { a: a + payload }
      default:
        return state
    }
  },
  (state = { b: 2, c: 3 }, action) => {
    const { b } = state
    const { type, payload } = action
    switch (type) {
      case 'ADD':
        return { b: b + 1 }
      default:
        return state
    }
  },
  (state = { d: 6 }, action) => {
    const { a, b, c } = state
    const { type, payload } = action
    switch (type) {
      case 'ADD':
        return { c: c + 1, d: a + b + c }
      default:
        return state
    }
  }
])

reducer(undefined, { type: 'INIT' })
// => { a: 1, b: 2, c: 3, d: 6 }

reducer({ a: 1, b: 2, c: 3, d: 6 }, { type: 'ADD', payload: 2 })
// => { a: 3, b: 3, c: 4, d: 9 }
```

## Installation
`npm i --save redux-concatenate-reducers`

## API

### `concatenateReducers(reducers) => wrappedReducer`
- `reducers` A list of reducers  
- `wrappedReducer` A final reducer

## License
MIT
