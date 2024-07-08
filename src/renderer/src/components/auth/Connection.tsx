import { Component, createSignal } from 'solid-js'
import {
  Card,
  Col,
  Container,
  FloatingLabel,
  Form as BSForm,
  Button,
  Spinner,
  Row
} from 'solid-bootstrap'
import { createConnection } from '@renderer/api/auth'
import { SubmitHandler, createForm, zodForm } from '@modular-forms/solid'
import { z } from 'zod'
import useDialogBox from '../ui/DialogBox'

type IConnection = {
  host: string
  db: string
  username: string
  password: string
  email: string
  mailerPassword: string
}
const Connection: Component = () => {
  const [loading, setLoader] = createSignal(false)
  const dialog = useDialogBox()
  const schema = z.object({
    host: z.string().min(1, 'Field is required'),
    db: z.string().min(1, 'Field is required'),
    username: z.string().min(1, 'Field is required'),
    password: z.string().min(1, 'Field is required')
  })

  const [, { Form, Field }] = createForm<IConnection>({
    initialValues: {
      host: '',
      db: '',
      username: '',
      password: ''
    },
    validate: zodForm(schema)
  })
  const handleSubmit: SubmitHandler<IConnection> = async (values, event) => {
    try {
      createConnection(values)
    } catch (error) {
      setLoader(false)
    }
  }

  return (
    <Container fluid class="bg-dark vh-100 d-flex">
      <Card as={Col} sm={6} xxl={8} md={5} lg={8} class="m-auto overflow-hidden">
        <Card.Header class="bg-primary text-center">
          <h1 class="text-white fs-5">Planner | Connect Storage</h1>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit} class="px-4 mt-3">
            <Row>
              <Col>
                <Field name="host">
                  {(field, props) => (
                    <>
                      <FloatingLabel controlId="floatingHost" label="Host" class="mb-1">
                        <BSForm.Control
                          {...props}
                          isInvalid={field.error.length > 0}
                          name="host"
                          type="password"
                          placeholder="Enter DB host"
                        />
                      </FloatingLabel>
                      {field.error && <small class="text-danger">{field.error}</small>}
                    </>
                  )}
                </Field>
              </Col>

              <Col>
                <Field name="db">
                  {(field, props) => (
                    <>
                      <FloatingLabel class="text-white" controlId="floatingDb" label="Database">
                        <BSForm.Control
                          {...props}
                          isInvalid={field.error.length > 0}
                          type="password"
                          placeholder="Database"
                        />
                        {field.error && <small class="text-danger">{field.error}</small>}
                      </FloatingLabel>
                    </>
                  )}
                </Field>
              </Col>
            </Row>
            <Row class="mt-3">
              <Col>
                <Field name="username">
                  {(field, props) => (
                    <>
                      <FloatingLabel controlId="floatingUser" label="Username" class="mb-1">
                        <BSForm.Control
                          {...props}
                          isInvalid={field.error.length > 0}
                          name="username"
                          type="password"
                          placeholder="Enter Username"
                        />
                      </FloatingLabel>
                      {field.error && <small class="text-danger">{field.error}</small>}
                    </>
                  )}
                </Field>
              </Col>

              <Col>
                <Field name="password">
                  {(field, props) => (
                    <>
                      <FloatingLabel
                        class="text-white"
                        controlId="floatingPassword"
                        label="Password"
                      >
                        <BSForm.Control
                          {...props}
                          isInvalid={field.error.length > 0}
                          type="password"
                          placeholder="Password"
                        />
                        {field.error && <small class="text-danger">{field.error}</small>}
                      </FloatingLabel>
                    </>
                  )}
                </Field>
              </Col>
            </Row>

            <Row class="mt-3">
              <Col>
                <Field name="email">
                  {(field, props) => (
                    <>
                      <FloatingLabel controlId="floatingUser" label="Mailer Email" class="mb-1">
                        <BSForm.Control
                          {...props}
                          isInvalid={field.error.length > 0}
                          name="username"
                          type="email"
                          placeholder="Email"
                        />
                      </FloatingLabel>
                      {field.error && <small class="text-danger">{field.error}</small>}
                    </>
                  )}
                </Field>
              </Col>

              <Col>
                <Field name="mailerPassword">
                  {(field, props) => (
                    <>
                      <FloatingLabel
                        class="text-white"
                        controlId="floatingPassword"
                        label="Mailer Password"
                      >
                        <BSForm.Control
                          {...props}
                          isInvalid={field.error.length > 0}
                          type="password"
                          placeholder="Password"
                        />
                        {field.error && <small class="text-danger">{field.error}</small>}
                      </FloatingLabel>
                    </>
                  )}
                </Field>
              </Col>
            </Row>
            <Row class="justify-content-center">
              <Button type="submit" class="w-50 mx-auto fw-bold  mt-4 p-3">
                {!loading() && 'Connect'}
                {loading() && <Spinner animation="border" size="sm" class="text-white" />}
              </Button>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      <dialog.DialogBox />
    </Container>
  )
}
export default Connection
