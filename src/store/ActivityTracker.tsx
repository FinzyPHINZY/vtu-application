// src/components/ActivityTracker.tsx
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateLastActivity, logoutUser } from './slices/authSlices';
import { RootState } from '../store/store';

const ActivityTracker: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lastActivity } = useSelector((state: RootState) => state.auth);

  const handleActivity = useCallback(() => {
    dispatch(updateLastActivity());
  }, [dispatch]);

  useEffect(() => {
    // Set up activity listeners
    const events = ['click', 'keypress', 'scroll', 'mousemove'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    // Set up inactivity check
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeDiff = now - lastActivity;
      const INACTIVITY_THRESHOLD = 12 * 60 * 1000; // 5 minutes

      if (timeDiff >= INACTIVITY_THRESHOLD) {
        dispatch(logoutUser());
        navigate('/login');
        clearInterval(checkInterval);
      }
    }, 1000);

    // Cleanup
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearInterval(checkInterval);
    };
  }, [lastActivity, dispatch, navigate]);

  return null;
};

export default ActivityTracker;