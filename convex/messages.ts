import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthenticatedUser } from './helpers/user.auth';
import { getSpaceById, getUserSpaceRelation } from './helpers/spaces';
import { createMessageSchema } from './schemaShared';
import type { Doc } from './_generated/dataModel';

const FILTER_MESSAGES_TIME = 5 * 60 * 1000; // 5 min
const FILTER_MAX_MESSAGES = 50;

export type MessageResult = Doc<'messages'> & {
  author: Pick<Doc<'users'>, '_id' | 'name' | 'username' | 'imageUrl'>;
};
export const getSpaceMessages = query({
  args: {
    spaceId: v.id('spaces')
  },
  handler: async (ctx, { spaceId }) => {
    const user = await getAuthenticatedUser(ctx);

    const space = await getSpaceById(ctx, spaceId);
    if (!space) {
      throw new ConvexError('Space not found');
    }

    if (!space.isActive) {
      throw new ConvexError('Space is not active');
    }

    const relation = await getUserSpaceRelation(ctx, user._id, spaceId);

    if (
      !relation ||
      (relation.status !== 'owner' && relation.status !== 'accepted')
    ) {
      throw new ConvexError('Access denied');
    }

    const maxTimeAgo = Date.now() - FILTER_MESSAGES_TIME;

    const messages = await ctx.db
      .query('messages')
      .withIndex('bySpaceId', (q) => q.eq('spaceId', spaceId))
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
            imageUrl: author?.imageUrl || ''
          }
        };
      })
    );

    const res: MessageResult[] = messagesWithUsers.filter(
      (message) => message.author !== null && message.author._id !== null
    ) as MessageResult[];
    return res;
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
