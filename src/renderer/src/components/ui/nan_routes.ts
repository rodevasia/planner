import { project } from "@renderer/store"
import { BootstrapIcons } from "./BottomBar"

export const Routes:({project})=>{
    path: string,
    label: string,
    icon: BootstrapIcons,
    activeIcon: BootstrapIcons
}[] =({project})=> [
        {
            path: `/user/project/${project}/home`,
            label: 'Home',
            icon: 'bi bi-house',
            activeIcon: 'bi bi-house-fill'

        },
        {
            path: `/user/project/${project}/sprints`,
            label: 'Sprint',
            icon: 'bi bi-calendar-check',
            activeIcon: 'bi bi-calendar-check-fill',
        },

        {
            path: `/user/project/${project}/issues`,
            label: 'Issues',
            icon: 'bi bi-ui-checks-grid',
            activeIcon: 'bi bi-ui-checks-grid'
        },
        // {
        //     path: '/user/project/${project}/settings',
        //     label: 'Settings',
        //     icon: 'bi bi-gear',
        //     activeIcon: 'bi bi-gear-fill'
        // },
        {
            activeIcon:'bi bi-file-text-fill',
            icon:'bi bi-file-text',
            label:'Invoices',
            path:`/user/project/${project}/invoices`
        }
    ]