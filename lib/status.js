// Canonical ride status names — must match backend DB enum exactly
// Backend reference: socket.server.js:414-422 + tracking-routes.handler.js
export const STATUS = {
  REQUESTED:       'requested',         // no driver assigned yet
  DRIVER_ASSIGNED: 'driver_assigned',   // driver matched, heading to pickup
  DRIVER_ARRIVED:  'driver_arrived',    // driver at pickup, waiting for passenger
  IN_PROGRESS:     'in_progress',       // ride in motion (was 'started')
  COMPLETED:       'completed',
  CANCELLED:       'cancelled',
  EXPIRED:         'expired',           // tracking link past TTL
};

// Terminal = stop polling, disconnect socket, render replay/receipt screen
export const TERMINAL_STATUSES = new Set([
  STATUS.COMPLETED,
  STATUS.CANCELLED,
  STATUS.EXPIRED,
]);

export const isTerminal = (s) => TERMINAL_STATUSES.has(s);

// Pre-assignment: driver field will be null/empty
export const isPreAssignment = (s) => s === STATUS.REQUESTED;
