import initialState from './initial-state'

export default () => ({
  ...JSON.parse(JSON.stringify(initialState))
})
