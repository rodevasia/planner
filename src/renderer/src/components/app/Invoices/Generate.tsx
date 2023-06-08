import {
  SubmitHandler,
  createForm,
  getValue,
  insert,
  remove,
  setValues,
  zodForm
} from '@modular-forms/solid'
import { generateInvoice } from '@renderer/api/invoices'
import { getTasksForGen } from '@renderer/api/tasks'
import useDialogBox from '@renderer/components/ui/DialogBox'
import Navigator from '@renderer/components/ui/Navigator'
import Paginator from '@renderer/components/ui/Paginator'
import { notify } from '@renderer/components/ui/notify'
import { Issues } from '@renderer/models/Tasks'
import { project } from '@renderer/store'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

import {
  Button,
  Card,
  Col,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  FormSelect,
  ModalFooter,
  Row,
  Spinner,
  Switch,
  Table
} from 'solid-bootstrap'
import { Component, For, JSX, createResource, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { z } from 'zod'

type GenerateInputs = {
  projectId: string
  clientId: string
  due: string
  accountDetails: string
  rate: string
}
type AdditionalFields = {
  field: string
  value: string
  type: 'sub' | 'add'
}
type InvoiceItems = {
  duration: number
  description: string
  tasks: string[]
  rate: string
}

const GenerateInvoice: Component = () => {
  const [page, setPage] = createSignal(1)
  const [combine, setCombine] = createSignal(false)
  const [view, setView] = createSignal<'list' | 'form'>('form')
  const [additionalField, setAdditionalFields] = createSignal(false)
  const [generating, setGenerating] = createSignal(false)
  const [input, setInputs] = createStore<GenerateInputs | object>()
  let trashCombine: InvoiceItems[] = []
  let combinedItems: InvoiceItems[] = []
  let [invoiceItems, setInvoiceItems] = createStore<InvoiceItems[]>([])
  const _doneTasks = (page: number | undefined) => getTasksForGen(project.id, undefined, page)
  const [task] = createResource(page, _doneTasks)
  const modal = useDialogBox()

  const schema = z.object({
    rate: z
      .string()
      .min(1, 'Field Required')
      .regex(/^[0-9]+$/, 'Numbers Only'),
    due: z.string().min(1, 'Field Required'),
    accountDetails: z.string().min(1, 'Field Required'),
    clientId: z.string().min(1, 'Field Required'),
    projectId: z.string().min(1, 'Field Required')
  })
  const [form, { Form, Field }] = createForm<GenerateInputs>({
    initialValues: {
      rate: '',
      due: '',
      accountDetails: '',
      projectId: project.id,
      clientId: project.clientId
    },
    validate: zodForm(schema)
  })
  const [adForm, AdForm] = createForm<{ additionalFields: AdditionalFields[] }>({
    initialValues: {
      additionalFields: []
    },
    validate: zodForm(
      z.object({
        additionalFields: z
          .object({
            type: z.enum(['sub', 'add']),
            value: z
              .string()
              .min(1, 'Field is required')
              .regex(/^[0-9]+$/),
            field: z.string().min(3, 'Enter at least three chars')
          })
          .array()
      })
    )
  })
  const handleSubmit: SubmitHandler<GenerateInputs> = (values) => {
    setInputs((prev) => values)
    setView('list')
  }

  const checkDisableAvailability = (task: Issues) => {
    if (combine()) {
      for (let item of invoiceItems) {
        if (item.tasks.includes(task.id)) return true
      }
    } else {
      for (let item of combinedItems) {
        if (item.tasks.includes(task.id)) return true
      }
      for (let item of trashCombine) {
        if (item.tasks.includes(task.id)) return true
      }
    }
  }
  const handleChecked = (d: string) => {
    if (combine()) {
      return combinedItems.map((t) => t.description).includes(d)
    } else {
      return invoiceItems.map((t) => t.description).includes(d)
    }
  }
  const combineTasks = (name: string): false => {
    if (combinedItems.length >= 2) {
      const pvtList = {
        description: name,
        rate: getValue(form, 'rate') as string,
        tasks: combinedItems.map((t) => t.tasks[0]),
        duration: (combinedItems as any).reduce((prev: any, curr: any) => {
          return parseInt(prev) + parseInt(curr.duration)
        }, 0) as unknown as number
      }
      console.log(pvtList)

      setInvoiceItems((prev) => [...prev, pvtList])
      trashCombine = [...combinedItems]
      combinedItems = []
      return false
    } else {
      notify.error('Please select at least two task')
      combinedItems = []
      return false
    }
  }
  const handleGenerate = async (values) => {
    modal.hide()
    if (invoiceItems.length < 1) {
      return notify.error('Select at least one task')
    } else {
      setGenerating(true)
      let body: any = {
        ...input,
        invoiceItems: invoiceItems.map((t) => ({
          ...t,
          rate: parseInt((input as GenerateInputs).rate)
        })),
        additionalFields: []
      }

      if (additionalField()) {
        body = { ...body, ...values }
      }
      const { name } = await generateInvoice(body)
      if (name) {
        notify.success(`Invoice ${name} generated`)
      }
      setGenerating(false)
    }
  }
  const additionalFields = () => {
    return (
      <AdForm.FieldArray name="additionalFields">
        {(fieldArray) => (
          <For each={fieldArray.items}>
            {(_, index) => {
              return (
                <Row class="my-3">
                  <Col>
                    <AdForm.Field name={`${fieldArray.name}.${index()}.field`}>
                      {(field, props) => {
                        return (
                          <FormControl
                            {...props}
                            placeholder="Field"
                            isInvalid={field.error.length > 0}
                            style={{ color: 'white', 'background-color': 'var(--bs-secondary)' }}
                            value={field.value}
                          />
                        )
                      }}
                    </AdForm.Field>
                  </Col>
                  <Col>
                    <AdForm.Field name={`${fieldArray.name}.${index()}.value`}>
                      {(field, props) => {
                        return (
                          <FormControl
                            {...props}
                            placeholder="Value"
                            isInvalid={field.error.length > 0}
                            style={{ color: 'white', 'background-color': 'var(--bs-secondary)' }}
                            value={field.value}
                          />
                        )
                      }}
                    </AdForm.Field>
                  </Col>
                  <Col>
                    <AdForm.Field name={`${fieldArray.name}.${index()}.type`}>
                      {(field, props) => {
                        return (
                          <Col>
                            <FormSelect
                              {...props}
                              isInvalid={field.error.length > 0}
                              value={field.value}
                              style={{ color: 'white', 'background-color': 'var(--bs-secondary)' }}
                            >
                              <option value={'add'}>ADD</option>
                              <option value={'sub'}>SUB</option>
                            </FormSelect>
                          </Col>
                        )
                      }}
                    </AdForm.Field>
                  </Col>
                  {index() !== fieldArray.items.length - 1 && (
                    <Col class="d-flex">
                      <i
                        class="bi my-auto bi-dash-circle text-danger"
                        onClick={() => {
                          remove(adForm, 'additionalFields', { at: index() })
                        }}
                      ></i>
                    </Col>
                  )}
                  {index() === fieldArray.items.length - 1 && (
                    <Col class="d-flex">
                      <i
                        class="bi my-auto bi-plus-circle  text-success"
                        onClick={() => {
                          insert(adForm, 'additionalFields', {
                            value: { field: '', type: 'sub', value: '' }
                          })
                        }}
                      ></i>
                    </Col>
                  )}
                </Row>
              )
            }}
          </For>
        )}
      </AdForm.FieldArray>
    )
  }
  return (
    <div class="vw-100 pt-3">
      <Navigator label="Generate Invoice" />
      <Row class="mx-0 pt-2">
        <Col class="p-3">
          <CombinedTasks onChange={(bool) => setCombine(bool)} onCombined={combineTasks}>
            <Card style={{ 'min-height': '400px' }} class="overflow-hidden">
              {view() === 'form' && (
                <Form onSubmit={handleSubmit}>
                  {Object.keys(schema.shape).map((fieldName: any) => (
                    <Field name={fieldName}>
                      {(field, props) => (
                        <FormGroup
                          style={{
                            display:
                              fieldName !== 'projectId' && fieldName !== 'clientId'
                                ? 'visible'
                                : 'none'
                          }}
                          class="m-3"
                        >
                          <FormLabel>
                            {fieldName[0].toUpperCase()}
                            {fieldName.slice(1)}
                          </FormLabel>
                          <FormControl
                            {...props}
                            isInvalid={field.error.length > 0}
                            value={field.value ?? ''}
                          />
                          {field.error && <small class="text-danger">{field.error}</small>}
                        </FormGroup>
                      )}
                    </Field>
                  ))}
                  <div class="float-end mx-3">
                    <Button type="reset" variant="outline-danger" class="me-3">
                      Reset
                    </Button>
                    <Button type="submit" class="text-white">
                      Continue
                    </Button>
                  </div>
                </Form>
              )}
              {view() === 'list' && (
                <>
                  {task.state == 'pending' ||
                    (task.state === 'refreshing' && (
                      <div
                        style={{
                          'list-style': 'none',
                          height: '350px'
                        }}
                        class="d-flex"
                      >
                        <Spinner class="m-auto" animation="border" />
                      </div>
                    ))}
                  {task.state !== 'pending' && task.state !== 'refreshing' && (
                    <ul
                      style={{
                        'list-style': 'none',
                        'max-height': '350px',
                        'overflow-y': 'scroll'
                      }}
                      class="decoration-none text-white "
                    >
                      {task()?.rows.map((t) => {
                        const item = {
                          duration: parseInt(t.duration),
                          description: t.issue,
                          tasks: [t.id],
                          rate: getValue(form, 'rate') as string
                        }
                        return (
                          <li class="my-2 py-2 border-bottom">
                            <FormCheck
                              id={t.id}
                              disabled={checkDisableAvailability(t)}
                              checked={handleChecked(t.issue)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (combine()) {
                                    combinedItems.push(item)
                                  } else {
                                    setInvoiceItems((prev) => [...prev, item])
                                  }
                                } else {
                                  if (combine()) {
                                    combinedItems = combinedItems.filter(
                                      (tr) => tr.description !== t.issue
                                    )
                                  } else {
                                    const filtered = invoiceItems.filter(
                                      (re) => re.description !== t.issue
                                    )
                                    setInvoiceItems((prev) => filtered)
                                  }
                                }
                              }}
                              label={`${t.issue} (${dayjs
                                .duration(parseInt(t.duration))
                                .format('HH : mm : ss')})`}
                            />
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {task.state !== 'pending' && (
                    <Paginator
                      activePage={page()}
                      totalPages={Math.ceil(task()?.count! / 10)}
                      onPageChange={(number) => {
                        setPage(number)
                      }}
                    />
                  )}
                </>
              )}
            </Card>
          </CombinedTasks>
        </Col>
        <Col class="p-3">
          <Card style={{ 'min-height': '455px' }} class="overflow-hidden">
            <div class="d-flex">
              <h4 class="text-white mx-3 mt-2">Invoice Items</h4>
              <FormLabel class="my-auto ms-auto">Additional Fields</FormLabel>
              <Switch
                class="my-auto mx-4"
                checked={additionalField()}
                onChange={(e) => {
                  setAdditionalFields(e.target.checked)
                  setValues(adForm as any, {
                    additionalFields: [{ field: '', type: 'sub', value: '' }]
                  })
                }}
              />
            </div>
            <div
              class="ta"
              style={{ 'max-height': '350px', height: '350px', 'overflow-y': 'scroll' }}
            >
              <Table variant="dark">
                <thead>
                  <tr>
                    <th>Sl.No</th>
                    <th>Description</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, index) => {
                    return (
                      <tr>
                        <td>{index + 1}</td>
                        <td>{item.description}</td>
                        <td>{dayjs.duration(item.duration).format('DD : HH : mm : ss')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
            {!additionalField() && (
              <Button
                disabled={invoiceItems.length === 0}
                class="mx-3 text-white fw-medium"
                onClick={handleGenerate}
              >
                Generate Invoice
              </Button>
            )}
            {additionalField() && (
              <Button
                class="mx-3 text-white fw-medium"
                onClick={() => {
                  modal.show({
                    header: 'Generate Invoice',
                    type: 'prompt',
                    size: 'lg',
                    isolatedFooter: true,
                    body: (args) => (
                      <>
                        <AdForm.Form onSubmit={handleGenerate}>
                          {additionalFields()}
                          <ModalFooter>
                            <Button
                              type="button"
                              variant="outline-primary"
                              onClick={() => modal.hide()}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Generate</Button>
                          </ModalFooter>
                        </AdForm.Form>
                      </>
                    )
                  })
                }}
              >
                Add Fields
              </Button>
            )}
          </Card>
        </Col>
      </Row>
      {generating() && (
        <div
          style={{ 'backdrop-filter': 'blur(16px)', 'z-index': '9999' }}
          class="position-absolute d-flex w-100 h-100 top-0 start-0 c-show"
        >
          <Card class="col-2 m-auto text-center">
            <Card.Header>Generating Invoice</Card.Header>
            <Card.Body>
              <Spinner animation="border" variant="primary"></Spinner>
            </Card.Body>
            <Card.Footer>
              <small style={{ 'font-size': 'x-small', color: '#cecece' }}>
                Generated Invoice will be available in the Documents Folder, Also uploaded to your
                supabase cloud store for future reference
              </small>
            </Card.Footer>
          </Card>
        </div>
      )}
      <style>
        {`
          
            .ta::-webkit-scrollbar, ul::-webkit-scrollbar {
              width: 5px;
              color:gray
            }
            
            /* Track */
            .ta::-webkit-scrollbar-track,ul::-webkit-scrollbar-track {
              background: gray; 
            }
             
            /* Handle */
           .ta::-webkit-scrollbar-thumb, ul::-webkit-scrollbar-thumb {
              background: #888; 
            }
            
            /* Handle on hover */
            .ta::-webkit-scrollbar-thumb:hover,ul::-webkit-scrollbar-thumb:hover {
              background: #555; 
            }
        `}
      </style>
      <modal.DialogBox />
    </div>
  )
}
export default GenerateInvoice

const CombinedTasks: Component<{
  onChange: (combineMode: boolean) => void
  onCombined: (name: string) => false
  children: JSX.Element
}> = ({ onCombined, children, onChange }) => {
  const [combined, setCombined] = createSignal(false)
  const dialog = useDialogBox()
  const handleCombined = () => {
    dialog.show({
      type: 'prompt',
      body: (props) => (
        <>
          <FormGroup>
            <FormLabel>Task Name</FormLabel>
            <FormControl
              class="bg-secondary text-white"
              placeholder="Enter Task Name"
              onChange={(e) => {
                props.setArgs(e.target.value)
              }}
            />
          </FormGroup>
          <style>
            {`
                .form-control{
                    background-color:var(--bs-secondary) !important;
                }
                ::placeholder{
                    color:#AAA !important;
                }
            `}
          </style>
        </>
      ),
      header: 'Combine Tasks',
      onPromptSave(hide, args) {
        if (args) {
          const _fal = onCombined(args)
          setCombined(_fal)
          onChange(_fal)
          hide()
        } else {
          hide()
          notify.error('Task name is required')
        }
      }
    })
  }
  return (
    <>
      <Card style={{ height: '50px' }} class="d-flex flex-row px-3 mb-2">
        <FormLabel class="my-auto ms-3">Enable Combined Task Mode</FormLabel>
        <Switch
          checked={combined()}
          onchange={(e) => {
            setCombined(e.target.checked)
            onChange(e.target.checked)
          }}
          size={30}
          class="ms-auto my-auto"
        />
      </Card>
      {children}
      {combined() && (
        <>
          <Card style={{ height: '50px' }} class=" px-3 my-2  flex-row">
            <Button
              onClick={() => {
                setCombined(false)
                onChange(false)
              }}
              variant="outline-primary"
              style={{ 'border-radius': '99999px' }}
              class="col-3 text-white my-auto ms-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCombined}
              style={{ 'border-radius': '99999px' }}
              class="col-3 my-auto ms-1 text-white"
            >
              Combine
            </Button>
          </Card>
          <dialog.DialogBox />
        </>
      )}
    </>
  )
}
