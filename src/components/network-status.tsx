"use client";

import { useEffect, useState } from "react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(window.navigator.onLine);
      setHasMounted(true);
    };

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!hasMounted || isOnline) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      Offline. Keep notes short for now; draft text stays on this device.
    </div>
  );
}
