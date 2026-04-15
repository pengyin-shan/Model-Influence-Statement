const valueOrUnknown = (value) => value && value.trim() ? value.trim() : 'unknown'
const valueOrEmpty = (value) => value && value.trim() ? value.trim() : ''
const visibleModelsForForm = (form) => form.usedModel === 'yes'
  ? form.models.slice(0, form.disclosureScope === 'single' ? 1 : form.models.length)
  : []
const disclosedRolesForForm = (form) => [...form.roles, ...form.customRoles.split(',').map((item) => item.trim()).filter(Boolean)]
const buildSafeName = (title) => (title || 'model-influence-statement').trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'model-influence-statement'

const labelParagraph = (Paragraph, TextRun, label, value) =>
  new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun(String(value))
    ]
  })

const modelTable = (Table, TableCell, TableRow, Paragraph, TextRun, WidthType, model, index) =>
  new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE
    },
    rows: [
      ['Model Name', valueOrUnknown(model.modelName)],
      ['Author or Organization', valueOrUnknown(model.author)],
      ['Version', valueOrUnknown(model.version)],
      ['Description or Training-Data Link', valueOrUnknown(model.descriptionLink)],
      ['Model License', valueOrUnknown(model.license)],
      ['Task Performed in This Work', valueOrUnknown(model.task)],
      ['CO2 Emissions', valueOrUnknown(model.co2Emissions)],
      ['Link to Paper or Documentation', valueOrUnknown(model.paperLink)],
      ['Base Model', valueOrUnknown(model.baseModel)],
      ['PID', valueOrUnknown(model.pid)]
    ].map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })]
            }),
            new TableCell({
              width: { size: 66, type: WidthType.PERCENTAGE },
              children: [new Paragraph(String(value))]
            })
          ]
        })
    ),
    margins: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100
    }
  })

export const buildStatementText = (form) => {
  const models = visibleModelsForForm(form)
  const roles = disclosedRolesForForm(form)
  const lines = [
    'Model Influence Statement',
    '',
    'Responsibility Statement',
    'The contents of this publication are solely the responsibility of the listed authors. It is the responsibility of the listed authors to verify that all AI-generated code in this work executes as intended.',
    '',
    `Work title: ${valueOrUnknown(form.workTitle)}`,
    `Authors: ${valueOrUnknown(form.authors)}`,
    `Did you use a machine-learning model in the creation of this work? ${form.usedModel}`,
    ''
  ]

  if (form.usedModel === 'no') {
    lines.push('No machine-learning model was used in the creation of this work.')
    lines.push(`Signed by: ${valueOrUnknown(form.noModelSignature)}`)
    lines.push(`Date: ${valueOrUnknown(form.noModelDate)}`)
    return lines.join('\n')
  }

  lines.push(`Disclosure scope: ${form.disclosureScope === 'single' ? 'one model' : 'multiple models'}`)
  lines.push('')
  lines.push('Model Information')
  lines.push('')

  models.forEach((model, index) => {
    lines.push(`Model Entry ${index + 1}`)
    lines.push(`- Model name: ${valueOrUnknown(model.modelName)}`)
    lines.push(`- Author or organization: ${valueOrUnknown(model.author)}`)
    lines.push(`- Version: ${valueOrUnknown(model.version)}`)
    lines.push(`- Description or training-data link: ${valueOrUnknown(model.descriptionLink)}`)
    lines.push(`- Model license: ${valueOrUnknown(model.license)}`)
    lines.push(`- Task performed in this work: ${valueOrUnknown(model.task)}`)
    lines.push(`- CO2 emissions: ${valueOrUnknown(model.co2Emissions)}`)
    lines.push(`- Link to paper or documentation: ${valueOrUnknown(model.paperLink)}`)
    lines.push(`- Base model: ${valueOrUnknown(model.baseModel)}`)
    lines.push(`- PID: ${valueOrUnknown(model.pid)}`)
    lines.push('')
  })

  lines.push('Training Data Disclosure')
  lines.push(`- Publicly available open-source code: ${form.trainingOpenSource}`)
  lines.push(`- Proprietary code: ${form.trainingProprietary}`)
  lines.push(`- Data subject to license restrictions: ${form.trainingLicensed}`)
  lines.push('')
  lines.push(`Roles played by the model: ${roles.length ? roles.join(', ') : 'unknown'}`)
  lines.push('')
  lines.push(`Additional disclosure: ${valueOrUnknown(form.whatElse)}`)
  lines.push(`Voluntary critical prompt disclosure: ${form.shareCriticalPrompt}`)
  if (form.shareCriticalPrompt === 'yes') {
    lines.push(`Critical prompt or prompt summary: ${valueOrUnknown(form.criticalPrompt)}`)
  }
  lines.push(`Ethical considerations: ${valueOrUnknown(form.ethics)}`)
  lines.push('')
  lines.push(`Signed by: ${valueOrUnknown(form.finalSignature)}`)
  lines.push(`Date: ${valueOrUnknown(form.finalDate)}`)
  return lines.join('\n')
}

