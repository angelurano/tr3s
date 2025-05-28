import { mutation, query } from './_generated/server';
import { paginationOptsValidator } from 'convex/server';
import { getAuthenticatedUser } from './helpers/user.auth';
import { v } from 'convex/values';

export const getUserNotifications = query({
  args: {
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, { paginationOpts }) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db
      .query('notifications')
      .filter((q) => q.eq(q.field('userId'), user._id))
      .order('desc')
      .paginate(paginationOpts);
  }
});

export const markAsReadNotification = mutation({
  args: {
    notificationId: v.id('notifications')
  },
  handler: async (ctx, { notificationId }) => {
    const user = await getAuthenticatedUser(ctx);
    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    if (notification.userId !== user._id) {
      throw new Error('Unauthorized to mark this notification as read');
    }
    await ctx.db.patch(notificationId, {
      read: true
    });
  }
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id('notifications')
  },
  handler: async (ctx, { notificationId }) => {
    const user = await getAuthenticatedUser(ctx);
    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    if (notification.userId !== user._id) {
      throw new Error('Unauthorized to delete this notification');
    }
    await ctx.db.delete(notificationId);
  }
});
