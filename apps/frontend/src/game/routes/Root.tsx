import { Outlet } from 'react-router-dom';
import { classNames } from '@repo/utils';
import { useLanguage } from '../../i18n';
import Spinner from '../Spinner/Spinner';
import { GrelaDesignIcon } from '../icons/GrelaDesignIcon';
import UILanguage from '../language/UILanguage';

import './Root.scss';

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
