/**
 * ==============================================================================
 * REGISTRATION PAGE FORWARDER (`/register`)
 * ==============================================================================
 * Directs visitors to the unified Authentication portal.
 */

import React from 'react';
import { LoginPage } from './LoginPage';

export const RegisterPage: React.FC = () => {
  return <LoginPage />;
};
