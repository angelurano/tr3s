import { api } from '@server/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { type Value } from 'convex/values';
import { useCallback, useEffect, useState } from 'react';
import { useSingleFlight } from './useSingleFlight';

export type PresenceData<D> = {
  created: number;
  latestJoin: number;
  user: string;
  data: D;
  present: boolean;
};

const HEARTBEAT_PERIOD = 30_000; // 30 seconds

export const usePresence = <T extends { [key: string]: Value }>(
  space: string,
  user: string,
  initialData: T,
  heartbeatPeriod = HEARTBEAT_PERIOD
) => {
  const [data, setData] = useState(initialData);
  let presence: PresenceData<T>[] | undefined = useQuery(api.presence.list, {
    space
  });
  if (presence) {
    presence = presence.filter((p) => p.user !== user);
  }
  const updatePresence = useSingleFlight(useMutation(api.presence.update));
  const heartbeat = useSingleFlight(useMutation(api.presence.heartbeat));

  // Initial update and signal departure when we leave.
  useEffect(() => {
    updatePresence({ space, user, data });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      heartbeat({ space, user });
    }, heartbeatPeriod);
    // Whenever we have any data change, it will get cleared.
    return () => clearInterval(intervalId);
  }, [heartbeat, space, user, heartbeatPeriod]);

  // Updates the data, merged with previous data state.
  const updateData = useCallback(
    (patch: Partial<T>) => {
      setData((prevState) => {
        const data = { ...prevState, ...patch };
        updatePresence({ space, user, data });
        return data;
      });
    },
    [space, user, updatePresence]
  );

  return [data, presence, updateData] as const;
};

export default usePresence;
