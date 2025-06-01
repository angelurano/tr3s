import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthenticatedUser } from './helpers/user.auth';
import type { Doc } from './_generated/dataModel';

export type AcceptedFriendRel = Doc<'friendships'> & {
  friend: Pick<Doc<'users'>, '_id' | 'name' | 'username' | 'imageUrl'>;
};
export type AcceptedFriendsRelations = {
  user: Doc<'users'>;
  friends: AcceptedFriendRel[];
};
export const getFriendships = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const friendshipsSent = await ctx.db
      .query('friendships')
      .withIndex('byFromIdAndStatus', (q) =>
        q.eq('fromId', user._id).eq('status', 'accepted')
      )
      .collect();

    const friendshipsReceived = await ctx.db
      .query('friendships')
      .withIndex('byToIdAndStatus', (q) =>
        q.eq('toId', user._id).eq('status', 'accepted')
      )
      .collect();

    const friendships = [...friendshipsSent, ...friendshipsReceived];
    const friendsWithUsers = await Promise.all(
      friendships.map(async (friendship) => {
        const friendId =
          friendship.fromId === user._id ? friendship.toId : friendship.fromId;
        const friend = await ctx.db.get(friendId);
        if (!friend) {
          return null;
        }
        return {
          ...friendship,
          friend: {
            _id: friend._id,
            name: friend.name || '',
            username: friend.username || '',
            imageUrl: friend.imageUrl || ''
          }
        };
      })
    );

    const friendsRes = friendsWithUsers.filter(
      (friend) => friend !== null
    ) as AcceptedFriendRel[];

    return {
      user,
      friends: friendsRes
    };
  }
});

export type PendingFriendRequest = Doc<'friendships'> & {
  fromUser: Pick<Doc<'users'>, '_id' | 'name' | 'username' | 'imageUrl'>;
};
export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const requests = await ctx.db
      .query('friendships')
      .withIndex('byToIdAndStatus', (q) =>
        q.eq('toId', user._id).eq('status', 'pending')
      )
      .collect();

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const fromUser = await ctx.db.get(request.fromId);
        return {
          ...request,
          fromUser: {
            _id: fromUser?._id || null,
            name: fromUser?.name || '',
            username: fromUser?.username || '',
            imageUrl: fromUser?.imageUrl || ''
          }
        };
      })
    );

    const requestsRes = requestsWithUsers.filter(
      (request) => request.fromUser._id !== null
    ) as PendingFriendRequest[];
    return requestsRes;
  }
});

export const getFriendshipByUserId = query({
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, { userId }) => {
    const user = await getAuthenticatedUser(ctx);

    if (user._id === userId) {
      throw new ConvexError('Cannot get friendship with yourself');
    }

    const friendship = await ctx.db
      .query('friendships')
      .withIndex('byFromId_ToId', (q) =>
        q.eq('fromId', user._id).eq('toId', userId)
      )
      .first();

    if (friendship) {
      return friendship;
    }

    const reverseFriendship = await ctx.db
      .query('friendships')
      .withIndex('byToId_FromId', (q) =>
        q.eq('toId', user._id).eq('fromId', userId)
      )
      .first();

    if (reverseFriendship) {
      return reverseFriendship;
    }

    return null;
  }
});

export const sendFriendRequest = mutation({
  args: {
    toId: v.id('users')
  },
  handler: async (ctx, { toId }) => {
    const user = await getAuthenticatedUser(ctx);

    const fromId = user._id;
    if (fromId === toId) {
      throw new ConvexError('Cannot send friend request to yourself');
    }
    const existingRequest = await ctx.db
      .query('friendships')
      .withIndex('byFromId_ToId', (q) =>
        q.eq('fromId', fromId).eq('toId', toId)
      )
      .first();
    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        throw new ConvexError('Friendship already exists');
      }
      throw new ConvexError('Friend request already sent');
    }

    const existingReverseRequest = await ctx.db
      .query('friendships')
      .withIndex('byToId_FromId', (q) =>
        q.eq('toId', fromId).eq('fromId', toId)
      )
      .first();
    if (existingReverseRequest) {
      if (existingReverseRequest.status === 'accepted') {
        throw new ConvexError('Friendship already exists');
      }
      throw new ConvexError('Friend request already received');
    }

    const toUser = await ctx.db
      .query('users')
      .withIndex('by_id', (q) => q.eq('_id', toId))
      .first();
    if (!toUser) {
      throw new ConvexError('User not found');
    }

    const friendshipId = await ctx.db.insert('friendships', {
      fromId,
      toId,
      status: 'pending',
      lastUpdated: Date.now()
    });

    await ctx.db.insert('notifications', {
      userId: toId,
      content: `${user.name} has sent you a friend request`,
      read: false,
      payload: {
        type: 'friendRequest',
        data: {
          friendshipId,
          fromId
        }
      }
    });

    return friendshipId;
  }
});

