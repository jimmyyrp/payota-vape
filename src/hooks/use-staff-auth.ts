'use client';

/**
 * useStaffAuth - Status sesi tim dari localStorage (sumber tunggal: login).
 * canManage: admin & developer saja - gerbang seluruh alat kelola inline
 * di halaman publik (chip kartu, bar dialog detail, FAB halaman SSR).
 */

import { useEffect, useState } from 'react';

export interface StaffAuthState {
  /** false sampai effect client berjalan (hindari hydration mismatch). */
  mounted: boolean;
  loggedIn: boolean;
  role: string;
  canManage: boolean;
}

const INITIAL: StaffAuthState = { mounted: false, loggedIn: false, role: 'staff', canManage: false };

function readStorage(): Omit<StaffAuthState, 'mounted'> {
  try {
    const loggedIn = localStorage.getItem('fee_admin_auth') === 'true';
    const role = localStorage.getItem('fee_user_role') || 'staff';
    return {
      loggedIn,
      role,
      canManage: loggedIn && (role === 'admin' || role === 'developer'),
    };
  } catch {
    // localStorage tidak dapat diakses (blocked storage / sandbox) →
    // anggap tidak login agar tidak bocor gerbang kelola.
    return { loggedIn: false, role: 'staff', canManage: false };
  }
}

export function useStaffAuth(): StaffAuthState {
  const [state, setState] = useState<StaffAuthState>(INITIAL);

  useEffect(() => {
    const read = () => {
      setState({ mounted: true, ...readStorage() });
    };
    read();
    // Sinkron antar-tab bila login/logout di tab lain.
    window.addEventListener('storage', read);
    return () => window.removeEventListener('storage', read);
  }, []);

  return state;
}
