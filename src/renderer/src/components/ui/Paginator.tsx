import { Pagination } from 'solid-bootstrap'
import { Component, createSignal } from 'solid-js'

const Paginator: Component<{
  activePage: number
  totalPages: number
  onPageChange: (pageNumber: number) => void
}> = (props) => {
  const [active, setActive] = createSignal(props.activePage)

  const handlePageChange = (pageNumber) => {
    setActive(pageNumber)
    props.onPageChange(pageNumber)
  }

  return (
    <Pagination class="m-auto">
      <Pagination.First onClick={() => handlePageChange(1)} />
      <Pagination.Prev disabled={active() === 1} onClick={() => handlePageChange(active() - 1)} />
      {[...Array(props.totalPages)].map((_, i) => (
        <Pagination.Item active={i + 1 === active()} onClick={() => handlePageChange(i + 1)}>
          {i + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next
        disabled={active() === props.totalPages}
        onClick={() => handlePageChange(active() + 1)}
      />
      <Pagination.Last onClick={() => handlePageChange(props.totalPages)} />
    </Pagination>
  )
}

export default Paginator
