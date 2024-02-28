import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Root } from './Root';
import { HomePage } from './components/HomePage';
import { EPaths } from './enums';
import { GamePage } from './components/GamePage';
import GeneralError from './GeneralError';
import { ResultsPage } from './components/ResultsPage';

const router = createBrowserRouter([
  {
    path: EPaths.ROOT,
    element: <Root />,
    errorElement: <GeneralError />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: EPaths.GAME,
        element: <GamePage />,
      },
      {
        path: EPaths.RESULTS,
        element: <ResultsPage />,
      },
    ],
  },
]);

export const GameRouter = () => {
  return <RouterProvider router={router} />;
};
