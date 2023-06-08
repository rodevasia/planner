import { Component, createEffect, createResource, createSignal, onMount } from 'solid-js'
import { Toaster } from 'solid-toast'
import { useNavigate, useRoutes } from '@solidjs/router'
import { routers } from './router'
import { network } from './api/configuration'
import Loader from './components/ui/Loader'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { setUser } from './store'
import { produce } from 'solid-js/store'

export const [route, setTo] = createSignal<any>()
const authenticate = async () => {
  const res = await network.get('/', { baseURL: 'http://localhost:6453' })
  return res.data
}
const App: Component = () => {
  const [route] = createResource<{ path: string; user?: { name?: string; id?: string } }>(
    authenticate
  )
  const navigate = useNavigate()
  onMount(() => {
    setTo(() => navigate)
    window.electron.ipcRenderer.on('forgot-password', (event, arg) => {
      navigate(arg.path, { state: { token: arg.token } })
    })
  })
  createEffect(() => {
    if (route()?.path) {
      if (route()?.user) {
        setUser(
          produce((s) => {
            s.name = route()?.user?.name
            s.id = route()?.user?.id
          })
        )
      }
      navigate(route()?.path!, { replace: true })
    }
  }, route)
  const Routes = useRoutes(routers)
  return (
    <>
      {route.state === 'pending' && (
        <div class="vh-100 d-flex">
          <Loader />
        </div>
      )}
      <Toaster />
      <Routes />
    </>
  )
}

export default App
