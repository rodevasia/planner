import { createForm, reset, setValues, zodForm } from '@modular-forms/solid'
import { createClient, deleteClient, getClients, updateClient } from '@renderer/api/clients'
import Navigator from '@renderer/components/ui/Navigator'
import { notify } from '@renderer/components/ui/notify'
import { Button, Card, Col, FormControl, FormGroup, FormLabel, Row, Table } from 'solid-bootstrap'
import { Component, createResource, createSignal } from 'solid-js'
import { z } from 'zod'

const Clients: Component = () => {
  const [clients, { refetch }] = createResource(getClients)
  const [update, setUpdate] = createSignal(false)
  const [currentClient, setCurrentClient] = createSignal()
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    company: z.string().min(1, 'Company Name is required'),
    email: z.string().email('Invalid email').nullable(),
    phone: z.string().min(1, 'Phone required'),
    city: z.string(),
    country: z.string(),
    pincode: z.string(),
    address: z.string()
  })
  const [form, { Form, Field }] = createForm({
    initialValues: {
      id: null,
      name: '',
      company: '',
      city: '',
      country: '',
      pincode: '',
      address: '',
      phone: '',
      email: ''
    },
    validate: zodForm(schema)
  })
  const handleSubmit = async (values) => {
    if (update()) {
      values = { ...values, id: currentClient() }
      await updateClient(values)
      notify.info('Updated')
      reset(form)
      refetch()
      setUpdate(false)
    } else {
      await createClient(values)
      notify.success('Created')
      reset(form)
      refetch()
    }
  }
  return (
    <div>
      <Navigator label="Clients" />
      <div class="col-8 mx-auto">
        <Card class="p-4">
          <p class="fw-medium">Create New Client</p>
          <Form class="m-auto" onSubmit={handleSubmit}>
            <Row>
              {Object.keys(schema.shape).map((fieldName: any, index) => {
                return (
                  <Col sm={4}>
                    <Field name={fieldName}>
                      {(field, props) => {
                        return (
                          <FormGroup>
                            <FormLabel>
                              {fieldName[0].toUpperCase()}
                              {fieldName.slice(1)}
                            </FormLabel>
                            <FormControl
                              {...props}
                              value={field.value ?? ''}
                              isInvalid={field.error.length > 0}
                            />
                            <small class="text-danger">{field.error}</small>
                          </FormGroup>
                        )
                      }}
                    </Field>
                  </Col>
                )
              })}
              <Col class="d-flex mt-auto">
                <Button
                  onClick={() => {
                    reset(form)
                  }}
                  type="reset"
                  variant="outline-danger"
                  class="my-auto mx-2"
                >
                  Reset
                </Button>
                <Button type="submit" class="my-auto w-100">
                  {!update() ? 'Create' : 'Update'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>

      {clients.state !== 'pending' && (
        <div class="col-md-8 mt-5 mx-auto">
          <Table striped variant="dark" class="col-md-2 mx-auto" hover>
            <thead>
              <tr>
                <th>#</th>
                <th> Name</th>
                <th>Company Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {clients().map((t, i) => {
                return (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{t.name}</td>
                    <td>{t.company}</td>
                    <td>
                      <i
                        onClick={() => {
                          setValues(form, t)
                          setCurrentClient(t.id)
                          setUpdate(true)
                        }}
                        class="bi bi-pencil mx-2 cursor-pointer text-primary"
                      />
                      <i
                        onClick={async () => {
                          await deleteClient(t.id)
                          refetch()
                          notify.info('Deleted')
                        }}
                        class="bi bi-trash text-danger cursor-pointer"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default Clients
