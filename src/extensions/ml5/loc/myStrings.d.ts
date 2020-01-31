declare interface IMl5CommandSetStrings {
  analysis: string
  batchSize: string
  classification: string
  close: string
  epochs: string
  errLearningRate: string
  errBatchSize: string
  errEpochs: string
  errLabelSel: string
  errFeatureSel: string
  errFeatureEmpty: string
  errSelClassOrReg: string
  errSelLabelPls: string
  errSelFeaturePls: string
  errSelFeatureType: string
  errFeatureValue: string
  features: string
  label: string
  learningRate: string
  ml5: string
  numberOfRec: string
  predict: string
  prediction: string
  regression: string
  selFeature: string
  selFeatures: string
  selLabel: string
  train: string
  wait: string
}

declare module 'Ml5CommandSetStrings' {
  const strings: IMl5CommandSetStrings
  export = strings
}
