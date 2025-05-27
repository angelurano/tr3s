import { query, mutation } from './_generated/server';
import { zCustomMutation, zCustomQuery } from 'convex-helpers/server/zod';
import { NoOp } from 'convex-helpers/server/customFunctions';
import { createSpaceSchema } from './schemaShared';
import { ConvexError, v } from 'convex/values';
import { getAuthenticatedUser } from './helpers/user.auth';
import { getSpaceByIdString, getUserSpaceRelation } from './helpers/spaces';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const zQuery = zCustomQuery(query, NoOp);
const zMutation = zCustomMutation(mutation, NoOp);

export const createSpace = zMutation({
  args: createSpaceSchema,
  handler: async (ctx, args) => {
    const { title, imagePicsumId } = args;
    const user = await getAuthenticatedUser(ctx);

    const existingSpaces = await ctx.db
      .query('spaces')
      .withIndex('byAuthorId', (q) => q.eq('authorId', user._id))
      .collect();
    if (existingSpaces.length >= 3) {
      throw new ConvexError('User already has 3 spaces');
    }

    const spaceId = await ctx.db.insert('spaces', {
      isActive: false,
      title,
      authorId: user._id,
      imagePicsumId
    });
    await ctx.db.insert('spacesUsers', {
      userId: user._id,
      spaceId,
      status: 'owner',
      lastUpdated: Date.now()
    });
    return spaceId;
  }
});

export const getSpaceAccess = query({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      const spaceResult = await getSpaceByIdString(ctx, spaceId);

      if (!spaceResult) {
        return {
          canAccess: false,
          status: 'space_not_found'
        };
      }

      const { space, normalizedSpaceId } = spaceResult;
      const relation = await getUserSpaceRelation(
        ctx,
        user._id,
        normalizedSpaceId
      );

      if (!relation) {
        if (!space.isActive) {
          return {
            canAccess: false,
            status: 'space_not_found'
          };
        }
        return {
          canAccess: false,
          status: 'not_related'
        };
      }

      if (relation.status === 'owner') {
        return {
          canAccess: true,
          status: 'owner',
          lastUpdated: relation.lastUpdated,
          space
        };
      }

      if (!space.isActive) {
        return {
          canAccess: false,
          status: 'space_not_found'
        };
      }

      if (relation.status === 'accepted') {
        return {
          canAccess: true,
          status: 'accepted',
          lastUpdated: relation.lastUpdated,
          space
        };
      }
      return {
        canAccess: false,
        status: relation.status,
        lastUpdated: relation.lastUpdated
      };
    } catch (error) {
      return {
        canAccess: false,
        status: 'unauthenticated'
      };
    }
  }
});

export const getSpaceForNavigation = query({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      const spaceResult = await getSpaceByIdString(ctx, spaceId);

      if (!spaceResult) {
        return {
          success: false,
          error: 'space_not_found'
        };
      }

      const { space, normalizedSpaceId } = spaceResult;
      const relation = await getUserSpaceRelation(
        ctx,
        user._id,
        normalizedSpaceId
      );

      if (!relation) {
        return {
          success: false,
          error: space.isActive ? 'not_member' : 'space_not_found'
        };
      }

      const canAccess =
        relation.status === 'owner' ||
        (space.isActive && relation.status === 'accepted');

      if (!canAccess) {
        return {
          success: false,
          error: space.isActive ? 'access_denied' : 'space_not_found'
        };
      }

      return {
        success: true,
        space,
        userStatus: relation.status,
        lastUpdated: relation.lastUpdated
      };
    } catch {
      return {
        success: false,
        error: 'unauthenticated'
      };
    }
  }
});

export const getCurrentUserSpaces = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      const spaces = await ctx.db
        .query('spaces')
        .withIndex('byAuthorId', (q) => q.eq('authorId', user._id))
        .collect();
      return spaces;
    } catch (error) {
      return [];
    }
  }
});

