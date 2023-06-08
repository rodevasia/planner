import { Component, createSignal } from 'solid-js'
import {
  Card,
  Col,
  Container,
  FloatingLabel,
  Form as BSForm,
  Button,
  Spinner
} from 'solid-bootstrap'
import { resetPassword } from '@renderer/api/auth'
import { SubmitHandler, createForm, zodForm } from '@modular-forms/solid'
import { z } from 'zod'
import { A, useLocation, useNavigate } from '@solidjs/router'
import { notify } from '../ui/notify'

const Login: Component = () => {
  const [loading, setLoader] = createSignal(false)
  const location = useLocation<{ token: string }>()
  const schema = z
    .object({
      confirmPassword: z.string().min(1, 'Field is required'),
      password: z.string().min(1, 'Field is required')
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'The passwords did not match'
        })
      }
    })

  const [, { Form, Field }] = createForm<{ confirmPassword: string; password: string }>({
    initialValues: {
      confirmPassword: '',
      password: ''
    },
    validate: zodForm(schema)
  })
  const to = useNavigate()
  const handleSubmit: SubmitHandler<{ confirmPassword: string; password: string }> = async (
    values,
    event
  ) => {
    setLoader(true)
    const { status } = await resetPassword({
      password: values.password,
      token: location?.state?.token
    })
    if (status) {
      notify.success('Password Changed')
      to('/auth/login', { replace: true })
    }
  }
  return (
    <Container fluid class="bg-dark vh-100 d-flex">
      <Card as={Col} sm={6} xxl={3} md={5} lg={3} class="m-auto overflow-hidden">
        <Card.Header class="bg-primary text-center">
          <h1 class="text-white fs-5">Planner</h1>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit} class="px-4 mt-3">
            <Field name="password">
              {(field, props) => (
                <>
                  <FloatingLabel controlId="floatingInput" label="Password" class="mb-1">
                    <BSForm.Control
                      {...props}
                      isInvalid={field.error.length > 0}
                      name="email"
                      type="password"
                      placeholder="Password"
                    />
                  </FloatingLabel>
                  {field.error && <small class="text-danger">{field.error}</small>}
                </>
              )}
            </Field>

            <Field name="confirmPassword">
              {(field, props) => (
                <>
                  <FloatingLabel
                    class="text-white p-0 mt-3"
                    controlId="floatingPassword"
                    label="Confirm Password"
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
            <Button type="submit" class="w-100 mt-4">
              {!loading() && 'Change Password'}
              {loading() && <Spinner animation="border" size="sm" class="text-white" />}
            </Button>
            <div class="text-center mt-3">
              <A href="/auth/login" class="text-center text-primary">
                Login
              </A>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
export default Login
