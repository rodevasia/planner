import toast from 'solid-toast'

export const notify = {
  success(message: string) {
    toast.success(message, {
      className: 'bg-secondary',
      position: 'top-center'
    })
  },
  error(message: string) {
    toast.error(message, {
      className: 'bg-secondary ',
      position: 'top-center'
    })
  },
  info(message:string){
    toast(message,{
      icon:<i class='bi bi-info-circle text-primary'></i>,
      className:"bg-secondary",
      position:'top-center'
    })
  }
}
