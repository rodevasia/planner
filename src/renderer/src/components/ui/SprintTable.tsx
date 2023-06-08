import { Accordion, Table } from 'solid-bootstrap'
import { Sprint } from '../../models/Sprint'
import Chip, { ChipType } from './Chip'
import dayjs from 'dayjs'
import { JSX } from 'solid-js'
import { Issues } from '@renderer/models/Tasks'
export function SprintTableItem(props: {
  sprint: Sprint
  onClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> | undefined
  handlerKey: string | number
  tasks: Issues[]
}) {
  let title = ''
  if (props.sprint) {
    const sprint = props.sprint
    let _start: any = new Date(sprint.startDate)
    let _end: any = new Date(props.sprint.endDate)
    _start = _start.toDateString().split(' ').slice(1, 3).reverse().join(' ')
    _end = _end.toDateString().split(' ').slice(1, 3).reverse().join(' ')
    title = `${sprint.name} ( ${_start} - ${_end} )`
  }

  return (
    <Accordion.Item eventKey={`${props.handlerKey}`}>
      <Accordion.Header class="border-bottom border-secondary" onClick={props.onClick}>
        {title}
      </Accordion.Header>
      <Accordion.Body class="p-0 m-0">
        <Table responsive variant="dark" striped class="m-auto text-center py-2">
          <thead class="py-2">
            <tr class="tex-center py-2">
              <th>Task</th>
              <th>Status</th>
              <th>TID</th>
              <th>Updated on</th>
            </tr>
          </thead>
          <tbody>
            {props.tasks.map((t, index) => {
              return (
                <tr>
                  <td>{t.issue}</td>
                  <td class="d-flex justify-content-center">
                    <Chip type={ChipType.of(t.status.toLowerCase())} />
                  </td>
                  <td>{t.code}</td>
                  <td>{dayjs(t.updatedAt).format('DD MMM YYYY')}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Accordion.Body>
    </Accordion.Item>
  )
}
