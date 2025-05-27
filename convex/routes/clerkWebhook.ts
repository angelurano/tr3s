import { Hono, type HonoWithConvex } from 'convex-helpers/server/hono';
import type { ActionCtx } from '../_generated/server';
import type { WebhookEvent } from '@clerk/backend';
import { Webhook } from 'svix';
import { internal } from '../_generated/api';

export const clerkWebhookRoute: HonoWithConvex<ActionCtx> = new Hono();

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error('Error verifying webhook event', error);
    return null;
  }
}

clerkWebhookRoute.post('/', async (c) => {
  const event = await validateRequest(c.req.raw);
  if (!event) {
    return new Response('Error occurred validating', { status: 400 });
  }

  switch (event.type) {
    case 'user.created': // intentional fallthrough
    case 'user.updated':
      await c.env.runMutation(internal.users.upsertFromClerk, {
        data: event.data
      });
      break;

    case 'user.deleted': {
      const clerkUserId = event.data.id!;
      await c.env.runMutation(internal.users.deleteFromClerk, { clerkUserId });
      break;
    }
    default:
      console.log('Ignored Clerk webhook event', event.type);
  }

  return new Response('Webhook processed', { status: 200 });
});
