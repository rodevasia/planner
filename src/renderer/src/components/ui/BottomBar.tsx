import { A } from '@solidjs/router'
import { Routes } from './nan_routes'
import { project } from '@renderer/store'
import { Component } from 'solid-js'

const BottomBar: Component = () => {
  return (
    <div class="panel d-flex justify-content-around mx-auto my-auto">
      {project.id &&
        Routes({ project: project.id }).map((route) => {
          return (
            <BottomDockItem
              label={route.label}
              hoverColor={'#30A3B2'}
              route={route.path}
              project={project.id}
              icon={route.icon}
              activeIcon={route.activeIcon}
            />
          )
        })}
      <style>
        {`
          .panel {
            position: fixed;
            bottom: 10px;
            right: 25%;
            left: 25%;
            width: 450px;
            height: 75px;
            background: rgba(48, 163, 179, 0.38);
            box-shadow: 0px 0px 56px -23px #0d6976;
            backdrop-filter: blur(4px);
            border-radius: 62px;
            z-index:999;
          }
        `}
      </style>
    </div>
  )
}
export default BottomBar

function BottomDockItem(props: {
  hoverColor: Color
  icon: BootstrapIcons
  activeIcon: BootstrapIcons
  label: string
  route: string
  project: string
}) {
  return (
    <A href={props.route} activeClass="text-primary" class="text-center wr-link">
      <A
        href={props.route}
        inactiveClass={`${props.icon}`}
        activeClass={`${props.activeIcon} text-primary`}
        class="link"
      ></A><br/>
      {props.label}
      <style>
        {`
        .wr-link:hover{
          color:${props.hoverColor}
        }
            a{text-decoration:none }
            a.link {
              font-size: 30px;
            }
          `}
      </style>
    </A>
  )
}

export type Color =
  | `#${string}`
  | `rgb(${number},${number},${number})`
  | `rgba(${number},${number},${number},${number})`
  | `hsl(${number},${number}%,${number}%)`
  | `hsla(${number},${number}%,${number}%,${number})`
export type BootstrapIcons = `bi bi-${string}`
