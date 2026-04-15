import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Link,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DownloadIcon from '@mui/icons-material/Download'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import RemoveIcon from '@mui/icons-material/Remove'
import ReplayIcon from '@mui/icons-material/Replay'
import { emptyModel, exampleForm, roleOptions, trainingOptions } from './content'
import { buildAcknowledgmentText, buildStatementText, downloadAcknowledgmentText, exportStatementDocx } from './docxExport'
import citationCffRaw from '../citation.cff?raw'

const initialForm = {
  ...exampleForm,
  models: exampleForm.models.map((model) => ({ ...model }))
}
const exampleStatementUrl = new URL('../example-model-influence-statement.docx', import.meta.url).href
const contactEmail = 'pengyins@illinois.edu'
const creditRolesUrl = 'https://credit.niso.org/contributor-roles-defined/'

const readCffValue = (key) => {
  const match = citationCffRaw.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  return match ? match[1].trim() : ''
}

const readCffAuthors = () => {
  const lines = citationCffRaw.split('\n')
  const authors = []
  let inAuthors = false
  let currentAuthor = {}

  lines.forEach((line) => {
    if (!inAuthors) {
      if (line.trim() === 'authors:') {
        inAuthors = true
      }
      return
    }

    if (/^\S/.test(line) && line.trim() !== 'authors:') {
      if (currentAuthor.family || currentAuthor.given) {
        authors.push(currentAuthor)
        currentAuthor = {}
      }
      inAuthors = false
      return
    }

    const trimmed = line.trim()

    if (trimmed.startsWith('- family-names:')) {
      if (currentAuthor.family || currentAuthor.given) {
        authors.push(currentAuthor)
      }
      currentAuthor = {
        family: trimmed.replace('- family-names:', '').trim()
      }
      return
    }

    if (trimmed.startsWith('- ')) {
      if (currentAuthor.family || currentAuthor.given) {
        authors.push(currentAuthor)
      }
      currentAuthor = {}
      return
    }

    if (trimmed.startsWith('family-names:')) {
      currentAuthor.family = trimmed.replace('family-names:', '').trim()
    }

    if (trimmed.startsWith('given-names:')) {
      currentAuthor.given = trimmed.replace('given-names:', '').trim()
    }
  })

  if (currentAuthor.family || currentAuthor.given) {
    authors.push(currentAuthor)
  }

  return authors
    .map((author) => [author.given, author.family].filter(Boolean).join(' '))
    .filter(Boolean)
}

const citationTitle = readCffValue('title')
const citationVersion = readCffValue('version')
const citationLicense = readCffValue('license')
const citationDate = readCffValue('date-released')
const githubRepoUrl = readCffValue('repository-code')
const liveAppUrl = readCffValue('url')
const citationAuthors = readCffAuthors()
const citationYear = citationDate ? citationDate.slice(0, 4) : ''
const citationText = `${citationAuthors.length ? citationAuthors.join(', ') : 'Unknown Author'}${citationYear ? ` (${citationYear})` : ''}. ${citationTitle || 'Untitled'}${citationVersion ? ` (Version ${citationVersion})` : ''} [Software]. ${liveAppUrl || githubRepoUrl || ''}`.trim()

