export default interface IPredictionState {
  trainDisable: boolean
  predictDisable: boolean
  result: string
  confidence: number
  inputs: { key: string; value: string }[]
  selectedFeatures: string[]
  selectedLabel: string
  learningRate: string
  batchSize: string
  epochs: string
  analysis: string
  errors: string[]
}
