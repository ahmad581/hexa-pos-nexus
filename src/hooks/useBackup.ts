import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BackupOptions {
  branchId: string;
  saveToStorage?: boolean;
  backupType?: 'manual' | 'automatic';
}

export const useBackup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);

  const downloadBackup = async ({ branchId, saveToStorage = false, backupType = 'manual' }: BackupOptions) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        'https://fcdfephraaiusolzfdvf.supabase.co/functions/v1/generate-backup',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            branch_id: branchId,
            backup_type: backupType,
            save_to_storage: saveToStorage,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Backup failed');
      }

      if (saveToStorage) {
        const result = await response.json();
        toast.success('Backup saved to storage');
        return result;
      } else {
        // Download the CSV file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'backup.csv';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Backup downloaded successfully');
      }
    } catch (error: any) {
      console.error('Backup error:', error);
      toast.error(error.message || 'Failed to create backup');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBackupHistory = async (branchId: string) => {
    try {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBackupHistory(data || []);
    } catch (error) {
      console.error('Error fetching backup history:', error);
    }
  };

  const downloadFromStorage = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('branch-backups')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'backup.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Backup downloaded');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download backup');
    }
  };

  return {
    isLoading,
    downloadBackup,
    backupHistory,
    fetchBackupHistory,
    downloadFromStorage,
  };
};
