import {
  query,
  mutation,
  type QueryCtx,
  type MutationCtx
} from './_generated/server';
import { zCustomMutation, zCustomQuery } from 'convex-helpers/server/zod';
import { NoOp } from 'convex-helpers/server/customFunctions';
import { createSpaceSchema } from './sharedSchema';
import { z } from 'zod';
import { ConvexError, v } from 'convex/values';
import type { Id } from './_generated/dataModel';

const zMutation = zCustomMutation(mutation, NoOp);

async function getAuthenticatedUser(ctx: MutationCtx | QueryCtx) {
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

async function getSpaceById(ctx: MutationCtx | QueryCtx, spaceId: string) {
  const normalizedSpaceId = ctx.db.normalizeId('spaces', spaceId);
  if (!normalizedSpaceId) {
    return null;
  }

  const space = await ctx.db
    .query('spaces')
    .withIndex('by_id', (q) => q.eq('_id', normalizedSpaceId))
    .unique();

  return space ? { space, normalizedSpaceId } : null;
}

async function getUserSpaceRelation(
  ctx: QueryCtx,
  userId: Id<'users'>,
  spaceId: Id<'spaces'>
) {
  return await ctx.db
    .query('spaceMembers')
    .withIndex('byUserIdAndSpaceId', (q) =>
      q.eq('userId', userId).eq('spaceId', spaceId)
    )
    .unique();
}

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
    await ctx.db.insert('spaceMembers', {
      userId: user._id,
      spaceId,
      status: 'owner',
      lastUpdated: Date.now()
    });
    return spaceId;
  }
});

const zQuery = zCustomQuery(query, NoOp);

export const getSpaceAccess = query({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      const spaceResult = await getSpaceById(ctx, spaceId);

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
*/

export const getSpaceForNavigation = query({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    try {
      const user = await getAuthenticatedUser(ctx);
      const spaceResult = await getSpaceById(ctx, spaceId);

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

export const requestJoinSpace = mutation({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceById(ctx, spaceId);

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
      await ctx.db.insert('spaceMembers', {
        userId: user._id,
        spaceId: normalizedSpaceId,
        status: 'pending',
        lastUpdated: Date.now()
      });
    }

    return { success: true };
  }
});

export const enableUserSpace = mutation({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceById(ctx, spaceId);

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
    const spaceResult = await getSpaceById(ctx, spaceId);

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

// Función para activar un espacio (solo el owner)
export const activateSpace = mutation({
  args: {
    spaceId: v.string()
  },
  handler: async (ctx, { spaceId }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceById(ctx, spaceId);

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

// Funciones de presencia
// TODO
export const updatePresence = mutation({
  args: {
    spaceId: v.string(),
    cursorPosition: v.object({
      x: v.number(),
      y: v.number()
    }),
    present: v.boolean()
  },
  handler: async (ctx, { spaceId, cursorPosition, present }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceById(ctx, spaceId);

    if (!spaceResult) {
      throw new ConvexError('Space not found');
    }

    const { normalizedSpaceId } = spaceResult;

    // Verificar acceso al espacio
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

    // Buscar presencia existente
    const existingPresence = await ctx.db
      .query('presence')
      .withIndex('byUserIdAndSpaceId', (q) =>
        q.eq('userId', user._id).eq('spaceId', normalizedSpaceId)
      )
      .unique();

    const presenceData = {
      userId: user._id,
      spaceId: normalizedSpaceId,
      lastUpdated: Date.now(),
      cursorPosition,
      present
    };

    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, presenceData);
    } else {
      await ctx.db.insert('presence', presenceData);
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
    const spaceResult = await getSpaceById(ctx, spaceId);

    if (!spaceResult) {
      return [];
    }

    const { normalizedSpaceId } = spaceResult;

    // Verificar acceso al espacio
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

    // Obtener presencias activas (últimos 30 segundos)
    const now = Date.now();
    const cutoff = now - 30000; // 30 segundos

    const presences = await ctx.db
      .query('presence')
      .withIndex('bySpaceIdAndLastUpdated', (q) =>
        q.eq('spaceId', normalizedSpaceId).gte('lastUpdated', cutoff)
      )
      .filter((q) => q.eq(q.field('present'), true))
      .collect();

    // Obtener información de usuarios
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

export const updateSpace = mutation({
  args: {
    spaceId: v.string(),
    title: v.string(),
    imagePicsumId: v.number()
  },
  handler: async (ctx, { spaceId, title, imagePicsumId }) => {
    const user = await getAuthenticatedUser(ctx);
    const spaceResult = await getSpaceById(ctx, spaceId);

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
    const spaceResult = await getSpaceById(ctx, spaceId);

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
      .query('spaceMembers')
      .withIndex('bySpaceId', (q) => q.eq('spaceId', normalizedSpaceId))
      .collect();

    for (const member of spaceMembers) {
      await ctx.db.delete(member._id);
    }

    const presences = await ctx.db
      .query('presence')
      .filter((q) => q.eq(q.field('spaceId'), normalizedSpaceId))
      .collect();

    for (const presence of presences) {
      await ctx.db.delete(presence._id);
    }

    await ctx.db.delete(normalizedSpaceId);

    return { success: true };
  }
});
