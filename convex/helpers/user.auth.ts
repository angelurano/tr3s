import { ConvexError } from 'convex/values';
import type { MutationCtx, QueryCtx } from '../_generated/server';

export async function getAuthenticatedUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError('User not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('byExternalId', (q) => q.eq('externalId', identity.subject))
    .unique();
  if (!user) {
    throw new ConvexError('User not found');
  }

  return user;
}
