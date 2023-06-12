import { getProjects } from '@renderer/api/projects'
import { Contributor } from '@renderer/models/Project'
import { A } from '@solidjs/router'
import { Card, Col, Container, Row } from 'solid-bootstrap'
import { Component, createResource } from 'solid-js'
import Chip, { ChipType } from '../../ui/Chip'
import Loader from '../../ui/Loader'

const Projects: Component = () => {
  const [projects] = createResource(getProjects)
  return (
    <Container class="mt-5 max-vw-100" fluid>
      {projects.loading && (
        <div style={{ height: '73vh' }} class="d-flex">
          <Loader />
        </div>
      )}
      {projects.state === 'ready' && <ProjectList projects={projects()} />}
    </Container>
  )
}

const ProjectList: Component<{ projects: Contributor[] }> = (props) => {
  return (
    <>
      <Row class="justify-content-center m-0">
        {props.projects.map((project, index) => (
          <Col as={Card} sm={3} class="m-3">
            <ProjectCard {...project} />
          </Col>
        ))}
        <Col as={Card} sm={3} class="m-3 text-center">
          <A href="/user/projects/new">
            <i class="bi bi-plus m-auto text-dark" style={{ 'font-size': '8.2rem' }} />
          </A>
        </Col>
      </Row>
      <style>
        {`   
                div.display-6{
                    font-size:22px;
                }
                small{
                  color:#D3D3D3;
                  font-size:small;
                  display: -webkit-box;
                  -webkit-line-clamp: 3; /* number of lines to show */
                  line-clamp: 3; 
                  -webkit-box-orient: vertical;
                  text-overflow: ellipsis;
                }
               
            `}
      </style>
    </>
  )
}

export default Projects

function ProjectCard(props: Contributor) {
  const { project } = props
  return (
    <A style={{ 'text-decoration': 'none' }} href={`/user/project/${project.id}/home`}>
      <div style={{ height: '220px', cursor: 'pointer' }}>
        <div class="card-body pb-0">
          <div class="row">
            <div class="display-6 col-8 col-md-6">{project.name}</div>
            <div class="col-4 col-md-6">
              <Chip type={ChipType.of(project.status)} />
            </div>
          </div>
          <small class="overflow-hidden my-2">{project.description}</small>
          <small
            class={`overflow-hidden badge ${
              props.role === 'OWNER' ? 'bg-success' : 'bg-warning'
            } text-dark`}
          >
            {props.role}
          </small>
        </div>
        <div class="card-footer pt-0">
          <div class="d-flex justify-content-between ">
            <p style={{ color: '#D3D3D3' }} class="small">
              Client
            </p>
            <p style={{ color: '#D3D3D3' }} class="small">
              {project.client.name}
            </p>
          </div>
          <div class="d-flex justify-content-between  ">
            <p style={{ color: '#D3D3D3' }} class="small mb-0">
              Start Date:
            </p>
            <p style={{ color: '#D3D3D3' }} class="small mb-0">
              {new Date(project.createdAt).toDateString()}
            </p>
          </div>
        </div>
      </div>
    </A>
  )
}
