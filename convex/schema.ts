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

export const spaceSchema = v.object({
  isActive: v.boolean(),
  title: v.string(),
  authorId: v.string(),
  imagePicsumId: v.number()
});

export const spaceMemberSchema = v.object({
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

// TODO: presence in space when a user is logged
export const presenceSchema = v.object({
  userId: v.id('users'),
  spaceId: v.id('spaces'),
  lastUpdated: v.number(),
  cursorPosition: v.object({
    x: v.number(),
    y: v.number()
  }),
  present: v.boolean()
});

export default defineSchema({
  users: defineTable(userSchema)
    .index('byExternalId', ['externalId'])
    .index('byToken', ['tokenIdentifier']),
  spaces: defineTable(spaceSchema).index('byAuthorId', ['authorId']),
  spaceMembers: defineTable(spaceMemberSchema)
    .index('byUserIdAndSpaceId', ['userId', 'spaceId'])
    .index('bySpaceId', ['spaceId']),
  presence: defineTable(presenceSchema)
    .index('byUserId', ['userId'])
    .index('byUserIdAndSpaceId', ['userId', 'spaceId'])
    .index('bySpaceIdAndLastUpdated', ['spaceId', 'lastUpdated']) // This can be used to know if user is present in a space
});

export type User = Infer<typeof userSchema>;
export type Space = Infer<typeof spaceSchema>;
export type SpaceMember = Infer<typeof spaceMemberSchema>;
export type Presence = Infer<typeof presenceSchema>;
