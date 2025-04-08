'use client';

import { ConnectGoogle } from '../../../../components/ui/connectGoogleButton';

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Integrations</h1>

      <div className="border border-gray-300 rounded p-4">
        <h2 className="text-lg font-medium mb-2">Google Calendar</h2>
        <p className="text-sm text-gray-600 mb-3">
          Sync your SchedLite bookings with your Google Calendar automatically.
        </p>
        <ConnectGoogle />
      </div>
    </div>
  );
}
