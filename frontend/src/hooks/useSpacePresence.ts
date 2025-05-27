import { api } from '@server/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSingleFlight } from './useSingleFlight';
import { useDebounce } from './useDebounce';

export interface CursorPosition {
  x: number;
  y: number;
}

export interface PresenceUser {
  _id: string;
  _creationTime: number;
  userId: string;
  spaceId: string;
  lastUpdated: number;
  present: boolean;
  cursorPosition: CursorPosition;
  typing: boolean;
  user: {
    _id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    externalId: string;
  } | null;
}

const HEARTBEAT_PERIOD = 5_000; // 5 sec
const CURSOR_UPDATE_DELAY = 75; // 57ms

export const useSpacePresence = (spaceId: string) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    x: 0,
    y: 0
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isMouseInCanvas, setIsMouseInCanvas] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const cursorPositionRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const isMouseInCanvasRef = useRef<boolean>(true);
  const isPageVisibleRef = useRef<boolean>(true);

  const presenceUsers = useQuery(api.spacesPresences.getSpacePresence, {
    spaceId
  });
  const upsertPresence = useSingleFlight(
    useMutation(api.spacesPresences.upsertPresence)
  );
  const spaceHeartbeat = useSingleFlight(
    useMutation(api.spaces.heartbeatSpace)
  );

  const debouncedCursorPosition = useDebounce(
    cursorPosition,
    CURSOR_UPDATE_DELAY
  );

  const updateCursorPosition = useCallback((position: CursorPosition) => {
    setCursorPosition(position);
    cursorPositionRef.current = position;
  }, []);

  const setMouseInCanvas = useCallback((inCanvas: boolean) => {
    setIsMouseInCanvas(inCanvas);
    isMouseInCanvasRef.current = inCanvas;
  }, []);

  const setPageVisible = useCallback((visible: boolean) => {
    setIsPageVisible(visible);
    isPageVisibleRef.current = visible;
  }, []);

  const updateTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  useEffect(() => {
    if (debouncedCursorPosition.x === 0 && debouncedCursorPosition.y === 0)
      return;

    if (isMouseInCanvas && isPageVisible) {
      upsertPresence({
        spaceId,
        present: true,
        cursorPosition: debouncedCursorPosition,
        typing: isTyping
      });
    }
  }, [
    debouncedCursorPosition,
    isTyping,
    spaceId,
    upsertPresence,
    isMouseInCanvas,
    isPageVisible
  ]);

  useEffect(() => {
    upsertPresence({
      spaceId,
      present: true,
      cursorPosition: { x: 0, y: 0 },
      typing: false
    });

    spaceHeartbeat({ spaceId });

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setPageVisible(isVisible);

      if (!isVisible) {
        upsertPresence({
          spaceId,
          present: true,
          cursorPosition: cursorPositionRef.current,
          typing: false
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const heartbeatInterval = setInterval(() => {
      const shouldShowCursor =
        isMouseInCanvasRef.current && isPageVisibleRef.current;

      upsertPresence({
        spaceId,
        present: true,
        cursorPosition: shouldShowCursor
          ? cursorPositionRef.current
          : { x: -1, y: -1 },
        typing: isTyping
      });
      spaceHeartbeat({ spaceId });
    }, HEARTBEAT_PERIOD);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      upsertPresence({
        spaceId,
        present: false,
        cursorPosition: cursorPositionRef.current,
        typing: false
      });
    };
  }, [spaceId, upsertPresence, spaceHeartbeat, setPageVisible]);

  const onlineUsers =
    presenceUsers?.filter((user) => {
      const timeSinceLastUpdate = Date.now() - user.lastUpdated;
      return user.present && timeSinceLastUpdate < 10000;
    }) || [];

  return {
    onlineUsers,
    updateCursorPosition,
    updateTyping,
    setMouseInCanvas,
    isTyping
  };
};
