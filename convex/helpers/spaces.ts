import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';

export async function getUserSpaceRelation(
  ctx: MutationCtx | QueryCtx,
  userId: Id<'users'>,
  spaceId: Id<'spaces'>
) {
  return await ctx.db
    .query('spacesUsers')
    .withIndex('byUserIdAndSpaceId', (q) =>
      q.eq('userId', userId).eq('spaceId', spaceId)
    )
    .unique();
}

export function getNormalizedSpaceId(
  ctx: MutationCtx | QueryCtx,
  spaceId: string
): Id<'spaces'> | null {
  const normalizedSpaceId = ctx.db.normalizeId('spaces', spaceId);
  if (!normalizedSpaceId) {
    return null;
  }
  return normalizedSpaceId;
}

export async function getSpaceById(
  ctx: MutationCtx | QueryCtx,
  spaceId: Id<'spaces'>
) {
  const space = await ctx.db
    .query('spaces')
    .withIndex('by_id', (q) => q.eq('_id', spaceId))
    .unique();

  return space;
}

export async function getSpaceByIdString(
  ctx: MutationCtx | QueryCtx,
  spaceId: string
) {
  const normalizedSpaceId = getNormalizedSpaceId(ctx, spaceId);
  if (!normalizedSpaceId) {
    return null;
  }
  const space = await getSpaceById(ctx, normalizedSpaceId);
  return space ? { space, normalizedSpaceId } : null;
}
