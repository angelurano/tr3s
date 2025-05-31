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

const HEARTBEAT_PERIOD = 5 * 1000; // 5 sec
const CURSOR_UPDATE_DELAY = 66; // 66ms
const INPUT_TYPING_TIMEOUT = 2 * 1000; // 2 sec

const INITIAL_CURSOR_POSITION: CursorPosition = {
  x: 0,
  y: 0
};
const OUTSIDE_CURSOR_POSITION: CursorPosition = {
  x: -1,
  y: -1
};

export const useSpacePresence = (spaceId: string) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    x: 0,
    y: 0
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isMouseInCanvas, setIsMouseInCanvas] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);

  const cursorPositionRef = useRef<CursorPosition>(INITIAL_CURSOR_POSITION);
  const isMouseInCanvasRef = useRef<boolean>(true);
  const isPageVisibleRef = useRef<boolean>(true);
  const isTypingRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const setPageVisible = useCallback((visible: boolean) => {
    setIsPageVisible(visible);
    isPageVisibleRef.current = visible;
  }, []);

  const updateCursorPosition = useCallback((position: CursorPosition) => {
    setCursorPosition(position);
    cursorPositionRef.current = position;
  }, []);

  const notifyMouseInCanvas = useCallback((inCanvas: boolean) => {
    setIsMouseInCanvas(inCanvas);
    isMouseInCanvasRef.current = inCanvas;
  }, []);

  const notifyInputTyping = useCallback((hasText: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (hasText) {
      if (!isTypingRef.current) {
        setIsTyping(true);
        isTypingRef.current = true;
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        isTypingRef.current = false;
        typingTimeoutRef.current = null;
      }, INPUT_TYPING_TIMEOUT);
    } else {
      setIsTyping(false);
      isTypingRef.current = false;
    }
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
      cursorPosition: INITIAL_CURSOR_POSITION,
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

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        setIsTyping(false);
        isTypingRef.current = false;
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
          : OUTSIDE_CURSOR_POSITION,
        typing: isTypingRef.current
      });
      spaceHeartbeat({ spaceId });
    }, HEARTBEAT_PERIOD);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

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
    notifyMouseInCanvas,
    notifyInputTyping,
    isTyping
  };
};
