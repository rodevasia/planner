import { route } from '@renderer/App';
import { notify } from '@renderer/components/ui/notify'
import { Axios, AxiosError } from 'axios';
export const network = new Axios({
  baseURL: `http://localhost:6453/api`,
  withCredentials: true,
  timeout:600000,
  headers: {
    'Content-Type': 'application/json'
  }
})

network.interceptors.response.use(
  (response) => {
    if (response.status >= 400 && response.status <= 500) {
      if (
        (response.status === 403 || response.status === 401) &&
        JSON.parse(response.data).message === 'You are not authenticated!' &&
        !window.location.pathname.split('/').includes('auth')
      ) {
        notify.error('Session Expired!')
        if(route!==undefined){
          route()('/auth/login')
        }
        return response
      }
      const data = JSON.parse(response.data)
      if (data.message && response.config.method !== 'get') {
        notify.error(data.message)
        throw new AxiosError(data.message)
      }
    }

    if (response.headers['content-type'] === 'application/json; charset=utf-8') {
      const resource = JSON.parse(response.data)
      if (resource.message === 'success') {
        response.data = resource.data
        return response
      }
    }
    return response
  },
  (err) => {
    console.log(err)
  }
)
