/*
import { Hono, type HonoWithConvex } from 'convex-helpers/server/hono';
import type { ActionCtx } from '../_generated/server';
import { zValidator } from '@hono/zod-validator';
import { createSpaceSchema } from '.';
import { api } from '../_generated/api';

export const spacesRoute: HonoWithConvex<ActionCtx> = new Hono();

// TODO: session

spacesRoute.get('/', async (c) => {
  try {
    const spaces = await c.env.runQuery(api.spaces.getSpaces);
    return c.json(spaces);
  } catch (error) {
    console.log('Error fetching spaces:', error);
    return c.json({ error: 'Failed to fetch spaces' }, 500);
  }
});

spacesRoute.post('/', zValidator('json', createSpaceSchema), async (c) => {
  try {
    const req = c.req.valid('json'); // instead of await c.req.json()
    const space = await c.env.runMutation(api.spaces.createSpace, req);
    return c.json(space);
  } catch (error) {
    console.log('Error creating space:', error);
    return c.json({ error: 'Failed to create space' }, 500);
  }
});

*/
