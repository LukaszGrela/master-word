import { FC } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { EPaths } from './enums/paths';
import { DashboardPage, GeneralErrorPage, UnknownWordsPage } from './pages';
import { useGetConfigurationQuery } from '../store/slices/api';

const router = createBrowserRouter([
  {
    path: EPaths.ROOT,
    errorElement: <GeneralErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: EPaths.UNKOWN_WORDS,
        element: <UnknownWordsPage />,
      },
    ],
  },
]);

export const Router: FC = () => {
  const { isLoading } = useGetConfigurationQuery(undefined);

  return isLoading ? 'Loading...' : <RouterProvider router={router} />;
};
