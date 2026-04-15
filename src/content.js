export const roleOptions = [
  'Conceptualization',
  'Data curation',
  'Formal analysis',
  'Investigation',
  'Methodology',
  'Software',
  'Validation',
  'Visualization',
  'Writing'
]

export const trainingOptions = ['yes', 'no', 'unknown']

export const emptyModel = {
  modelName: '',
  author: '',
  version: '',
  descriptionLink: '',
  license: '',
  task: '',
  co2Emissions: '',
  paperLink: '',
  baseModel: '',
  pid: ''
}

export const exampleForm = {
  workTitle: 'Model Influence Statement',
  authors: 'Pengyin Shan, Simon Thill',
  usedModel: 'yes',
  disclosureScope: 'single',
  models: [
    {
      modelName: 'GPT',
      author: 'OpenAI',
      version: '5.4',
      descriptionLink: 'diverse datasets, including information that is publicly available on the internet, information that we partner with third parties to access, and information that our users or human trainers and researchers provide or generate.',
      license: 'Unknown',
      task: 'Generate the code for this web app and documentation',
      co2Emissions: 'unknown',
      paperLink: 'https://deploymentsafety.openai.com/gpt-5-4-thinking/introduction',
      baseModel: 'Unknown',
      pid: 'unknown'
    }
  ],
  trainingOpenSource: 'unknown',
  trainingProprietary: 'unknown',
  trainingLicensed: 'unknown',
  roles: ['Software', 'Validation', 'Visualization', 'Methodology', 'Writing'],
  customRoles: '',
  whatElse: 'The models mentioned above are used to create this web app',
  shareCriticalPrompt: 'no',
  criticalPrompt: '',
  ethics: 'unknown',
  noModelSignature: '',
  noModelDate: '2026-04-15',
  finalSignature: 'Pengyin Shan',
  finalDate: '2026-04-15'
}
