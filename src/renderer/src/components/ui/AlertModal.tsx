import { Modal, Button } from 'solid-bootstrap'
import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'

const useModal = () => {
  const [show, setShow] = createSignal(false)
  const [modalData, setModalData] = createStore<any>({})

  const showConfirmModal = (data: {
    onConfirm: VoidFunction
    label: string
    message: string
    onCancel: VoidFunction
  }) => {
    setModalData(data)
    setShow(true)
  }

  const handleClose = () => {
    setShow(false)
    modalData.onCancel && modalData.onCancel()
  }
  const handleConfirm = () => {
    modalData.onConfirm && modalData.onConfirm()
    handleClose()
  }

  const ModalComponent = () => {
    return (
      <Modal size="sm" backdrop="static" centered show={show()} onHide={handleClose}>
        <h5 class="text-white text-center py-3">{modalData.label}</h5>
        <p class="text-white text-center">{modalData.message}</p>
        <div class="d-flex">
          <Button onClick={handleClose} class="rounded-0 w-100" variant="danger">
            Cancel
          </Button>
          <Button onClick={handleConfirm} class="rounded-0 w-100" variant="success">
            Confirm
          </Button>
        </div>
        <style>
          {`
                        .modal-content{
                            background:var(--bs-secondary);
                            overflow:hidden
                        }
                    `}
        </style>
      </Modal>
    )
  }

  return { showConfirmModal, ModalComponent }
}

export default useModal
