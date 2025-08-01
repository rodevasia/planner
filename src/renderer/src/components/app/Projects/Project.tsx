import { getProject } from '@renderer/api/projects'
import CircularProgressBar from '@renderer/components/ui/CircularProgressBar'
import Loader from '@renderer/components/ui/Loader'
import { ProgressBar } from '@renderer/components/ui/ProgressBar'
import { IProject } from '@renderer/models/Project'
import { setProject } from '@renderer/store'
import { useParams } from '@solidjs/router'
import { Component, createEffect, createResource } from 'solid-js'
import ProjectLog from './ProjectLog'
import BottomBar from '@renderer/components/ui/BottomBar'

const Project: Component = () => {
  const params = useParams()
  const [_project] = createResource(params.id, getProject)
  createEffect(() => {
    if (_project.state === 'ready') {
      setProject(_project())
    }
  })
  return (
    <>
      {_project.loading && (
        <div style={{ height: '75vh' }} class="d-flex">
          <Loader />
        </div>
      )}
      {_project.state === 'ready' && <ProjectView project={_project()} />}
    </>
  )
}

const ProjectView: Component<{ project: IProject }> = (props) => {
  const percentage = props.project.percentile
  const setPeriod = () => {
    let _start: any = new Date(props.project.currentSprint.start)
    let _end: any = new Date(props.project.currentSprint.end)
    _start = _start.toDateString().split(' ').slice(1, 3).reverse().join(' ')
    _end = _end.toDateString().split(' ').slice(1, 3).reverse().join(' ')
    return `${_start}\t/\t${_end}`
  }
  return (
    <div class="row col-12">
      <div class="card col-md-4 mx-auto my-3 ">
        <div class="m-auto py-5">
          <CircularProgressBar
            percentage={percentage}
            color={'#0D6976'}
            sqSize={150}
            strokeWidth={15}
          />
        </div>
        <div class="mx-2">
          <div data-meta="project-name" class="row">
            <p class="h3">{props.project.name}</p>
          </div>
          {props.project.currentSprint && (
            <div data-meta="sprint-details" class="my-2">
              <div class="row">
                <p class="h6 col-6">{props.project.currentSprint.name}</p>
                <p
                  class="col-6 text-right"
                  style={{ color: '#D1D1D1', 'font-size': '14px', 'text-align': 'right' }}
                >
                  {setPeriod()}
                </p>
              </div>
              <div>
                <ul>
                  {props.project.currentSprint.goals &&
                    props.project.currentSprint.goals.map((t) => <li>{t}</li>)}
                </ul>
              </div>
              <div>
                <ProgressBar
                  captions={true}
                  progress={[
                    {
                      caption: 'Completed',
                      color: 'bg-success',
                      value: props.project.count.completed / props.project.count.total
                    },
                    {
                      caption: 'In Progress',
                      color: 'bg-primary',
                      value: props.project.count.inprogress / props.project.count.total
                    },
                    {
                      caption: 'Todo',
                      color: 'bg-dark',
                      value: props.project.count.todo / props.project.count.total
                    }
                  ]}
                />
              </div>
            </div>
          )}
          {!props.project.currentSprint && (
            <div class="m-auto  text-center p-3">
              <i
                style={{ 'font-size': 'xxx-large' }}
                class="bi text-muted bi-exclamation-triangle-fill"
              />
              <p>No Active Sprint</p>
            </div>
          )}
        </div>
      </div>
      <div class="card col-md-6 mx-auto my-3 ">
        <ProjectLog projectId={props.project.id} />
      </div>
      <BottomBar />
    </div>
  )
}

export default Project
