import { createSignal, createContext, JSX, useContext } from 'solid-js'
import { Modal, Button } from 'solid-bootstrap'
import { styled } from 'solid-styled-components'

export interface DialogProps<DialogType = 'prompt' | 'alert'> {
  onHide?: () => void
  header: string
  position?: 'top' | 'center'
  body: DialogType extends 'prompt'
    ? ({ setArgs }: { setArgs: (args: any) => void }) => JSX.Element
    : JSX.Element
  type: DialogType
  onPromptSave?: (hide: () => void, ...args: any) => void
  promptButtonTitle?: string
  darken?: number
  size?: 'lg' | 'xl' | 'sm'
  isolatedFooter?: boolean
}

const useDialogBox = () => {
  const [visible, setVisible] = createSignal(false)
  const [modalProps, setModalProps] = createSignal<DialogProps>()

  const show = (props: DialogProps) => {
    setVisible(true)
    setModalProps(props)
  }
  const [args, setArgs] = createSignal<any>()

  const hide = () => setVisible(false)

  const Footer = ({ onSave, onCancel }) => (
    <Modal.Footer>
      <Button onClick={onSave}>{modalProps()?.promptButtonTitle ?? 'Save'}</Button>
      <Button variant="outline-primary" onClick={onCancel}>
        Cancel
      </Button>
    </Modal.Footer>
  )
  const DialogBox = () => {
    return (
      <Modal
        style={{
          'backdrop-filter': 'blur(10px)',
          background: `rgba(0,0,0,${modalProps()?.darken ?? 0})`
        }}
        size={modalProps()?.size}
        darken={modalProps()?.darken}
        centered={modalProps()?.position === 'center'}
        backdrop={modalProps()?.type === 'prompt' ? 'static' : ''}
        show={visible()}
        onHide={() => {
          hide()
          if (modalProps()?.onHide) modalProps()?.onHide!()
        }}
      >
        <Modal.Header class="fs-5 fw-bold" closeButton={modalProps()?.type !== 'prompt'}>
          {modalProps()?.header}
        </Modal.Header>
        <Modal.Body>
          {modalProps()?.type === 'prompt'
            ? (modalProps()?.body as any)({ setArgs })
            : modalProps()?.body}
        </Modal.Body>
        {modalProps()?.type === 'prompt' && modalProps()?.isolatedFooter !== true && (
          <Footer
            onSave={() => modalProps()?.onPromptSave!(hide, args())}
            onCancel={() => {
              setArgs(null)
              hide()
            }}
          />
        )}
      </Modal>
    )
  }

  return { show, DialogBox,hide, ...(modalProps()?.isolatedFooter !== true ? { Footer } : null) }
}

export default useDialogBox
