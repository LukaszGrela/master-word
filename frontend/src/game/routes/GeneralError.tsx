import { useNavigate, useRouteError } from 'react-router-dom';
import { EPaths } from './enums';
import { useLanguage } from '../../i18n';
import UILanguage from '../language/UILanguage';

export default function GeneralError() {
  const { getUIText: t } = useLanguage();
  const navigate = useNavigate();
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error(error);

  return (
    <div id='error-page'>
      <h1>{t('general-error-title')}</h1>
      <p>{t('general-error-message')}</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <p>
        <button
          className='primary'
          onClick={() => {
            navigate(EPaths.ROOT, { replace: true });
          }}
        >
          {t('general-error-btn-home')}
        </button>
      </p>
      <UILanguage />
    </div>
  );
}
