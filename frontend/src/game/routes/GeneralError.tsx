import { useNavigate, useRouteError } from 'react-router-dom';
import { EPaths } from './enums';

export default function GeneralError() {
  const navigate = useNavigate();
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error(error);

  return (
    <div id='error-page'>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <p>
        <button
          onClick={() => {
            navigate(EPaths.ROOT, { replace: true });
          }}
        >
          Home
        </button>
      </p>
    </div>
  );
}
