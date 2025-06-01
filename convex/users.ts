import { ConvexError, v, type Validator } from 'convex/values';
import { type UserJSON } from '@clerk/backend';
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx
} from './_generated/server';
import type { User } from './schema';

const userByExternalId = async (ctx: QueryCtx, externalId: string) => {
  return await ctx.db
    .query('users')
    .withIndex('byExternalId', (q) => q.eq('externalId', externalId))
    .unique();
};

const getCurrentUser = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
};

export const getCurrentUserThrow = async (ctx: QueryCtx) => {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new ConvexError('User not authenticated');
  }
  return user;
};

export const getCurrentUserId = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError('User not authenticated');
    }
    return user._id;
  }
});

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('User not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', identity.subject))
      .unique();

    if (user !== null) {
      const patchUser: Partial<User> = {};
      if (user.tokenIdentifier !== identity.tokenIdentifier)
        patchUser.tokenIdentifier = identity.tokenIdentifier;
      if (identity.name && user.name !== identity.name)
        patchUser.name = identity.name;
      if (identity.email && user.email !== identity.email)
        patchUser.email = identity.email;
      if (identity.nickname && user.username !== identity.nickname)
        patchUser.username = identity.nickname;
      if (identity.pictureUrl && user.imageUrl !== identity.pictureUrl)
        patchUser.imageUrl = identity.pictureUrl;
      if (Object.keys(patchUser).length > 0) {
        await ctx.db.patch(user._id, patchUser);
      }
      return user._id;
    }

    return await ctx.db.insert('users', {
      externalId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name || '',
      email: identity.email || '',
      username: identity.nickname || '',
      imageUrl: identity.pictureUrl || ''
    });
  }
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  handler: async (ctx, { data }) => {
    const userAttributes = {
      externalId: data.id,
      name: `${data.first_name} ${data.last_name}`.trim(),
      username: data.username!,
      email: data.email_addresses[0]?.email_address || '',
      imageUrl: data.image_url || ''
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert('users', userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  }
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await userByExternalId(ctx, clerkUserId);
    if (user) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `User with externalId ${clerkUserId} not found for deletion.`
      );
    }
  }
});
