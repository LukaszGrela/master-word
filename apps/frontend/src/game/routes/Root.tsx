import { Outlet } from 'react-router-dom';
import { classNames } from '@repo/utils';
import { useLanguage } from '../../i18n';
import Spinner from '../Spinner/Spinner';
import { GrelaDesignIcon } from '../icons/GrelaDesignIcon';
import { UILanguage } from '../language';

import './Root.scss';
import GeneralError from './GeneralError';

export const Root = () => {
  const { loadedLanguage, loading } = useLanguage();
  const showLoading = loading && !loadedLanguage;

  return (
    <div className={classNames('master-word')}>
      {showLoading && <Spinner />}
      {!showLoading && (
        <>
          <Outlet />
          <p className="footer read-the-docs">
            <GrelaDesignIcon />
            <span>GrelaDesign (c) 2024</span>{' '}
            <span>[v{import.meta.env.VITE_VERSION}]</span>
          </p>
          <UILanguage />
        </>
      )}
    </div>
  );
};
/* v8 ignore start */

export function Component() {
  return <Root />;
}

Component.displayName = 'LazyRoot';

export function ErrorBoundry() {
  return <GeneralError />;
}

ErrorBoundry.displayName = 'LazyGeneralError';
/* v8 ignore stop */
