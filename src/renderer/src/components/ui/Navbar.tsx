import { network } from '@renderer/api/configuration'
import { A, useNavigate } from '@solidjs/router'
import { Container, Nav, Navbar, NavDropdown } from 'solid-bootstrap'

export default function (props: { username: string }) {
  const navigator = useNavigate()
  const logout = async () => {
    await network.get('/auth/logout')
    navigator('/auth/login')
  }
  return (
    <Navbar class="max-vw-100" sticky="top" variant="dark" bg="primary" expand="md">
      <Container class="col-md-11 mx-0" fluid>
        <Navbar.Brand class='cursor-pointer' onClick={()=>navigator('/user/projects')} >Planner</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav class="me-auto" />
          <Nav.Item class="text-white">
            <A href={'/user/clients'}>Clients</A>
          </Nav.Item>
          <Nav>
            <NavDropdown title={props.username} menuVariant="dark" class="text-white">
              <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
