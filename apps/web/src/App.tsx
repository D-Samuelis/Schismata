import { Suspense } from 'react'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
  return (
    <MantineProvider>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </MantineProvider>
  )
}

export default App
