import { RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { router } from './routes';
import axios from 'axios';
import './index.css';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

axios.defaults.baseURL = API_BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
