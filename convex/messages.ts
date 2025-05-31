import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthenticatedUser } from './helpers/user.auth';
import { getSpaceByIdString, getUserSpaceRelation } from './helpers/spaces';
import { createMessageSchema } from './schemaShared';

const FILTER_MESSAGES_TIME = 5 * 60 * 1000; // 5 min
const FILTER_MAX_MESSAGES = 50;
export const getSpaceMessages = query({
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

    const maxTimeAgo = Date.now() - FILTER_MESSAGES_TIME;

    const messages = await ctx.db
      .query('messages')
      .withIndex('bySpaceId', (q) => q.eq('spaceId', normalizedSpaceId))
      .filter((q) => q.gte(q.field('_creationTime'), maxTimeAgo))
      .order('desc')
      .take(FILTER_MAX_MESSAGES);

    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        return {
          ...message,
          author: {
            _id: author?._id || null,
            name: author?.name || 'Unknown',
            username: author?.username || 'unknown',
            email: author?.email || '',
            imageUrl: author?.imageUrl || ''
          }
        };
      })
    );

    return messagesWithUsers.filter((message) => message.author !== null);
  }
});

export const sendMessage = mutation({
  args: {
    spaceId: v.id('spaces'),
    body: v.string()
  },
  handler: async (ctx, { spaceId, body }) => {
    const schemaResult = createMessageSchema.safeParse({ body });
    if (!schemaResult.success) {
      throw new ConvexError(schemaResult.error.message);
    }

    const user = await getAuthenticatedUser(ctx);

    const relation = await getUserSpaceRelation(ctx, user._id, spaceId);

    if (
      !relation ||
      (relation.status !== 'owner' && relation.status !== 'accepted')
    ) {
      throw new ConvexError('Access denied');
    }

    const messageId = await ctx.db.insert('messages', {
      authorId: user._id,
      spaceId,
      body: body.trim()
    });

    return messageId;
  }
});

// Eliminar un mensaje (solo el autor puede eliminar sus propios mensajes)
export const deleteMessage = mutation({
  args: {
    messageId: v.id('messages')
  },
  handler: async (ctx, { messageId }) => {
    const user = await getAuthenticatedUser(ctx);
    const message = await ctx.db.get(messageId);

    if (!message) {
      throw new ConvexError('Message not found');
    }

    if (message.authorId !== user._id) {
      throw new ConvexError('Only the author can delete their message');
    }

    await ctx.db.delete(messageId);
    return { success: true };
  }
});
