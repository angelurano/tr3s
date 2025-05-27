import { Hono } from 'hono';
import {
  type HonoWithConvex,
  HttpRouterWithHono
} from 'convex-helpers/server/hono';
import { type ActionCtx } from './_generated/server';
import { logger } from 'hono/logger';
import { clerkWebhookRoute } from './routes/clerkWebhook';

const app: HonoWithConvex<ActionCtx> = new Hono();

app.use('*', logger());

export const apiRoutes = app.route('/clerk-users-webhook', clerkWebhookRoute);

export type ApiRoutes = typeof apiRoutes;

export default new HttpRouterWithHono(app);
