import { createBrowserRouter, Navigate } from 'react-router-dom'
import Workspace from './pages/Workspace'
import AppLayout from './layout/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dfa" replace /> },
      { path: ':mode', element: <Workspace /> },
    ],
  },
])