export const buildAcknowledgmentText = (form) => {
  const workTitle = valueOrEmpty(form.workTitle) || 'this work'

  if (form.usedModel === 'no') {
    return `The authors of "${workTitle}" report that no machine-learning model was used in the creation of this work.`
  }

  const models = visibleModelsForForm(form)
  const roles = disclosedRolesForForm(form)
  const modelSummary = models.map((model) => {
    const modelName = valueOrEmpty(model.modelName) || 'an unspecified model'
    const details = [valueOrEmpty(model.author), valueOrEmpty(model.version) ? `version ${valueOrEmpty(model.version)}` : ''].filter(Boolean)
    return details.length ? `${modelName} (${details.join(', ')})` : modelName
  }).join('; ')
  const taskSummary = models.map((model) => valueOrEmpty(model.task)).filter(Boolean).join('; ')
  const sentences = [
    `The authors disclose the use of ${modelSummary || 'an unspecified model'} in the creation of "${workTitle}".`,
    roles.length ? `Reported CRediT-aligned roles included ${roles.join(', ')}.` : '',
    taskSummary ? `Disclosed uses included ${taskSummary}.` : '',
    `The statement reports training exposure as publicly available open-source code (${form.trainingOpenSource}), proprietary code (${form.trainingProprietary}), and data subject to license restrictions (${form.trainingLicensed}).`,
    valueOrEmpty(form.whatElse) && valueOrUnknown(form.whatElse).toLowerCase() !== 'unknown' ? `Additional disclosed context: ${valueOrEmpty(form.whatElse)}.` : '',
    form.shareCriticalPrompt === 'yes' ? 'A critical prompt or prompt summary was also voluntarily disclosed.' : '',
    valueOrEmpty(form.ethics) && valueOrUnknown(form.ethics).toLowerCase() !== 'unknown' ? `Ethical considerations noted: ${valueOrEmpty(form.ethics)}.` : ''
  ].filter(Boolean)

  return sentences.join(' ')
}

export const downloadAcknowledgmentText = (form) => {
  const text = buildAcknowledgmentText(form)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${buildSafeName(form.workTitle)}-acknowledgment.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export const exportStatementDocx = async (form) => {
  const {
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType
  } = await import('docx')
  const models = visibleModelsForForm(form)
  const roles = disclosedRolesForForm(form)
  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      text: 'Model Influence Statement'
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      text: 'Responsibility Statement'
    }),
    new Paragraph({
      text: 'The contents of this publication are solely the responsibility of the listed authors. It is the responsibility of the listed authors to verify that all AI-generated code in this work executes as intended.',
      spacing: { after: 180 }
    }),
    labelParagraph(Paragraph, TextRun, 'Work Title', valueOrUnknown(form.workTitle)),
    labelParagraph(Paragraph, TextRun, 'Authors', valueOrUnknown(form.authors)),
    labelParagraph(Paragraph, TextRun, 'Did You Use a Machine-Learning Model?', form.usedModel)
  ]

  if (form.usedModel === 'no') {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: 'Certification'
      }),
      new Paragraph({
        text: 'No machine-learning model was used in the creation of this work.',
        spacing: { after: 180 }
      }),
      labelParagraph(Paragraph, TextRun, 'Signature', valueOrUnknown(form.noModelSignature)),
      labelParagraph(Paragraph, TextRun, 'Date', valueOrUnknown(form.noModelDate))
    )
  } else {
    children.push(
      labelParagraph(Paragraph, TextRun, 'Disclosure Scope', form.disclosureScope === 'single' ? 'one model' : 'multiple models'),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: 'Model Information'
      })
    )

    models.forEach((model, index) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: `Model Entry ${index + 1}`
        }),
        modelTable(Table, TableCell, TableRow, Paragraph, TextRun, WidthType, model, index),
        new Paragraph({ text: '' })
      )
    })

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: 'Training Data Disclosure'
      }),
      labelParagraph(Paragraph, TextRun, 'Publicly Available Open-Source Code', form.trainingOpenSource),
      labelParagraph(Paragraph, TextRun, 'Proprietary Code', form.trainingProprietary),
      labelParagraph(Paragraph, TextRun, 'Data Subject to License Restrictions', form.trainingLicensed),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: 'Roles Played by the Model'
      }),
      new Paragraph({
        text: roles.length ? roles.join(', ') : 'unknown',
        spacing: { after: 180 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: 'Additional Disclosure'
      }),
      new Paragraph({
        text: valueOrUnknown(form.whatElse),
        spacing: { after: 180 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: 'Critical Prompt Disclosure'
      }),
      labelParagraph(Paragraph, TextRun, 'Voluntary Critical Prompt Disclosure', form.shareCriticalPrompt),
      new Paragraph({
        text: form.shareCriticalPrompt === 'yes' ? valueOrUnknown(form.criticalPrompt) : 'not disclosed',
        spacing: { after: 180 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: 'Ethical Considerations'
      }),
      new Paragraph({
        text: valueOrUnknown(form.ethics),
        spacing: { after: 180 }
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: 'Final Certification'
      }),
      labelParagraph(Paragraph, TextRun, 'Signature', valueOrUnknown(form.finalSignature)),
      labelParagraph(Paragraph, TextRun, 'Date', valueOrUnknown(form.finalDate))
    )
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  const safeName = buildSafeName(form.workTitle)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeName}.docx`
  link.click()
  URL.revokeObjectURL(url)
}
