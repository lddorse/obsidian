import { useState, useEffect } from 'react';
import { getBusinessStatus } from '../utils/businessStatus';

const untilNextMinute = () => 60000 - (Date.now() % 60000);

// Open/closed status, recomputed at the start of every minute
export const useBusinessStatus = () => {
  const [status, setStatus] = useState(() => getBusinessStatus());

  useEffect(() => {
    let timer;
    const tick = () => {
      setStatus(getBusinessStatus());
      timer = setTimeout(tick, untilNextMinute());
    };
    timer = setTimeout(tick, untilNextMinute());
    return () => clearTimeout(timer);
  }, []);

  return status;
};
