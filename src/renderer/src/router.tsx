import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

const Connection = lazy(() => import('./components/auth/Connection'))
const Login = lazy(() => import('./components/auth/Login'))
const Projects = lazy(() => import('./components/app/Projects/Projects'))
const User = lazy(() => import('./components/app/User'))
const Register = lazy(() => import('./components/auth/Register'))
const Clients = lazy(() => import('./components/app/Clients/Clients'))
const Project = lazy(() => import('./components/app/Projects/Project'))
const CreateProject = lazy(() => import('./components/app/Projects/Create'))
const Sprints = lazy(() => import('./components/app/Sprints/Sprints'))
const Issues = lazy(() => import('./components/app/Issues/Issues'))
const CreateIssues = lazy(() => import('./components/app/Issues/Create'))
const ViewIssue = lazy(() => import('./components/app/Issues/View'))
const Invoices = lazy(() => import('./components/app/Invoices/Invoices'))
const GenerateInvoice = lazy(() => import('./components/app/Invoices/Generate'))
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'))
export const routers: RouteDefinition[] = [
  {
    path: '/auth',
    children: [
      { path: '/connection', component: Connection },
      { path: '/login', component: Login },
      { path: 'register', component: Register },
      { path: 'reset', component: ResetPassword }
    ]
  },
  {
    path: '/user',
    component: User,
    children: [
      { path: 'projects', component: Projects },
      { path: 'projects/new', component: CreateProject },
      {
        path: 'project/:id?',
        children: [
          { path: '/home', component: Project },
          { path: '/sprints', component: Sprints },
          { path: '/issues', component: Issues },
          { path: '/issues/:id?', component: ViewIssue },
          { path: '/issues/create', component: CreateIssues },
          { path: '/invoices', component: Invoices },
          { path: '/invoices/generate', component: GenerateInvoice }
        ]
      },
      { path: '/clients/', component: Clients }
    ]
  }
]
