import { SubmitHandler, createForm, setValue, zodForm } from '@modular-forms/solid'
import { createSprints, getSprints } from '@renderer/api/sprints'
import { getTasks } from '@renderer/api/tasks'
import { SprintTableItem } from '@renderer/components/ui/SprintTable'
import { Sprint, SprintStatus } from '@renderer/models/Sprint'
import { Issues } from '@renderer/models/Tasks'
import { project } from '@renderer/store'
import { Accordion, Button, Modal, OverlayTrigger, Tooltip } from 'solid-bootstrap'
import { createEffect, createResource, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { z } from 'zod'
import { Form as BSForm } from 'solid-bootstrap'
import Loader from '@renderer/components/ui/Loader'
import dayjs from 'dayjs'
import { notify } from '@renderer/components/ui/notify'
import BottomBar from '@renderer/components/ui/BottomBar'

export default function Sprints() {
  const [sprints, { refetch }] = createResource<Sprint[]>(getSprints)
  const [sprintTasks, setSprintTasks] = createStore<Issues[]>([])
  const [show, setShow] = createSignal(false)
  const weekAfter = new Date()
  weekAfter.setDate(new Date().getDate() + 7)
  const [form, { Form, Field }] = createForm<Partial<Sprint>>({
    initialValues: {
      endDate: weekAfter,
      goals: [],
      name: '',
      startDate: new Date()
    },

    validate: zodForm(
      z.object({
        name: z.string().min(1, 'Name is required')
      })
    )
  })
  const handleClose = () => {
    setShow(false)
  }
  const handleShow = () => setShow(true)

  const fetchSprintTasks = async (sprint: string) => {
    setSprintTasks([])
    const result = await getTasks(project.id, sprint)
    setSprintTasks(result ?? [])
  }

  createEffect(() => {
    if (sprints.state === 'ready') {
      if (sprints()?.length > 2) {
        const _sprints = sprints()
        const num: number = parseInt(_sprints[_sprints.length - 1]?.name?.match(/\d+/)![0])
        return setValue(form, 'name', `Sprint ${+num + 1}`)
      } else {
        return setValue(form, 'name', `Sprint 1`)
      }
    }
  })
  const handleSubmit: SubmitHandler<Partial<Sprint>> = async (values, event) => {
    values.goals = (values.goals as string)?.split(',')
    await createSprints({ ...values, status: SprintStatus.INPROGRESS, projectId: project.id })
    setShow(false)
    notify.success('New Sprint Created')
    refetch()
  }
  return (
    <div class="col-md-10 m-auto" style={{ height: '92vh' }}>
      <BottomBar />
      <div class="row py-3 col-md-12 m-auto border-bottom border-dark">
        <p class="display-6 text-white col-md-11 p-0 m-0">Sprints</p>
        <button onClick={handleShow} class="btn btn-primary text-white col-md-1 p-0">
          Create New
        </button>
      </div>
      {sprints.loading && (
        <div class="d-flex h-100">
          <Loader />
        </div>
      )}
      {sprints.state === 'ready' && (
        <div class="my-5 pb-5">
          {project.currentSprint && (
            <Accordion>
              {sprints()?.map((sprint, index) => {
                return (
                  <SprintTableItem
                    handlerKey={sprint.id}
                    sprint={sprint}
                    tasks={sprintTasks}
                    onClick={() => fetchSprintTasks(sprint.id)}
                  />
                )
              })}
            </Accordion>
          )}
          {!project.currentSprint && (
            <div class="m-auto text-center p-3">
              <i
                style={{ 'font-size': 'xxx-large' }}
                class="bi text-muted bi-exclamation-triangle-fill"
              />
              <p class="text-white">No Sprint</p>
            </div>
          )}
        </div>
      )}
      <Modal class="sy-modal" show={show()} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Add Sprint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Field name="name">
              {(field, props) => (
                <>
                  <BSForm.Label class="py-1">Name</BSForm.Label>
                  <BSForm.Control
                    {...props}
                    disabled
                    isInvalid={field.error.length > 0}
                    style={{ 'background-color': 'transparent' }}
                    placeholder="Name"
                    value={field.value}
                  />
                </>
              )}
            </Field>
            <Field type="Date" name="startDate">
              {(field, props) => (
                <>
                  <BSForm.Label class="py-1">Start Date</BSForm.Label>
                  <BSForm.Control
                    type="date"
                    {...props}
                    min={dayjs(new Date()).format('YYYY-MM-DD')}
                    value={dayjs(field.value).format('YYYY-MM-DD')}
                    onChange={(e) => {
                      props.onChange(e)
                      const dateStr = e.target.value
                      setValue(form, 'endDate', dayjs(dateStr).add(7, 'days').toDate())
                    }}
                  />
                </>
              )}
            </Field>
            <Field type="Date" name="endDate">
              {(field, props) => {
                return (
                  <>
                    <BSForm.Label class="py-1">End Date</BSForm.Label>
                    <BSForm.Control
                      {...props}
                      value={dayjs(field.value).format('DD-MM-YYYY')}
                      disabled
                      style={{ 'background-color': '#4D4D4D' }}
                    />
                  </>
                )
              }}
            </Field>
            <Field type="string" name="goals">
              {(field, props) => (
                <div class="mb-4">
                  <BSForm.Label>
                    Goals&nbsp;
                    <OverlayTrigger overlay={<Tooltip>Separate goals by comma(,)</Tooltip>}>
                      <i class="bi bi-info-circle small cursor-pointer" />
                    </OverlayTrigger>
                  </BSForm.Label>
                  <BSForm.Control value={field.value} {...props} />
                </div>
              )}
            </Field>
            <Modal.Footer>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button disabled={form.invalid} variant="primary" type="submit" class="text-light">
                Create
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
