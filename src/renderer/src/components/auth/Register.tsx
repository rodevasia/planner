import { SubmitHandler, createForm, zodForm } from '@modular-forms/solid'
import { register } from '@renderer/api/auth'
import { A, useNavigate } from '@solidjs/router'
import {
  FloatingLabel,
  Form as BSForm,
  Container,
  Card,
  Col,
  Button,
  Spinner
} from 'solid-bootstrap'
import { Component, createSignal } from 'solid-js'
import { z } from 'zod'
import { notify } from '../ui/notify'

const Register: Component = (props) => {
  const [loading, setLoader] = createSignal(false)

  const schema = z.object({
    name: z.string().min(1, 'Field is required'),
    pincode: z.string().min(1, 'Field is required'),
    country: z.string().min(1, 'Field is required'),
    city: z.string().min(1, 'Field is required'),
    phone: z.string().min(1, 'Field is required'),
    email: z.string().email(),
    password: z.string().min(6),
    address: z.string().min(1, 'Field is required')
  })
  const [, { Form, Field }] = createForm({
    validate: zodForm(schema)
  })
  const to = useNavigate()
  const handleSubmit: SubmitHandler<{ email: string; password: string }> = async (
    values,
    event
  ) => {
    try {
      setLoader(true)
      const id = await register(values)
      if (id) {
        notify.success('Account Register! Please check your mail')
        to('/auth/login', { replace: true })
      }
      setLoader(false)
    } catch (error) {
      console.log(error)
      setLoader(false)
    }
  }
  return (
    <>
      <Container fluid class="bg-dark vh-100 d-flex">
        <Card as={Col} sm={10} xxl={11} md={11} lg={7} class="m-auto overflow-hidden">
          <Card.Header class="bg-primary text-center">
            <h1 class="text-white fs-5">Planner</h1>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit} class="px-4 row mt-3">
              {Object.keys(schema.shape).map((fieldName: any, index) => (
                <Field name={fieldName}>
                  {(field, props) => (
                    <Col
                      sm={
                        index === 0 || index === 1
                          ? 6
                          : fieldName === 'address'
                          ? 12
                          : fieldName === 'password' || fieldName === 'email'
                          ? 6
                          : 4
                      }
                    >
                      <FloatingLabel
                        controlId={`floating${fieldName}`}
                        label={fieldName[0].toUpperCase() + fieldName.slice(1)}
                        class="my-2"
                      >
                        <BSForm.Control
                          {...props}
                          isInvalid={field.error?.length > 0}
                          name={fieldName}
                          placeholder={fieldName[0].toUpperCase() + fieldName.slice(1)}
                          type={
                            fieldName === 'password'
                              ? 'password'
                              : fieldName === 'email'
                              ? 'email'
                              : 'text'
                          }
                          as={fieldName === 'address' ? 'textarea' : 'input'}
                        />
                      </FloatingLabel>
                      {field.error && <small class="text-danger">{field.error}</small>}
                    </Col>
                  )}
                </Field>
              ))}
              <Button type="submit" class="w-100 mt-4">
                {!loading() && 'Register'}
                {loading() && <Spinner animation="border" size="sm" class="text-white" />}
              </Button>
            </Form>
            <div class="text-center mt-3">
              <A href="/auth/login" class="text-center text-primary">
                Login
              </A>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

export default Register
