"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface PermissionGateProps {
  permission: 'canConfigureViews' | 'canEditRecords' | 'canDeleteRecords' | 'canExport';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockIcon?: boolean;
  tooltipMessage?: string;
}

export function PermissionGate({
  permission,
  children,
  fallback,
  showLockIcon = false,
  tooltipMessage,
}: PermissionGateProps) {
  const { currentUser } = useApp();
  const hasPermission = currentUser.permissions[permission];

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLockIcon) {
    const defaultMessage = {
      canConfigureViews: 'You do not have permission to configure views',
      canEditRecords: 'You do not have permission to edit records',
      canDeleteRecords: 'You do not have permission to delete records',
      canExport: 'You do not have permission to export data',
    }[permission];

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1 text-muted-foreground cursor-not-allowed opacity-50">
              <Lock className="h-3 w-3" />
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage || defaultMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}