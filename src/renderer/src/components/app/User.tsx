import { Component } from 'solid-js'
import Navbar from '../ui/Navbar'
import { Outlet } from '@solidjs/router'
import { user } from '@renderer/store'
const User: Component = () => (
  <>
    <Navbar username={user.name ?? ''} />
    <Outlet />
  </>
)

export default User
