import { createBrowserRouter } from 'react-router-dom'
import { Loading } from '../components/ui/Loading'
import { lazy, Suspense } from 'react'

const NotFound = lazy(() => import('../pages/NotFound.tsx'))
const DowloadPage = lazy(() => import('../pages/DownloadPage.tsx'))
const UploadPage = lazy(() => import('../pages/UploadPage.tsx'))

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFound />,
    element: (
      <Suspense fallback={<Loading />}>
        <UploadPage />
      </Suspense>
    )
  },
  {
    path: '/dowload',
    element: (
      <Suspense fallback={<Loading />}>
        <DowloadPage />
      </Suspense>
    )
  },
])

export { router }