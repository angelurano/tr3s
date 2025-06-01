import { defineSchema, defineTable } from 'convex/server';
import { v, type Infer } from 'convex/values';

export const userSchema = v.object({
  name: v.string(),
  username: v.string(),
  email: v.string(),
  imageUrl: v.string(),
  externalId: v.string(),
  tokenIdentifier: v.optional(v.string())
});

export const friendshipSchema = v.object({
  fromId: v.id('users'),
  toId: v.id('users'),
  status: v.union(v.literal('pending'), v.literal('accepted')),
  lastUpdated: v.number()
});

export const spaceSchema = v.object({
  isActive: v.boolean(),
  title: v.string(),
  authorId: v.string(),
  imagePicsumId: v.number(),
  lastActive: v.optional(v.number())
});

export const spaceUserSchema = v.object({
  userId: v.id('users'),
  spaceId: v.id('spaces'),
  status: v.union(
    v.literal('owner'),
    v.literal('pending'),
    v.literal('accepted'),
    v.literal('rejected')
  ),
  lastUpdated: v.number()
});

export const spacePresenceSchema = v.object({
  userId: v.id('users'),
  spaceId: v.id('spaces'),
  lastUpdated: v.number(),
  present: v.boolean(),
  cursorPosition: v.object({
    x: v.number(),
    y: v.number()
  }),
  typing: v.boolean()
});

export const messageSchema = v.object({
  authorId: v.id('users'),
  spaceId: v.id('spaces'),
  body: v.string()
});

export const notificationSchema = v.object({
  userId: v.id('users'),
  content: v.string(),
  read: v.boolean(),
  payload: v.optional(
    v.union(
      v.object({
        type: v.literal('spaceAccess'),
        data: v.object({
          spaceId: v.id('spaces')
        })
      }),
      v.object({
        type: v.literal('spaceRequest'),
        data: v.object({
          spaceId: v.id('spaces'),
          userId: v.id('users')
        })
      }),
      v.object({
        type: v.literal('friendRequest'),
        data: v.object({
          friendshipId: v.id('friendships'),
          fromId: v.id('users')
        })
      }), // TODO: can add more types for notifications, like 'spaceInvite', 'friendRequest', 'friendAccepted', etc.
      v.object({
        type: v.literal('friendAccepted'),
        data: v.object({
          friendshipId: v.id('friendships'),
          toId: v.id('users')
        })
      })
    )
  )
});

export default defineSchema({
  users: defineTable(userSchema)
    .index('byExternalId', ['externalId'])
    .index('byToken', ['tokenIdentifier']),
  friendships: defineTable(friendshipSchema)
    .index('byFromId_ToId', ['fromId', 'toId'])
    .index('byToId_FromId', ['toId', 'fromId'])
    .index('byFromId', ['fromId'])
    .index('byToId', ['toId'])
    .index('byFromIdAndStatus', ['fromId', 'status'])
    .index('byToIdAndStatus', ['toId', 'status']),
  spaces: defineTable(spaceSchema).index('byAuthorId', ['authorId']),
  spacesUsers: defineTable(spaceUserSchema)
    .index('byUserIdAndSpaceId', ['userId', 'spaceId'])
    .index('bySpaceId', ['spaceId']),
  spacesPresences: defineTable(spacePresenceSchema)
    .index('byUserId', ['userId'])
    .index('bySpaceId', ['spaceId'])
    .index('byUserIdAndSpaceId', ['userId', 'spaceId'])
    .index('bySpaceIdAndLastUpdated', ['spaceId', 'lastUpdated']), // This can be used to know if user is present in a space
  messages: defineTable(messageSchema)
    .index('bySpaceId', ['spaceId'])
    .index('byAuthorIdAndSpaceId', ['authorId', 'spaceId']),
  notifications: defineTable(notificationSchema)
    .index('byUserId', ['userId'])
    .index('byUserIdAndRead', ['userId', 'read'])
    .index('byUserIdAndType', ['userId', 'payload.type'])
});

// TODO: Remove this types and use Doc<'table'> from convex/values
export type User = Infer<typeof userSchema>;
export type Friendship = Infer<typeof friendshipSchema>;
export type Space = Infer<typeof spaceSchema>;
export type SpaceUser = Infer<typeof spaceUserSchema>;
export type SpacePresence = Infer<typeof spacePresenceSchema>;
export type Message = Infer<typeof messageSchema>;
export type Notification = Infer<typeof notificationSchema>;
