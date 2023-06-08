import { Component, createSignal } from 'solid-js'
import {
  Card,
  Col,
  Container,
  FloatingLabel,
  Form as BSForm,
  Button,
  Spinner,
  FormControl
} from 'solid-bootstrap'
import { forgot, login } from '@renderer/api/auth'
import { SubmitHandler, createForm, zodForm } from '@modular-forms/solid'
import { z } from 'zod'
import { A, useNavigate } from '@solidjs/router'
import { setUser } from '@renderer/store'
import useDialogBox from '../ui/DialogBox'
import { notify } from '../ui/notify'

const Login: Component = () => {
  const [loading, setLoader] = createSignal(false)
  const [invalid, setInvalid] = createSignal(false)
  const dialog = useDialogBox()
  const schema = z.object({
    email: z.string().min(1, 'Field is required').email('Invalid email address'),
    password: z.string().min(1, 'Field is required')
  })

  const [, { Form, Field }] = createForm<{ email: string; password: string }>({
    initialValues: {
      email: '',
      password: ''
    },
    validate: zodForm(schema)
  })
  const to = useNavigate()
  const handleSubmit: SubmitHandler<{ email: string; password: string }> = async (
    values,
    event
  ) => {
    try {
      setLoader(true)
      const { data } = await login(values)
      if (data) {
        setUser(data)
        setLoader(false)
        to('/user/projects')
      } else {
        setLoader(false)
        setInvalid(true)
      }
    } catch (error) {
      setInvalid(true)
      setLoader(false)
    }
  }
  const handleForgot = () => {
    dialog.show({
      type: 'prompt',
      body(props) {
        return (
          <>
            <FormControl
              placeholder="Enter Email Address"
              onChange={(e) => props.setArgs(e.target.value)}
              onblur={(e) => props.setArgs(e.target.value)}
            />
          </>
        )
      },
      header: 'Forgot Password',
      darken: 0.4,
      async onPromptSave(hide, args) {
        hide()
        const { status } = await forgot({ email: args })
        if (status) {
          notify.success('Password Reset Request Sent to Email')
        }
      }
    })
  }
  return (
    <Container fluid class="bg-dark vh-100 d-flex">
      <Card as={Col} sm={6} xxl={3} md={5} lg={3} class="m-auto overflow-hidden">
        <Card.Header class="bg-primary text-center">
          <h1 class="text-white fs-5">Planner</h1>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit} class="px-4 mt-3">
            <Field name="email">
              {(field, props) => (
                <>
                  <FloatingLabel controlId="floatingInput" label="Email address" class="mb-1">
                    <BSForm.Control
                      {...props}
                      isInvalid={field.error.length > 0}
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                    />
                  </FloatingLabel>
                  {field.error && <small class="text-danger">{field.error}</small>}
                </>
              )}
            </Field>

            <Field name="password">
              {(field, props) => (
                <>
                  <FloatingLabel
                    class="text-white p-0 mt-3"
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
            {invalid() && (
              <u
                class="text-primary small mt-3 cursor-pointer w-100 d-flex  justify-content-center"
                onClick={handleForgot}
              >
                Forgot Password?
              </u>
            )}
            <Button type="submit" class="w-100 mt-4">
              {!loading() && 'Login'}
              {loading() && <Spinner animation="border" size="sm" class="text-white" />}
            </Button>
            <div class="text-center mt-3">
              <A href="/auth/register" class="text-center text-primary">
                Create Account
              </A>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <dialog.DialogBox />
    </Container>
  )
}
export default Login
