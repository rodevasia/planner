import { Pagination } from 'solid-bootstrap'
import { Component, createSignal } from 'solid-js'

const Paginator: Component<{
  activePage: number
  totalPages: number
  onPageChange: (pageNumber: number) => void
}> = ({ activePage, totalPages, onPageChange }) => {
  const [active, setActive] = createSignal(activePage)

  const handlePageChange = (pageNumber) => {
    setActive(pageNumber)
    onPageChange(pageNumber)
  }

  return (
    <Pagination class='m-auto'>
      <Pagination.First onClick={() => handlePageChange(1)} />
      <Pagination.Prev disabled={active() === 1} onClick={() => handlePageChange(active() - 1)} />
      {[...Array(totalPages)].map((_, i) => (
        <Pagination.Item active={i + 1 === active()} onClick={() => handlePageChange(i + 1)}>
          {i + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next
        disabled={active() === totalPages}
        onClick={() => handlePageChange(active() + 1)}
      />
      <Pagination.Last onClick={() => handlePageChange(totalPages)} />
    </Pagination>
  )
}

export default Paginator