function App() {
  const [form, setForm] = useState(initialForm)
  const [isExporting, setIsExporting] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isSummaryCopied, setIsSummaryCopied] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Model Influence Statement follow-up',
    message: ''
  })

  const visibleModels = form.disclosureScope === 'single' ? form.models.slice(0, 1) : form.models
  const preview = buildStatementText(form)
  const acknowledgmentSummary = buildAcknowledgmentText(form)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateModel = (index, field, value) => {
    setForm((current) => ({
      ...current,
      models: current.models.map((model, modelIndex) =>
        modelIndex === index ? { ...model, [field]: value } : model
      )
    }))
  }

  const addModel = () => {
    setForm((current) => ({
      ...current,
      models: [...current.models, { ...emptyModel }]
    }))
  }

  const removeModel = (index) => {
    setForm((current) => ({
      ...current,
      models: current.models.filter((_, modelIndex) => modelIndex !== index)
    }))
  }

  const toggleRole = (role) => {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role]
    }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportStatementDocx(form)
    } finally {
      setIsExporting(false)
    }
  }

  const loadExample = () => {
    setForm({
      ...exampleForm,
      models: exampleForm.models.map((model) => ({ ...model }))
    })
  }

  const updateContactField = (field, value) => {
    setContactForm((current) => ({ ...current, [field]: value }))
  }

  const contactHref = `mailto:${contactEmail}?subject=${encodeURIComponent(contactForm.subject || 'Model Influence Statement follow-up')}&body=${encodeURIComponent(
    `Name: ${contactForm.name || ''}\nEmail: ${contactForm.email || ''}\n\n${contactForm.message || ''}`
  )}`

  const openContactDialog = () => {
    setIsContactOpen(true)
  }

  const closeContactDialog = () => {
    setIsContactOpen(false)
  }

  const openInfoDialog = () => {
    setIsInfoOpen(true)
  }

  const closeInfoDialog = () => {
    setIsInfoOpen(false)
  }

  const openSummaryDialog = () => {
    setIsSummaryCopied(false)
    setIsSummaryOpen(true)
  }

  const closeSummaryDialog = () => {
    setIsSummaryOpen(false)
  }

  const copySummaryText = async () => {
    if (!navigator.clipboard?.writeText) {
      return
    }

    await navigator.clipboard.writeText(acknowledgmentSummary)
    setIsSummaryCopied(true)
  }

  return (
    <Box className="page-shell" component="main">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={3}>
          <Box className="hero-panel">
            <Typography variant="overline" sx={{ letterSpacing: 2.2 }}>
              Self-Hosted Disclosure Workflow
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', md: '4rem' }, mt: 1 }}>
              Model Influence Statement
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 760, mt: 2, color: 'text.secondary', fontWeight: 500 }}>
              Capture machine-learning model usage, disclose one model or multiple models, and export a finalized statement as a DOCX file for research authors.
            </Typography>
            <Typography sx={{ maxWidth: 860, mt: 2.5, color: 'text.secondary' }}>
              This disclosure is voluntary. It is designed for authors who want to be transparent about model use in their reports and publications, while contributing to a longer-term culture of reproducible research and responsible model creation.
            </Typography>
            <Typography sx={{ maxWidth: 860, mt: 1.5, color: 'text.secondary' }}>
              Reviewers are encouraged to value the transparency reflected in this statement while evaluating the work on its own merits, and not to treat the presence, absence, or level of detail in the disclosure as a standalone signal of research quality.
            </Typography>
            <Typography sx={{ maxWidth: 860, mt: 1.5, color: 'text.secondary' }}>
              The generator is intended for research transparency, software acknowledgment workflows, model influence disclosure, and broader discussion around responsible citation of LLM-assisted creation.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                href={exampleStatementUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Example DOCX
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={loadExample}
              >
                Load Example Data
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={openContactDialog}
              >
                Contact Developer
              </Button>
              <Button
                variant="text"
                startIcon={<InfoOutlinedIcon />}
                onClick={openInfoDialog}
              >
                Project Info
              </Button>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mt: 2 }}>
              <Link href={githubRepoUrl} target="_blank" rel="noreferrer" underline="hover">
                Source code on GitHub
              </Link>
              <Link href={liveAppUrl} target="_blank" rel="noreferrer" underline="hover">
                Live deployed app
              </Link>
              <Link href={creditRolesUrl} target="_blank" rel="noreferrer" underline="hover">
                Official CRediT role taxonomy
              </Link>
            </Stack>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card className="panel-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    What It Helps With
                  </Typography>
                  <Typography color="text.secondary">
                    Authors can disclose whether no model, one model, or multiple models were used in a research or software workflow and generate a reusable statement for reporting.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="panel-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    What It Exports
                  </Typography>
                  <Typography color="text.secondary">
                    The app exports a DOCX influence statement and a shorter one-paragraph acknowledgment summary suitable for software acknowledgments, methods text, or citation-adjacent disclosure.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="panel-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    What It Covers
                  </Typography>
                  <Typography color="text.secondary">
                    The workflow includes model identification, CRediT-style roles, training-data disclosure, optional prompt disclosure, ethical considerations, and final author certification.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Card className="panel-card">
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Responsibility Statement
                    </Typography>
                    <Typography color="text.secondary">
                      The contents of this publication are solely the responsibility of the listed authors. It is the responsibility of the listed authors to verify that all AI-generated code in this work executes as intended.
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Work Title"
                          value={form.workTitle}
                          onChange={(event) => updateField('workTitle', event.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Authors"
                          value={form.authors}
                          onChange={(event) => updateField('authors', event.target.value)}
                          helperText="Use a comma-separated list."
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card className="panel-card">
                  <CardContent>
                    <FormControl>
                      <FormLabel>Did you use a machine-learning model in the creation of this work?</FormLabel>
                      <RadioGroup
                        row
                        value={form.usedModel}
                        onChange={(event) => updateField('usedModel', event.target.value)}
                        sx={{ mt: 1 }}
                      >
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                      </RadioGroup>
                    </FormControl>

                    {form.usedModel === 'no' ? (
                      <Stack spacing={2} sx={{ mt: 3 }}>
                        <Alert severity="info">
                          No machine-learning model was used in the creation of this work.
                        </Alert>
                        <TextField
                          fullWidth
                          label="Signature"
                          value={form.noModelSignature}
                          onChange={(event) => updateField('noModelSignature', event.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Date"
                          type="date"
                          value={form.noModelDate}
                          onChange={(event) => updateField('noModelDate', event.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Stack>
                    ) : (
                      <Stack spacing={3} sx={{ mt: 3 }}>
                        <FormControl>
                          <FormLabel>Model disclosure scope</FormLabel>
                          <RadioGroup
                            row
                            value={form.disclosureScope}
                            onChange={(event) => updateField('disclosureScope', event.target.value)}
                            sx={{ mt: 1 }}
                          >
                            <FormControlLabel value="single" control={<Radio />} label="One model" />
                            <FormControlLabel value="multiple" control={<Radio />} label="Multiple models" />
                          </RadioGroup>
                        </FormControl>

                        {visibleModels.map((model, index) => (
                          <Card key={index} variant="outlined" className="nested-card">
                            <CardContent>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography variant="h6">
                                    Model Entry {index + 1}
                                  </Typography>
                                  {form.disclosureScope === 'multiple' && form.models.length > 1 ? (
                                    <Button
                                      color="secondary"
                                      startIcon={<RemoveIcon />}
                                      onClick={() => removeModel(index)}
                                    >
                                      Remove
                                    </Button>
                                  ) : null}
                                </Stack>
                                <Grid container spacing={2}>
                                  {[
                                    ['modelName', 'Model Name'],
                                    ['author', 'Author or Organization'],
                                    ['version', 'Version'],
                                    ['descriptionLink', 'Description or Training-Data Link'],
                                    ['license', 'Model License'],
                                    ['task', 'Task Performed in This Work'],
                                    ['co2Emissions', 'CO2 Emissions'],
                                    ['paperLink', 'Link to Paper or Documentation'],
                                    ['baseModel', 'Base Model'],
                                    ['pid', 'PID']
                                  ].map(([field, label]) => (
                                    <Grid item xs={12} sm={field === 'task' || field === 'descriptionLink' ? 12 : 6} key={field}>
                                      <TextField
                                        fullWidth
                                        label={label}
                                        value={model[field]}
                                        onChange={(event) => updateModel(index, field, event.target.value)}
                                        multiline={field === 'task' || field === 'descriptionLink'}
                                        minRows={field === 'task' || field === 'descriptionLink' ? 2 : 1}
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}

                        {form.disclosureScope === 'multiple' ? (
                          <Button variant="outlined" startIcon={<AddIcon />} onClick={addModel}>
                            Add Another Model
                          </Button>
                        ) : null}

                        <Divider />

                        <Stack spacing={2}>
                          <Typography variant="h5">Training Data Disclosure</Typography>
                          {[
                            ['trainingOpenSource', 'Publicly available open-source code'],
                            ['trainingProprietary', 'Proprietary code'],
                            ['trainingLicensed', 'Data subject to license restrictions']
                          ].map(([field, label]) => (
                            <FormControl key={field}>
                              <FormLabel>{label}</FormLabel>
                              <RadioGroup
                                row
                                value={form[field]}
                                onChange={(event) => updateField(field, event.target.value)}
                              >
                                {trainingOptions.map((option) => (
                                  <FormControlLabel
                                    key={option}
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                  />
                                ))}
                              </RadioGroup>
                            </FormControl>
                          ))}
                        </Stack>

                        <Divider />

                        <Stack spacing={2}>
                          <Typography variant="h5">Roles Played by the Model</Typography>
                          <Typography color="text.secondary">
                            Official CRediT role descriptors:
                            {' '}
                            <Link href={creditRolesUrl} target="_blank" rel="noreferrer">
                              credit.niso.org/contributor-roles-defined/
                            </Link>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {roleOptions.map((role) => (
                              <Chip
                                key={role}
                                label={role}
                                color={form.roles.includes(role) ? 'primary' : 'default'}
                                variant={form.roles.includes(role) ? 'filled' : 'outlined'}
                                onClick={() => toggleRole(role)}
                              />
                            ))}
                          </Box>
                          <TextField
                            fullWidth
                            label="Custom Roles"
                            value={form.customRoles}
                            onChange={(event) => updateField('customRoles', event.target.value)}
                            helperText="Use commas to separate additional roles."
                          />
                        </Stack>

                        <Divider />

                        <Stack spacing={2}>
                          <Typography variant="h5">Additional Disclosure</Typography>
                          <TextField
                            fullWidth
                            label="What else should readers know?"
                            value={form.whatElse}
                            onChange={(event) => updateField('whatElse', event.target.value)}
                            multiline
                            minRows={4}
                          />
                          <FormControl>
                            <FormLabel>Do you want to voluntarily disclose a critical prompt or prompt set used in this project?</FormLabel>
                            <RadioGroup
                              row
                              value={form.shareCriticalPrompt}
                              onChange={(event) => updateField('shareCriticalPrompt', event.target.value)}
                            >
                              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                              <FormControlLabel value="no" control={<Radio />} label="No" />
                            </RadioGroup>
                          </FormControl>
                          {form.shareCriticalPrompt === 'yes' ? (
                            <TextField
                              fullWidth
                              label="Critical Prompt or Prompt Summary"
                              value={form.criticalPrompt}
                              onChange={(event) => updateField('criticalPrompt', event.target.value)}
                              multiline
                              minRows={4}
                            />
                          ) : null}
                          <TextField
                            fullWidth
                            label="Ethical considerations"
                            value={form.ethics}
                            onChange={(event) => updateField('ethics', event.target.value)}
                            multiline
                            minRows={4}
                          />
                        </Stack>

                        <Divider />

                        <Stack spacing={2}>
                          <Typography variant="h5">Final Certification</Typography>
                          <TextField
                            fullWidth
                            label="Signature"
                            value={form.finalSignature}
                            onChange={(event) => updateField('finalSignature', event.target.value)}
                          />
                          <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={form.finalDate}
                            onChange={(event) => updateField('finalDate', event.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Stack>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Card className="panel-card preview-card">
                  <CardContent>
                    <Stack spacing={2} sx={{ mb: 2 }}>
                      <Typography variant="h5">Statement Preview</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={handleExport}
                          disabled={isExporting}
                        >
                          {isExporting ? 'Exporting...' : 'Export DOCX'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={openSummaryDialog}
                        >
                          Export Summary
                        </Button>
                      </Stack>
                    </Stack>
                    <Typography component="pre" className="preview-text">
                      {preview}
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
      <Dialog
        open={isContactOpen}
        onClose={closeContactDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Contact Developer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              Use this form to open your default email client and send a follow-up message to {contactEmail}. This uses a free `mailto:` workflow only. The app does not store messages or use any backend email service.
            </Typography>
            <TextField
              fullWidth
              label="Your Name"
              value={contactForm.name}
              onChange={(event) => updateContactField('name', event.target.value)}
            />
            <TextField
              fullWidth
              label="Your Email"
              value={contactForm.email}
              onChange={(event) => updateContactField('email', event.target.value)}
            />
            <TextField
              fullWidth
              label="Subject"
              value={contactForm.subject}
              onChange={(event) => updateContactField('subject', event.target.value)}
            />
            <TextField
              fullWidth
              label="Message"
              value={contactForm.message}
              onChange={(event) => updateContactField('message', event.target.value)}
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeContactDialog}>Close</Button>
          <Button variant="outlined" href={`mailto:${contactEmail}`}>
            Quick Email Link
          </Button>
          <Button variant="contained" color="secondary" href={contactHref}>
            Email Developer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isInfoOpen}
        onClose={closeInfoDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Project Info</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              Use the links below for the source repository, deployed app, and citation details for this project.
            </Typography>
            <Box>
              <Typography variant="subtitle2">GitHub Repository</Typography>
              <Typography>
                <a href={githubRepoUrl} target="_blank" rel="noreferrer">{githubRepoUrl}</a>
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Live Application</Typography>
              <Typography>
                <a href={liveAppUrl} target="_blank" rel="noreferrer">{liveAppUrl}</a>
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Citation</Typography>
              <Typography color="text.secondary">
                {citationText}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Citation Metadata</Typography>
              <Typography color="text.secondary">Authors: {citationAuthors.length ? citationAuthors.join(', ') : 'unknown'}</Typography>
              <Typography color="text.secondary">Title: {citationTitle || 'unknown'}</Typography>
              <Typography color="text.secondary">Version: {citationVersion || 'unknown'}</Typography>
              <Typography color="text.secondary">License: {citationLicense || 'unknown'}</Typography>
              <Typography color="text.secondary">Release Date: {citationDate || 'unknown'}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeInfoDialog}>Close</Button>
          <Button variant="outlined" href={githubRepoUrl} target="_blank" rel="noreferrer">
            Open GitHub
          </Button>
          <Button variant="contained" href={liveAppUrl} target="_blank" rel="noreferrer">
            Open App
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isSummaryOpen}
        onClose={closeSummaryDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Acknowledgment Summary</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              This one-paragraph summary is intended for software acknowledgments, method descriptions, or in-paragraph citation-style disclosure.
            </Typography>
            <Typography
              className="summary-text"
              color="text.secondary"
            >
              {acknowledgmentSummary}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeSummaryDialog}>Close</Button>
          <Button variant="outlined" onClick={copySummaryText}>
            {isSummaryCopied ? 'Copied' : 'Copy Text'}
          </Button>
          <Button variant="contained" onClick={() => downloadAcknowledgmentText(form)}>
            Download TXT
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default App
