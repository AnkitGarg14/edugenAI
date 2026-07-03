import { useEffect, useRef } from 'react';
import { progressApi } from '../services/progressApi';

export const useStudySession = (activityType) => {
  const sessionIdRef = useRef(null);
  const timeoutRef = useRef(null);
  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await progressApi.startSession(activityType);
        sessionIdRef.current = session._id;
      } catch (error) {
        console.error('Failed to start study session:', error);
      }
    };

    initSession();

    const endSession = async () => {
      if (sessionIdRef.current) {
        try {
          // Fire and forget, can't reliably await in beforeunload
          progressApi.endSession(sessionIdRef.current);
          sessionIdRef.current = null;
        } catch (error) {
          console.error('Failed to end study session:', error);
        }
      }
    };

    const resetInactivityTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        endSession(); // End session if inactive for 10 minutes
      }, INACTIVITY_LIMIT);
    };

    // Track activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (!sessionIdRef.current) {
        initSession(); // Restart session if they become active again
      }
      resetInactivityTimer();
    };

    activityEvents.forEach(event => window.addEventListener(event, handleActivity));
    window.addEventListener('beforeunload', endSession);
    
    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
      window.removeEventListener('beforeunload', endSession);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      endSession(); // End when component unmounts
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityType]);
};
