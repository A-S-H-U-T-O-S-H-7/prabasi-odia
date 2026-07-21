import { useCallback } from 'react';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { logActivity, ActivityAction, ActivityEntityType } from '@/lib/services/activityLogService';

interface LogActivityParams {
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string;
  entityTitle?: string;
  oldData?: any;
  newData?: any;
  details?: string;
}

export const useActivityLogger = () => {
  const { admin } = useAdminAuthStore();

  const log = useCallback(async (params: LogActivityParams) => {
    return await logActivity({
      ...params,
      adminId: admin?.uid || 'unknown',
      adminName: admin?.name || 'Unknown Admin',
      adminRole: admin?.role || 'admin',
    });
  }, [admin]);

  return { log };
};