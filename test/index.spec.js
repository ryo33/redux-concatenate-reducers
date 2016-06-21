import { expect } from 'chai'
import objectAssign from 'object-assign'

import concatenateReducers from '../src/index'

describe('concatenateReducers', () => {
  const reducer1 = concatenateReducers([
    (state = {a: 1}, { type, payload }) => {
      const { a } = state
      switch (type) {
        case 'ADD':
          return { a: a + payload }
        default:
          return state
      }
    },
    (state = {b: 2}, { type, payload }) => {
      const { a, b } = state
      switch (type) {
        case 'ADD':
          return { b: b + payload + a}
        default:
          return state
      }
    },
    (state = {c: 3, d: 4}, { type, payload }) => {
      const { a, b, c } = state
      switch (type) {
        case 'ADD':
          return { c: c + payload + a + b }
        default:
          return state
      }
    },
  ])
  const reducer2 = concatenateReducers([
    (state = 1, { type, payload }) => {
      switch (type) {
        case 'ADD':
          return state + payload
        default:
          return state
      }
    },
    (state, { type, payload }) => {
      switch (type) {
        case 'ADD':
          return state + payload
        default:
          return state
      }
    },
    (state = 3, { type, payload }) => {
      switch (type) {
        case 'ADD':
          return state + payload
        default:
          return state
      }
    }
  ])

  const reducer3 = concatenateReducers([
    (state, { payload: { a } }) => a,
    (state, { payload: { b } }) => b
  ])

  it('should return the initial state', () => {
    const initialState1 = reducer1(undefined, { type: 'INIT' })
    expect(initialState1).to.eql({ a: 1, b: 2, c: 3, d: 4 })
    const initialState2 = reducer2(undefined, { type: 'INIT' })
    expect(initialState2).to.eql(3)
  })

  it('should merge them when the state and the next state are both an object', () => {
    const state = reducer3({ a: 1, b: 2 }, { payload: { a: { c: 3 }, b: { d: 4 } } })
    expect(state).to.eql({ a: 1, b: 2, c: 3, d: 4 })
  })

  it('should replace the state when either or both of the state and the next state is not an object', () => {
    let state = reducer3({ a: 1, b: 2 }, { payload: { a: 3, b: { d: 4 } } })
    expect(state).to.eql({ d: 4 })
    state = reducer3({ a: 1, b: 2 }, { payload: { a: { c: 3 }, b: 4 } }) 
    expect(state).to.eql(4)
    state = reducer3({ a: 1, b: 2 }, { payload: { a: 3, b: 4 } }) 
    expect(state).to.eql(4)
  })

  it('should execuse the reducers sequentially', () => {
    const reducer = concatenateReducers([
      (state, { payload }) => payload,
      (state) => ({ c: objectAssign({}, state) })
    ])
    const state = reducer({ a: 1 }, { payload: { b: 2 } })
    expect(state).to.eql({ a: 1, b: 2, c: { a: 1, b: 2 } })

    let state1 = reducer1({ a: 1, b: 2, c: 3, d: 4 }, { type: 'ADD', payload: 3 })
    expect(state1).to.eql({ a: 4, b: 9, c: 19, d: 4 })
    state1 = reducer1({ a: 4, b: 9, c: 19, d: 4 }, { type: 'ADD', payload: 2 })
    expect(state1).to.eql({ a: 6, b: 17, c: 44, d: 4})

    let state2 = reducer2(3, { type: 'ADD', payload: 1 })
    expect(state2).to.eql(6)
    state2 = reducer2(6, { type: 'ADD', payload: 3 })
    expect(state2).to.eql(15)
  })

  it('should change the state only when necessary', () => {
    let previousState = { a: 1, b: 2 }
    let nextState = reducer3(previousState, { payload: { a: { b: 2 }, b: { a: 1 } } })
    expect(nextState).to.equal(previousState)

    previousState = { a: 1, b: 1, c: 1, d: 4 }
    nextState = reducer1(previousState, { type: 'SOMETHING' } )
    expect(nextState).to.equal(previousState)

    previousState = 2
    nextState = reducer2(previousState, { type: 'SOMETHING' } )
    expect(nextState).to.equal(previousState)

    previousState = 2
    nextState = reducer2(previousState, { type: 'ADD', payload: 0 } )
    expect(nextState).to.equal(previousState)
  })
})

describe('example', () => {
  it('should work correctly', () => {
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

    const state1 = reducer(undefined, { type: 'INIT' })
    expect(state1).to.eql({ a: 1, b: 2, c: 3, d: 6 })

    const state2 = reducer({ a: 1, b: 2, c: 3, d: 6 }, { type: 'ADD', payload: 2 })
    expect(state2).to.eql({ a: 3, b: 3, c: 4, d: 9 })
  })
})
