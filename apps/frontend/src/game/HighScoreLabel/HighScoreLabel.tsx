import { FC } from 'react';
import { useLanguage } from '../../i18n';
import './HighScoreLabel.scss';

const HighScoreLabel: FC = (): JSX.Element => {
  const { getUIText: t } = useLanguage();

  return <span className="highscore-label">{t('highscore-label')}</span>;
};

export default HighScoreLabel;
