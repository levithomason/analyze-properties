import React from 'react'

import App from '../layouts/App'
import { RouterProvider } from 'react-router5'
import router from '../../common/router'

const Root = () => (
  <RouterProvider router={router}>
    <App />
  </RouterProvider>
)

export default Root
