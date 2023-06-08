import { getProjectLogs } from '@renderer/api/projects'
import { ChipType } from '@renderer/components/ui/Chip'
import Loader from '@renderer/components/ui/Loader'
import { ProjectLogs } from '@renderer/models/ProjectLogs'
import { project } from '@renderer/store'
import { A } from '@solidjs/router'
import dayjs from 'dayjs'
import { createResource, For } from 'solid-js'

export default function ProjectLog(props: { projectId: string }) {
  const [logs] = createResource(props.projectId, getProjectLogs)
  return (
    <div>
      <p class="h4 m-3">History</p>
      {logs.loading && (
        <div class="w-100 h-100 d-flex">
          <Loader />
        </div>
      )}
      {logs.state === 'ready' && (
        <ul class="overflow-y">
          <For each={logs()}>
            {(t) => {
              return (
                <li
                  class="my-5"
                  data-action={t.log.action}
                  style={{ 'border-bottom': 'solid #888888 1px' }}
                >
                  <div class="d-flex">
                    <Log {...t.log} project={t.projectId} user={t.user.name} />
                    <p class="ms-auto" style={{ color: '#C4C4C4' }}>
                      {dayjs(t.updatedAt).format('DD MMM YYYY')}
                    </p>
                  </div>
                </li>
              )
            }}
          </For>
          {logs().length === 0 && (
            <p class="text-center fs-5" style={{ color: 'rgb(209, 209, 209)' }}>
              No Logs
            </p>
          )}
        </ul>
      )}
      <style>
        {`
          li::marker {
            content: ${'\u2022'};
          }
          li[data-action='deleted']::marker {
            color: var(--bs-danger);
          }
          li[data-action='moved']::marker {
            color: var(--bs-warning);
          }
          li[data-action='created']::marker {
            color: var(--bs-info);
          }
          .overflow-y {
            overflow-y: scroll;
            height: 45vh;
          }
          /* Hide the scrollbar by default */
          .overflow-y::-webkit-scrollbar {
            display: none;
          }

          /* Show the scrollbar when the user scrolls */
          .overflow-y::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            border: none;
            width: 2px !important; /* Set the width of the scrollbar thumb to 2px */
          }

          /* Track styles */
          .overflow-y::-webkit-scrollbar-track {
            background-color: transparent;
          }

          /* Show the scrollbar on hover */
          .overflow-y::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0, 0, 0, 0.4);
          }

          /* Show the scrollbar when the user interacts with it */
          .overflow-y::-webkit-scrollbar-thumb:active {
            background-color: rgba(0, 0, 0, 0.6);
          }

          /* Show the scrollbar when the user scrolls the page */
          .overflow-y:hover::-webkit-scrollbar {
            display: block;
            width: 2px !important;
          }
        `}
      </style>
    </div>
  )
}
export const Log = (props: ProjectLogs['log'] & { project: string; user: string }) => {
  let pathname
  if (props.item === 'sprint') pathname = `/project/${project.id}/sprint/`
  if (props.item === 'issue') pathname = `/project/${project.id}/issues/${props.id}`
  return (
    <div class="mb-0" style={{ color: '#C4C4C4' }}>
      {props.action === 'created' && props.item === 'sprint' && 'New sprint'}
      {props.action === 'created' && props.item === 'issue' && 'New issue'}
      {props.action !== 'created' && props.item === 'sprint' && 'Sprint'}
      {props.action !== 'created' && props.item === 'issue' && 'Issue'}
      <A href={pathname}>
        <u class="text-primary mx-1 cursor-pointer">{props.code}</u>
      </A>
      {props.action}&nbsp;
      {props.action === 'moved' && (
        <span>
          to
          <b class="mx-2" style={{ color: ChipType.of(props.status?.toLowerCase()!).borderColor }}>
            {props.status}
          </b>
        </span>
      )}
      by {props.user}
    </div>
  )
}
