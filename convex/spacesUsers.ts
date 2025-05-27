import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import { getSpaceByIdString, getUserSpaceRelation } from './helpers/spaces';
import { getAuthenticatedUser } from './helpers/user.auth';

export const requestJoinSpace = mutation({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceByIdString(ctx, spaceId);

    if (!spaceResult) {
      throw new ConvexError('Space not found');
    }

    const { space, normalizedSpaceId } = spaceResult;

    if (!space.isActive) {
      throw new ConvexError('Space not found');
    }

    const existingRelation = await getUserSpaceRelation(
      ctx,
      user._id,
      normalizedSpaceId
    );

    if (existingRelation) {
      if (
        existingRelation.status === 'owner' ||
        existingRelation.status === 'accepted'
      ) {
        throw new ConvexError('Already a member of this space');
      }
      if (existingRelation.status === 'pending') {
        throw new ConvexError('Request already pending');
      }
      if (existingRelation.status === 'rejected') {
        // 5 mins since last rejection
        const now = Date.now();
        const minutesSinceRejection =
          (now - existingRelation.lastUpdated) / (1000 * 60);
        const canRequestAgain = minutesSinceRejection >= 5;

        if (!canRequestAgain) {
          throw new ConvexError('Must wait before requesting again');
        }
      }

      await ctx.db.patch(existingRelation._id, {
        status: 'pending',
        lastUpdated: Date.now()
      });
    } else {
      await ctx.db.insert('spacesUsers', {
        userId: user._id,
        spaceId: normalizedSpaceId,
        status: 'pending',
        lastUpdated: Date.now()
      });
    }

    return { success: true };
  }
});
