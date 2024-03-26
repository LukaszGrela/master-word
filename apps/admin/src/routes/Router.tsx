import { FC } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { EPaths } from './enums/paths';
import { default as GeneralErrorPage } from './pages/GeneralError';
import { useGetConfigurationQuery } from '../store/slices/api';

const router = createBrowserRouter([
  {
    path: EPaths.ROOT,
    errorElement: <GeneralErrorPage />,
    children: [
      {
        index: true,
        lazy: () => import('./pages/Dashboard'),
      },
      {
        path: EPaths.UNKOWN_WORDS,
        lazy: () => import('./pages/UnknownWords'),
      },
      {
        path: EPaths.CONFIG,
        lazy: () => import('./pages/Config'),
      },
    ],
  },
]);

export const Router: FC = () => {
  const { isLoading } = useGetConfigurationQuery(undefined);

  return isLoading ? 'Loading...' : <RouterProvider router={router} />;
};
