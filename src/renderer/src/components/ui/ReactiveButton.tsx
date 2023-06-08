import { Button, ButtonProps, Spinner } from 'solid-bootstrap'
import { Component, createSignal } from 'solid-js'

const ReactiveButton: Component<
  ButtonProps & {
    loaderSize?: 'sm'
    type?: 'submit' | 'reset' | 'click'
    onClick?: (
      e: MouseEvent & {
        currentTarget: HTMLButtonElement
        target: Element
      }
    ) => Promise<void>
  }
> = (_props) => {
  const [props, props] = splitProps(_props, ['loaderSize'])
  const [loading, setLoader] = createSignal(false)

  return (
    <Button
      {...props}
      onClick={async (e) => {
        if (props.onClick) {
          setLoader(true)
          await props.onClick(e)
          setLoader(false)
        }
      }}
    >
      {!loading() && props.children}
      {loading() && <Spinner class="text-white" size={props.loaderSize} animation="border" />}
    </Button>
  )
}
export default ReactiveButton
