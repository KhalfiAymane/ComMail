import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const useDebouncedNavigate = () => {
  const navigate = useNavigate();
  let timeoutId = null;

  const debouncedNavigate = useCallback((path, delay = 100) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      navigate(path);
    }, delay);
  }, [navigate]);

  return debouncedNavigate;
};

export default useDebouncedNavigate;