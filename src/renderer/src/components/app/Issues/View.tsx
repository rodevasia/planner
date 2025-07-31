import { deleteTask, getTask, updateTask } from '@renderer/api/tasks'
import useModal from '@renderer/components/ui/AlertModal'
import Chip, { ChipType } from '@renderer/components/ui/Chip'
import Navigator from '@renderer/components/ui/Navigator'
import SelectBox from '@renderer/components/ui/SelectBox'
import { notify } from '@renderer/components/ui/notify'
import { Issues, TaskStatus } from '@renderer/models/Tasks'
import { project } from '@renderer/store'
import { useParams } from '@solidjs/router'
import { Col } from 'solid-bootstrap'
import { Component, createResource, createSignal } from 'solid-js'
import AttachmentsView from './AttachmentsView'
import TimeTracker from './TimeTracker'

const ViewIssue: Component = () => {
  const params = useParams()
  const [task, { refetch }] = createResource<Issues, string>(params.id, getTask)

  const [status, setStatus] = createSignal<string | null>(null)
  const [update, setUpdate] = createSignal(false)
  const modal = useModal()

  return (
    <>
      <Navigator label="Issue Details" />
      <div class="text-white px-3 col-md-11 m-auto py-3 ">
        <div class="d-flex my-3">
          <span class="h4 mx-2 my-auto">{task()?.code}</span>
          <span class=" my-auto mx-3">
            {status() && !update() && (
              <Chip
                class="cursor-pointer"
                onClick={() => {
                  if (task()?.duration) {
                    setUpdate(true)
                  }
                }}
                type={ChipType.of(status()?.toLowerCase()!)}
              />
            )}
            {update() && (
              <Col style={{ width: '200px' }} sm={12}>
                <SelectBox
                  placeholder="Change Status"
                  items={[TaskStatus.DONE, TaskStatus.INPROGRESS]
                    .filter((m) => m !== status())
                    .map((q) => ({ label: q, value: q }))}
                  onSelect={(data: string) => {
                    modal.showConfirmModal({
                      label: 'Are you sure',
                      message: 'This action will update the task status',
                      onConfirm: async () => {
                        updateTask(
                          { status: data, code: task()?.code!, projectId: project.id as string },
                          task()?.id!,
                          'status'
                        )
                        refetch()
                      },
                      onCancel() {
                        setUpdate(false)
                      }
                    })
                  }}
                />
              </Col>
            )}
          </span>
          {status() !== TaskStatus.DONE && (
            <div class="">
              <TimeTracker
                onStart={(status) => setStatus(status)}
                status={task()?.status!}
                onStop={async (time, status) => {
                  
                  const action = !task()?.duration ? 'first_stop' : 'stop'

                  await updateTask(
                    {
                      duration: time.toString(),
                      status,
                      projectId: project.id,
                      code: task()?.code
                    },
                    task()?.id!,
                    action
                  )
                  window.history.back()
                }}
                onPause={async (time, status) => {
                  const action = !task()?.duration ? 'first_pause' : 'pause'
                  await updateTask(
                    {
                      duration: time.toString(),
                      status,
                      projectId: project.id as string,
                      code: task()?.code
                    },
                    task()?.id!,
                    action
                  )
                  refetch()
                }}
                initialDuration={parseInt(task()?.duration ?? '0')}
              />
            </div>
          )}
          <span
            onClick={() =>
              modal.showConfirmModal({
                onConfirm: async () => {
                  await deleteTask(task()?.id!, {
                    projectId: project.id as string,
                    code: task()?.code!,
                    status: task()?.status!
                  })
                  notify.info('Task deleted')
                  window.history.back()
                },
                label: 'Are you sure',
                message: 'This cannot be undone',
                onCancel: () => {}
              })
            }
            class="ms-auto my-auto bi bi-trash fs-4 trashIco"
          />
        </div>
        <div>
          <span class="display-6">{task()?.issue}</span>
          <div class="mt-4 font">{task()?.description}</div>
          <h5 class="my-3">Attachments</h5>
          {task()?.attachments.map((t, i) => {
            return <AttachmentsView src={t} key={i} />
          })}
        </div>
      </div>
      <style>
        {`
                    .trashIco:hover{
                        color:var(--bs-danger);
                        cursor:pointer;
                    }
                    .trashIco:active{
                        font-size:1.25rem !important;
                    }
                    span.display-6{
                        font-weight:400;
                    }
                    p{
                        font-size:medium !important;
                    }
                `}
      </style>
      <modal.ModalComponent />
    </>
  )
}
export default ViewIssue
