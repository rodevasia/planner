import { createForm, getValues, reset, setValue, zodForm } from '@modular-forms/solid'
import { getClients } from '@renderer/api/clients'
import useDialogBox from '@renderer/components/ui/DialogBox'
import Navigator from '@renderer/components/ui/Navigator'
import SelectBox from '@renderer/components/ui/SelectBox'
import { Col, Form as BSForm, FormLabel, Row, Button, Card, Switch } from 'solid-bootstrap'
import { createResource, createSignal } from 'solid-js'

import { z } from 'zod'
import AddContributors from './AddContributors'
import { createProject } from '@renderer/api/projects'
import { useNavigate } from '@solidjs/router'
import { notify } from '@renderer/components/ui/notify'

const CreateProject = () => {
  const [clients] = createResource(getClients)
  const [addContributor, setAddContributor] = createSignal(false)
  const schema = z.object({
    name: z.string().min(1, 'Field is required'),
    clientId: z.string().min(1, 'Field is required'),
    code: z.string().min(1, 'Field is required').max(3, 'Maximum 3 Characters'),
    description: z.string().min(1, 'Field is required')
  })
  const [form, { Form, Field }] = createForm({
    initialValues: {
      name: '',
      description: '',
      code: '',
      clientId: ''
    },
    validate: zodForm(schema)
  })
  const dialog = useDialogBox()
  const navigate = useNavigate()
  const handleSubmit = async (contributors: string[] = []) => {
    const values = getValues(form)
    const body = { ...values, contributors }
    const data = await createProject(body)
    if (data) {
        notify.success('Project Created')
      navigate('/user/projects', { replace: true })
    }
  }
  return (
    <div class="mt-5">
      <Navigator label="Create Project" />
      <div class="col-md-10 mx-auto">
        <Form onSubmit={() => handleSubmit()} class="mt-3">
          <Row>
            {Object.keys(schema.shape).map((fieldName: any) => {
              return (
                <Field name={fieldName}>
                  {(field, props) => {
                    let label
                    let size = fieldName === 'description' ? 12 : 4
                    if (fieldName !== 'clientId') {
                      label = fieldName[0].toUpperCase() + fieldName.slice(1)
                    } else label = 'Client'
                    if (fieldName !== 'clientId') {
                      return (
                        <Col sm={size}>
                          <FormLabel>{label}</FormLabel>
                          <BSForm.Control
                            {...props}
                            as={fieldName === 'description' ? 'textarea' : 'input'}
                            style={{ 'background-color': 'var(--bs-secondary)' }}
                            value={field.value}
                          />
                        </Col>
                      )
                    } else {
                      return (
                        <Col sm={size}>
                          <FormLabel>{label}</FormLabel>
                          <SelectBox
                            placeholder={clients.loading ? 'Loading...' : 'Select Client'}
                            items={clients()?.map((t) => ({ label: t.name, value: t.id })) ?? []}
                            onSelect={(id) => {
                              setValue(form, 'clientId', id)
                            }}
                          />
                          {field.error && <small class="text-danger">{field.error}</small>}
                        </Col>
                      )
                    }
                  }}
                </Field>
              )
            })}
          </Row>
          <Card class="flex-row px-3 py-2 justify-content-between  my-3 align-items-center">
            <p class="m-0">Add Contributors</p>
            <Switch onChange={(e) => setAddContributor(e.target.checked)} />
          </Card>
          <div class="float-end mt-3 text-white">
            <Button
              type="reset"
              onclick={() => reset(form)}
              class="text-white me-2"
              variant="danger"
            >
              Cancel
            </Button>
            {!addContributor() && (
              <Button type="submit" class="text-white">
                Submit
              </Button>
            )}
            {addContributor() && (
              <Button
                type="button"
                onClick={() => {
                  dialog.show({
                    type: 'prompt',
                    size: 'lg',
                    header: 'Contributors',
                    body: ({ setArgs }) => {
                      return <AddContributors setArgs={setArgs} />
                    },
                    onPromptSave(hide, args) {
                      handleSubmit(args);
                      hide();
                    }
                  })
                }}
                class="text-white"
              >
                Add Contributors
              </Button>
            )}
          </div>
        </Form>
      </div>
      <dialog.DialogBox />
    </div>
  )
}

export default CreateProject
