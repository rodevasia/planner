import { getTasks } from '@renderer/api/tasks'
import { Issues as IssuesInterface } from '@renderer/models/Tasks'
import { project } from '@renderer/store'
import { A } from '@solidjs/router'
import dayjs from 'dayjs'
import { Button, Container, Spinner, Table } from 'solid-bootstrap'
import { Component, createResource, createSignal } from 'solid-js'
import duration from 'dayjs/plugin/duration'
import Chip, { ChipType } from '@renderer/components/ui/Chip'
import Paginator from '@renderer/components/ui/Paginator'
import BottomBar from '@renderer/components/ui/BottomBar'

dayjs.extend(duration)

const TasksPage: Component = () => {
  const [page, setPage] = createSignal(1)
  const _getTasks = (page) => getTasks(project.id, undefined, page)
  const [tasks] = createResource(page, _getTasks)
  return (
    <>
      {tasks.loading && (
        <Container fluid style={{ height: '75vh' }} class="w-100 d-flex">
          <Spinner class="m-auto" variant="primary" animation="border" />
        </Container>
      )}
      {tasks.state === 'ready' && (
        <>
          <Issues tasks={tasks().rows} page={page()} />
          <div class="mb-5 mt-3 pb-5 d-flex">
            <Paginator
              activePage={page()}
              totalPages={Math.ceil(tasks().count / 10)}
              onPageChange={(page) => {
                setPage(page)
              }}
            />
          </div>
        </>
      )}
    </>
  )
}

const Issues: Component<{ tasks: IssuesInterface[]; page: number }> = (props) => {
  return (
    <div class=" col-md-11 m-auto">
      <BottomBar />
      <div class="py-3 row border-bottom border-secondary">
        <p class="text-white display-6 col-md-6 py-md-0 my-md-0">Issues</p>
        <div class="col-md-4 d-flex search-input mx-md-4 py-0">
          <div class="col-11">
            <input type="text" placeholder="Search Issue" class="form-control  my-2" />
          </div>
          <div style={{ color: '#888888' }} class="bi bi-search col-1 my-auto" />
        </div>
        <A class="col-md-1 d-flex text-white" href={`/user/project/${project.id}/issues/create`}>
          <Button class="my-auto" variant="primary">
            Create
          </Button>
        </A>
      </div>
      <div class="mt-4">
        <Table responsive variant="dark" striped class="m-auto text-center py-2 overflow-visible">
          <thead class="py-2">
            <tr class="text-center py-2">
              <th>Sl.No.</th>
              <th>Task</th>
              <th>Duration</th>
              <th>Status</th>
              <th>TID</th>
              <th>Updated on</th>
            </tr>
          </thead>
          <tbody class="text-center">
            {props.tasks.map((t, index) => {
              return (
                <tr>
                  <td>{(props.page - 1) * 10 + (index + 1)}</td>
                  <td>{t.issue}</td>
                  <td>
                    {dayjs
                      .duration(parseInt(t.duration ?? '0'), 'milliseconds')
                      .format('HH : mm : ss')}
                  </td>
                  <td class="d-flex justify-content-center overflow-visible">
                    <Chip type={ChipType.of(t.status.toLowerCase())} />
                  </td>
                  <td class="text-primary">
                    <A href={`/user/project/${project.id}/issues/${t.id}`}>{t.code}</A>
                  </td>
                  <td>{dayjs(t.updatedAt).format('DD MMM YYYY')}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
      <style>
        {`
                .search-input  input{
                    border:none;
                    box-shadow:none;
                    outline:none;
                    background:transparent;
                    color:white !important;
                }
                .search-input  input:focus{
                     border:none;
                    box-shadow:none;
                    outline:none;
                    background:transparent;

                }
                ::placeholder{
                    color:#888888 !important;
                }
                .search-input{
                    background:#606060;
                    border-radius:8px;
                }
            `}
      </style>
    </div>
  )
}
export default TasksPage
