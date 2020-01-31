import { map, pick } from 'lodash'

export const columns = (data, cols) => {
  const picked = map(data, o => pick(o, cols))
  return map(picked, o => (Object as any).values(o))
}

export const round = val => Number(val).toFixed(2)
