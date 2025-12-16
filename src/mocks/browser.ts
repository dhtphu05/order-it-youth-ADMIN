import { setupWorker } from 'msw/browser';

import { getOrderITYouthAPIMock } from '../lib/api/generated';
import { donationMockHandlers } from './donations';

export const worker = setupWorker(...getOrderITYouthAPIMock(), ...donationMockHandlers);
