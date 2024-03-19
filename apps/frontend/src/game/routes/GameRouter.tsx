import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { EPaths } from './enums';

const router = createBrowserRouter([
  {
    path: EPaths.ROOT,
    lazy: () => import('./Root'),
    children: [
      {
        index: true,
        lazy: () => import('./components/HomePage'),
      },
      {
        path: EPaths.GAME,
        lazy: () => import('./components/GamePage'),
      },
      {
        path: EPaths.GAME_ERROR,
        lazy: () => import('./components/GameErrorPage'),
      },
      {
        path: EPaths.RESULTS,
        lazy: () => import('./components/ResultsPage'),
      },
    ],
  },
]);

export const GameRouter = () => {
  return <RouterProvider router={router} />;
};
