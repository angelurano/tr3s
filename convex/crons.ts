import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';
import { internalMutation } from './_generated/server';

const crons = cronJobs();

const DEACTIVATE_MINUTES = 5 * 60 * 1000; // 5 min

export const deactivateInactiveSpaces = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const activeSpaces = await ctx.db
      .query('spaces')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    for (const space of activeSpaces) {
      if (space.lastActive && now - space.lastActive > DEACTIVATE_MINUTES) {
        await ctx.db.patch(space._id, {
          isActive: false
        });

        const presences = await ctx.db
          .query('spacesPresences')
          .withIndex('bySpaceId', (q) => q.eq('spaceId', space._id))
          .collect();

        for (const presence of presences) {
          await ctx.db.patch(presence._id, {
            present: false
          });
        }
      }
    }
  }
});

crons.interval(
  'deactivate-inactive-spaces',
  { minutes: 5 },
  internal.crons.deactivateInactiveSpaces
);

export default crons;
