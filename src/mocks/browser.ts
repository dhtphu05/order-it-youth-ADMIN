import { setupWorker } from 'msw/browser';

import { getOrderITYouthAPIMock } from '../lib/api/generated';
import { posMockHandlers } from './pos';

export const worker = setupWorker(...getOrderITYouthAPIMock(), ...posMockHandlers);
