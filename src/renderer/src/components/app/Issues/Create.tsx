import { createForm, setValue, zodForm } from '@modular-forms/solid'
import { getSprints } from '@renderer/api/sprints'
import { createTask } from '@renderer/api/tasks'
import Navigator from '@renderer/components/ui/Navigator'
import SelectBox from '@renderer/components/ui/SelectBox'
import { notify } from '@renderer/components/ui/notify'
import { Issues, TaskStatus } from '@renderer/models/Tasks'
import { project } from '@renderer/store'
import { Button } from 'solid-bootstrap'
import { createResource, createSignal } from 'solid-js'
import { z } from 'zod'
import { AttachmentsCard } from './AttachmentsCard'

export default function CreateIssues() {
  const [att_1, setAtt_1] = createSignal<File>()
  const [att_2, setAtt_2] = createSignal<File>()
  const [att_3, setAtt_3] = createSignal<File>()
  const [sprints] = createResource(project.id, getSprints)
  const [form, { Form, Field }] = createForm<Partial<Issues>>({
    initialValues: {
      issue: '',
      description: '',
      status: TaskStatus.TODO,
      sprintId: ''
    },
    validate: zodForm(
      z.object({
        issue: z.string().min(1, 'Issue name is required'),
        description: z.string().min(1, 'Description is required'),
        sprintId: z.string().min(1, 'Please Select a Sprint')
      })
    )
  })
  function count() {
    if (att_1() && att_2() && att_3()) {
      return '3'
    } else if (
      (!att_1() && att_2() && att_3()) ||
      (att_1() && !att_2() && att_3()) ||
      (att_1() && att_2() && !att_3())
    ) {
      return '2'
    } else if (
      (!att_1() && !att_2() && att_3()) ||
      (!att_1() && att_2() && !att_3()) ||
      (att_1() && !att_2() && !att_3())
    ) {
      return '1'
    } else return '0'
  }
  const handleSubmit = async (values) => {
    const formData = new FormData()
    for (const value of Object.keys(values)) {
      formData.append(value, values[value])
    }
    if (att_1()) formData.append('attr_1', att_1() as any)
    if (att_2()) formData.append('attr_2', att_2() as any)
    if (att_3()) formData.append('attr_3', att_3() as any)
    formData.append('projectId', project.id)
    const data = await createTask(formData)
    if (data) {
      notify.success(`New Task ${data.code} Created`)
      window.history.back()
    }
  }
  return (
    <div class="col-md-10 m-auto">
      <Navigator label="Create Issue" />
      <div class="col-12 mt-4">
        <Form onSubmit={handleSubmit}>
          <div class="mb-3 form-group">
            <label for="issue" class="form-label">
              Issue*
            </label>
            <Field name="issue">
              {(field, fieldProps) => (
                <div>
                  <input
                    type="text"
                    {...fieldProps}
                    class="form-control bg-secondary"
                    value={field.value}
                    aria-describedby="helpId"
                  />
                  {field.error && field.touched && (
                    <small id="helpId" class="text-danger">
                      {field.error}
                    </small>
                  )}
                </div>
              )}
            </Field>
          </div>

          <div class="mb-3 form-group">
            <label for="desc" class="form-label">
              Description*
            </label>
            <Field name="description">
              {(field, fieldProps) => (
                <div>
                  <textarea
                    id="desc"
                    {...fieldProps}
                    class="text-white form-control bg-secondary"
                    placeholder="Describe issue"
                    value={field.value}
                  />
                  {field.error && field.touched && (
                    <small id="helpId" class="text-danger">
                      {field.error}
                    </small>
                  )}
                </div>
              )}
            </Field>
          </div>

          {/* Other fields and submit button */}

          <div class="row">
            <div class="col-6">
              <legend class="text-white">Attachments ({count()}/3)</legend>
              <div class="row  col-md-12">
                <AttachmentsCard
                  onChange={(e: File) => {
                    setAtt_1(e)
                  }}
                />
                <AttachmentsCard
                  onChange={(e: File) => {
                    setAtt_2(e)
                  }}
                />
                <AttachmentsCard
                  onChange={(e: File) => {
                    setAtt_3(e)
                  }}
                />
              </div>
            </div>
            <div class="col-md-6">
              <Field name="sprintId">
                {(field, props) => (
                  <>
                    <legend class="text-white">Sprint Details</legend>
                    <div class="mb-3 col-md-6 d-flex flex-column justify-content-center align-items-center h-75">
                      {sprints.state === 'ready' && (
                        <SelectBox
                          label="Select Sprint"
                          {...props}
                          onSelect={(value: any) => {
                            setValue(form, 'sprintId', value.id, { shouldTouched: true })
                          }}
                          items={sprints()?.map((t) => ({ label: t.name, value: t }))}
                        />
                      )}
                      {field.error && (
                        <small id="helpId" class="text-danger col-12">
                          {field.error}
                        </small>
                      )}
                    </div>
                  </>
                )}
              </Field>
            </div>
          </div>
          <div class="modal-footer pb-4">
            <Button type="submit" variant="primary" class="text-white">
              Create
            </Button>
          </div>
        </Form>
      </div>
      <style>
        {`
                  .ql-toolbar .ql-stroke {
                      fill: none;
                      stroke: #fff;
                  }
  
                  .ql-toolbar .ql-fill {
                      fill: #fff;
                      stroke: none;
                  }
  
                  .ql-toolbar .ql-picker-label {
                      color: #fff;
                  }
                  .ql-toolbar.ql-snow{
                      border:none !important;
                      border-bottom:1px solid #606060 !important;
                  }
                  .ql-container.ql-snow{
                      border:none !important;
                  }
                  select{
                      appearance:none;
                  }
              `}
      </style>
    </div>
  )
}
