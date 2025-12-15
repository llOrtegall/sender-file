import { createBrowserRouter } from 'react-router-dom'
import { Loading } from '../components/ui/Loading'
import { lazy, Suspense } from 'react'

const Layout = lazy(() => import('./layout.tsx'))
const NotFound = lazy(() => import('../pages/NotFound.tsx'))
const DowloadPage = lazy(() => import('../pages/DownloadPage.tsx'))
const UploadPage = lazy(() => import('../pages/UploadPage.tsx'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <UploadPage />
          </Suspense>
        )
      },
      {
        path: '/download/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <DowloadPage />
          </Suspense>
        )
      },
    ],
    errorElement: (
      <Suspense fallback={<Loading />}>
        <NotFound />
      </Suspense>
    )
  }
])

export { router }