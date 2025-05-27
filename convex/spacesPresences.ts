import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthenticatedUser } from './helpers/user.auth';
import {
  getUserSpaceRelation,
  getNormalizedSpaceId,
  getSpaceByIdString
} from './helpers/spaces';

export const upsertPresence = mutation({
  args: {
    spaceId: v.string(),
    present: v.boolean(),
    cursorPosition: v.object({
      x: v.number(),
      y: v.number()
    }),
    typing: v.optional(v.boolean())
  },
  handler: async (ctx, { spaceId, cursorPosition, present, typing }) => {
    const user = await getAuthenticatedUser(ctx);
    const normalizedSpaceId = getNormalizedSpaceId(ctx, spaceId);

    if (!normalizedSpaceId) {
      throw new ConvexError('Space not found');
    }

    const relation = await getUserSpaceRelation(
      ctx,
      user._id,
      normalizedSpaceId
    );

    if (
      !relation ||
      (relation.status !== 'owner' && relation.status !== 'accepted')
    ) {
      throw new ConvexError('Access denied');
    }

    const existingPresence = await ctx.db
      .query('spacesPresences')
      .withIndex('byUserIdAndSpaceId', (q) =>
        q.eq('userId', user._id).eq('spaceId', normalizedSpaceId)
      )
      .unique();

    const presenceData = {
      userId: user._id,
      spaceId: normalizedSpaceId,
      lastUpdated: Date.now(),
      typing: typing ?? false,
      cursorPosition,
      present
    };

    if (!existingPresence) {
      await ctx.db.insert('spacesPresences', presenceData);
    } else {
      await ctx.db.patch(existingPresence._id, presenceData);
    }

    return { success: true };
  }
});

export const getSpacePresence = query({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceByIdString(ctx, spaceId);

    if (!spaceResult) {
      return [];
    }

    const { normalizedSpaceId } = spaceResult;

    const relation = await getUserSpaceRelation(
      ctx,
      user._id,
      normalizedSpaceId
    );

    if (
      !relation ||
      (relation.status !== 'owner' && relation.status !== 'accepted')
    ) {
      return [];
    }

    const now = Date.now();
    const cutoff = now - 10000; // 10 sec

    const presences = await ctx.db
      .query('spacesPresences')
      .withIndex('bySpaceIdAndLastUpdated', (q) =>
        q.eq('spaceId', normalizedSpaceId).gte('lastUpdated', cutoff)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('present'), true),
          q.neq(q.field('userId'), user._id)
        )
      )
      .collect();

    const usersWithPresence = await Promise.all(
      presences.map(async (presence) => {
        const user = await ctx.db.get(presence.userId);
        return {
          ...presence,
          user
        };
      })
    );

    return usersWithPresence.filter((p) => p.user !== null);
  }
});
