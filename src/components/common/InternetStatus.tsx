import React, { useState, useEffect } from 'react';
import { networkStatus } from '../../utils/networkStatus';
import './InternetStatus.css';

export const InternetStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());

  useEffect(() => {
    const handleStatusChange = (online: boolean) => setIsOnline(online);
    networkStatus.addListener(handleStatusChange);
    return () => networkStatus.removeListener(handleStatusChange);
  }, []);

  return (
    <div className={`internet-status ${isOnline ? 'online' : 'offline'}`}>
      <div className="status-indicator"></div>
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
};