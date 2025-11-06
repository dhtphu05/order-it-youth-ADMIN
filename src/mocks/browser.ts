import { setupWorker } from 'msw/browser';

import { getOrderITYouthAPIMock } from '../lib/api/generated';

export const worker = setupWorker(...getOrderITYouthAPIMock());
