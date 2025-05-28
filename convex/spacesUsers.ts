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

      const normalizedAuthorId = ctx.db.normalizeId('users', space.authorId);
      if (!normalizedAuthorId) {
        throw new ConvexError('Author not found');
      }

      await ctx.db.patch(existingRelation._id, {
        status: 'pending',
        lastUpdated: Date.now()
      });
      await ctx.db.insert('notifications', {
        userId: normalizedAuthorId,
        content: `${user.username} ha solicitado unirse al espacio "${space.title}"`,
        read: false,
        payload: {
          type: 'spaceRequest',
          data: {
            spaceId: normalizedSpaceId,
            userId: user._id
          }
        }
      });
    } else {
      const normalizedAuthorId = ctx.db.normalizeId('users', space.authorId);
      if (!normalizedAuthorId) {
        throw new ConvexError('Author not found');
      }
      await ctx.db.insert('notifications', {
        userId: normalizedAuthorId,
        content: `${user.username} ha solicitado unirse al espacio "${space.title}"`,
        read: false,
        payload: {
          type: 'spaceRequest',
          data: {
            spaceId: normalizedSpaceId,
            userId: user._id
          }
        }
      });
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

export const cancelJoinRequest = mutation({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceByIdString(ctx, spaceId);

    if (!spaceResult) {
      throw new ConvexError('Space not found');
    }

    const { normalizedSpaceId } = spaceResult;
    const relation = await getUserSpaceRelation(
      ctx,
      user._id,
      normalizedSpaceId
    );

    if (!relation || relation.status !== 'pending') {
      throw new ConvexError('No pending request found');
    }
    await ctx.db.delete(relation._id);

    return { success: true };
  }
});

export const acceptSpaceRequest = mutation({
  args: {
    spaceId: v.string(),
    userId: v.id('users')
  },
  handler: async (ctx, { spaceId, userId }) => {
    const author = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceByIdString(ctx, spaceId);

    if (!spaceResult) {
      throw new ConvexError('Space not found');
    }

    const { space, normalizedSpaceId } = spaceResult;

    if (space.authorId !== author._id) {
      throw new ConvexError('Only the space owner can accept requests');
    }

    const relation = await getUserSpaceRelation(ctx, userId, normalizedSpaceId);

    if (!relation || relation.status !== 'pending') {
      throw new ConvexError('No pending request found for this user');
    }

    await ctx.db.patch(relation._id, {
      status: 'accepted',
      lastUpdated: Date.now()
    });

    await ctx.db.insert('notifications', {
      userId,
      content: `Your request to join the space "${space.title}" has been accepted`,
      read: false,
      payload: {
        type: 'spaceAccess',
        data: {
          spaceId: normalizedSpaceId
        }
      }
    });
    return { success: true };
  }
});

export const rejectSpaceRequest = mutation({
  args: {
    spaceId: v.string(),
    userId: v.id('users')
  },
  handler: async (ctx, { spaceId, userId }) => {
    const author = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceByIdString(ctx, spaceId);

    if (!spaceResult) {
      throw new ConvexError('Space not found');
    }

    const { space, normalizedSpaceId } = spaceResult;

    if (space.authorId !== author._id) {
      throw new ConvexError('Only the space owner can reject requests');
    }

    const relation = await getUserSpaceRelation(ctx, userId, normalizedSpaceId);

    if (!relation || relation.status !== 'pending') {
      throw new ConvexError('No pending request found for this user');
    }

    await ctx.db.patch(relation._id, {
      status: 'rejected',
      lastUpdated: Date.now()
    });

    await ctx.db.insert('notifications', {
      userId,
      content: `Your request to join the space "${space.title}" has been rejected`,
      read: false,
      payload: {
        type: 'spaceAccess',
        data: {
          spaceId: normalizedSpaceId
        }
      }
    });
    return { success: true };
  }
});
