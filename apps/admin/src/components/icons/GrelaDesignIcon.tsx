import { FC } from 'react';
import { IProps } from './types';
import './GrelaDesignIcon.scss';

export const GrelaDesignIcon: FC<IProps> = ({
  className,
  width = '300',
  height = '230',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1"
    id="gd-logo"
    className={className}
    width={width}
    height={height}
    viewBox="0 0 300 230"
    fill="currentColor"
  >
    <g>
      <path d="M277.36,18.216h5.177h1.928c0.915,0,1.422,0,1.625,0c0.609,0,1.016,0.103,1.219,0.307 c0.304,0.304,0.406,1.22,0.406,2.645v1.019h5.481v-1.629c0-1.017,0-1.73,0-2.137c-0.101-1.119-0.507-1.833-1.117-2.138 c-0.406-0.203-0.914-0.306-1.727-0.406c1.219-0.205,2.031-0.611,2.438-1.222c0.406-0.509,0.61-1.729,0.61-3.358 c0-0.814,0-1.526-0.103-2.137c0-0.51-0.203-1.019-0.508-1.527c-0.608-0.917-1.625-1.527-2.944-1.628 c-0.61-0.103-2.334-0.103-5.28-0.103h-2.03h-10.762v16.284h5.584V18.216z M277.36,10.279h5.177h1.928 c1.625,0,2.538,0.101,2.742,0.203c0.406,0.101,0.609,0.611,0.609,1.527c0,0.813-0.203,1.424-0.507,1.526 c-0.203,0.203-1.117,0.203-2.844,0.306h-1.928h-5.177V10.279z" />
      <path d="M266.293,33.787C245.583,12.926,216.851,0,185.279,0h-70.559C83.045,0,54.415,12.926,33.603,33.787 C12.791,54.651,0,83.349,0,115c0,63.301,51.473,115,114.721,115h30.051V97.7H65.177v40.912h29.036v47.424 C63.451,177.081,40.913,148.584,40.913,115c0-20.354,8.224-38.774,21.624-52.208c13.401-13.433,31.878-21.676,52.184-21.676h70.559 c20.304,0,38.781,8.243,52.081,21.676c13.401,13.434,21.726,31.855,21.726,52.208c0,33.584-22.64,62.081-53.401,71.036l0.102-88.54 h-50.558L155.125,230h30.154c40.913,0,76.954-21.779,97.258-54.344C293.604,158.048,300,137.186,300,115 c0-22.289-6.396-43.047-17.463-60.757C277.969,46.815,272.487,39.996,266.293,33.787z" />
      <path d="M267.207,25.647c0.711,0.609,1.422,1.12,2.235,1.423c0.709,0.306,1.826,0.611,3.247,0.713 c0.813,0.102,2.539,0.102,5.28,0.203c1.625,0,3.147,0.102,4.568,0.102c1.117,0,2.03,0,3.046,0c4.061,0,7.208-0.203,9.239-0.713 c2.538-0.509,4.162-2.239,4.669-4.986c0.305-2.036,0.508-4.681,0.508-8.141c0-5.802-0.508-9.465-1.523-10.993 c-0.813-1.322-1.929-2.136-3.554-2.442C292.893,0.306,289.035,0,283.553,0c-0.305,0-0.609,0-1.016,0 c-5.279,0.101-9.137,0.203-11.371,0.611c-2.639,0.406-4.364,1.729-5.076,3.867c-0.609,1.935-0.914,5.088-0.914,9.668 c0,4.07,0.203,7.022,0.609,8.752C265.99,23.915,266.497,24.832,267.207,25.647z M268.933,6.614 c0.407-1.729,1.523-2.748,3.452-3.155c1.624-0.304,4.569-0.507,8.833-0.507c0.507,0,0.914,0,1.319,0 c2.945,0.102,5.178,0.102,6.6,0.102c1.726,0.101,3.046,0.202,3.857,0.405c0.813,0.103,1.523,0.408,2.133,0.917 c0.508,0.51,0.913,1.119,1.117,1.935c0.304,1.323,0.507,3.867,0.507,7.531c0,3.563-0.203,6.208-0.609,7.733 c-0.203,0.815-0.507,1.426-1.015,1.935c-0.508,0.509-1.117,0.917-1.828,1.019c-0.812,0.203-1.625,0.304-2.538,0.408 c-0.812,0-3.554,0.1-7.919,0.202h-0.305l-6.294-0.202c-1.726,0-3.146-0.104-4.265-0.307c-1.726-0.408-2.74-1.425-3.046-3.155 c-0.304-1.425-0.507-3.969-0.507-7.632C268.426,10.38,268.629,8.039,268.933,6.614z" />
    </g>
  </svg>
);