export const acceptFriendRequest = mutation({
  args: {
    friendshipId: v.id('friendships')
  },
  handler: async (ctx, { friendshipId }) => {
    const user = await getAuthenticatedUser(ctx);

    const friendship = await ctx.db.get(friendshipId);
    if (!friendship || friendship.toId !== user._id) {
      throw new ConvexError('Friendship not found');
    }
    if (friendship.status !== 'pending') {
      throw new ConvexError('Friendship is not pending');
    }

    await ctx.db.patch(friendshipId, {
      status: 'accepted',
      lastUpdated: Date.now()
    });

    await ctx.db.insert('notifications', {
      userId: friendship.fromId,
      content: `${user.name} has accepted your friend request`,
      read: false,
      payload: {
        type: 'friendAccepted',
        data: {
          friendshipId,
          toId: user._id
        }
      }
    });
    return friendshipId;
  }
});

export const rejectFriendRequest = mutation({
  args: {
    friendshipId: v.id('friendships')
  },
  handler: async (ctx, { friendshipId }) => {
    const user = await getAuthenticatedUser(ctx);

    const friendship = await ctx.db.get(friendshipId);
    if (!friendship || friendship.toId !== user._id) {
      throw new ConvexError('Friendship not found');
    }
    if (friendship.status !== 'pending') {
      throw new ConvexError('Friendship is not pending');
    }

    await ctx.db.delete(friendshipId);
    return true;
  }
});

export const removeFriend = mutation({
  args: {
    friendshipId: v.id('friendships')
  },
  handler: async (ctx, { friendshipId }) => {
    const user = await getAuthenticatedUser(ctx);

    const friendship = await ctx.db.get(friendshipId);
    if (!friendship) {
      throw new ConvexError('Friendship not found');
    }
    if (friendship.fromId !== user._id && friendship.toId !== user._id) {
      throw new ConvexError('You are not part of this friendship');
    }

    await ctx.db.delete(friendshipId);
    return true;
  }
});

/*
export type FriendRel = {
  friend: Pick<Doc<'users'>, '_id' | 'name' | 'username' | 'imageUrl'>;
  type: 'sent' | 'received' | 'accepted';
};
export type FriendsRelations = {
  user: Doc<'users'>;
  friends: FriendRel[];
};
export const getFriendships = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const friendshipsSent = await ctx.db
      .query('friendships')
      .withIndex('byFromId', (q) => q.eq('fromId', user._id))
      .collect();

    const friendshipsReceived = await ctx.db
      .query('friendships')
      .withIndex('byToId', (q) => q.eq('toId', user._id))
      .collect();

    const friendships = [...friendshipsSent, ...friendshipsReceived];
    const friendsWithUsers = await Promise.all(
      friendships.map(async (friendship) => {
        const friendId =
          friendship.fromId === user._id ? friendship.toId : friendship.fromId;
        const friend = await ctx.db.get(friendId);
        if (!friend) {
          return null;
        }
        const type =
          friendship.status === 'accepted'
            ? 'accepted'
            : friendship.fromId === user._id
              ? 'sent'
              : 'received';
        return {
          ...friendship,
          friend: {
            _id: friend._id,
            name: friend.name || '',
            username: friend.username || '',
            imageUrl: friend.imageUrl || ''
          },
          type
        };
      })
    );

    const friendsRes = friendsWithUsers.filter(
      (friend) => friend !== null
    ) as FriendRel[];

    return {
      user,
      friends: friendsRes
    } as FriendsRelations;
  }
});
*/