export const enableUserSpace = mutation({
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

    if (!relation || relation.status !== 'owner') {
      throw new ConvexError('Only space owner can enable the space');
    }

    await ctx.db.patch(normalizedSpaceId, {
      isActive: true
    });

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

export const activateSpace = mutation({
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

    if (!relation || relation.status !== 'owner') {
      throw new ConvexError('Only space owner can activate space');
    }

    await ctx.db.patch(normalizedSpaceId, {
      isActive: true
    });

    return { success: true };
  }
});

export const updateSpace = mutation({
  args: {
    spaceId: v.string(),
    title: v.string(),
    imagePicsumId: v.number()
  },
  handler: async (ctx, { spaceId, title, imagePicsumId }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceByIdString(ctx, spaceId);

    if (!spaceResult) {
      throw new ConvexError('Space not found');
    }

    const { space, normalizedSpaceId } = spaceResult;

    if (space.authorId !== user._id) {
      throw new ConvexError(
        'Unauthorized: Only the space owner can update the space'
      );
    }

    await ctx.db.patch(normalizedSpaceId, {
      title,
      imagePicsumId
    });

    return normalizedSpaceId;
  }
});

export const deleteSpace = mutation({
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

    if (space.authorId !== user._id) {
      throw new ConvexError(
        'Unauthorized: Only the space owner can delete the space'
      );
    }

    const spaceMembers = await ctx.db
      .query('spacesUsers')
      .withIndex('bySpaceId', (q) => q.eq('spaceId', normalizedSpaceId))
      .collect();

    for (const member of spaceMembers) {
      await ctx.db.delete(member._id);
    }

    const presences = await ctx.db
      .query('spacesPresences')
      .filter((q) => q.eq(q.field('spaceId'), normalizedSpaceId))
      .collect();

    for (const presence of presences) {
      await ctx.db.delete(presence._id);
    }

    await ctx.db.delete(normalizedSpaceId);

    return { success: true };
  }
});

export const heartbeatSpace = mutation({
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

    if (space.authorId === user._id) {
      await ctx.db.patch(normalizedSpaceId, {
        isActive: true,
        lastActive: Date.now()
      });
    }

    return { success: true };
  }
});

export const leaveSpace = mutation({
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

    if (!relation) {
      throw new ConvexError('User is not part of this space');
    }

    const userPresence = await ctx.db
      .query('spacesPresences')
      .withIndex('byUserIdAndSpaceId', (q) =>
        q.eq('userId', user._id).eq('spaceId', normalizedSpaceId)
      )
      .unique();

    if (userPresence) {
      await ctx.db.delete(userPresence._id);
    }

    if (relation.status === 'owner') {
      await ctx.db.patch(normalizedSpaceId, {
        isActive: false,
        lastActive: Date.now()
      });

      const allOtherPresences = await ctx.db
        .query('spacesPresences')
        .withIndex('bySpaceId', (q) => q.eq('spaceId', normalizedSpaceId))
        .collect();

      for (const presence of allOtherPresences) {
        await ctx.db.delete(presence._id);
      }
    }

    return {
      success: true,
      wasOwner: relation.status === 'owner',
      spaceDeactivated: relation.status === 'owner'
    };
  }
});

/*
export const canAccessSpace = query({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      const spaceResult = await getSpaceById(ctx, spaceId);

      if (!spaceResult) return false;

      const { space, normalizedSpaceId } = spaceResult;
      const relation = await getUserSpaceRelation(
        ctx,
        user._id,
        normalizedSpaceId
      );

      if (relation?.status === 'owner') return true;

      if (!space.isActive) return false;

      return relation?.status === 'accepted';
    } catch {
      return false;
    }
  }
});

// ! this query is not used, userId can be get from the auth context
export const getUserSpaces = zQuery({
  args: {
    userId: z.string()
  },
  handler: async (ctx, { userId }) => {
    if (userId === 'skip') {
      return [];
    }
    const spaces = await ctx.db
      .query('spaces')
      .withIndex('byAuthorId', (q) => q.eq('authorId', userId))
      .collect();
    return spaces;
  }
});
*/
