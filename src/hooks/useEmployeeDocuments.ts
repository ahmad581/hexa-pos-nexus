import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export const useEmployeeDocuments = (employeeId?: string) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmployeeDocument[];
    },
    enabled: !!employeeId,
  });

  const uploadDocument = async (
    employeeId: string,
    branchId: string,
    file: File,
    documentType: string,
    description?: string
  ) => {
    setUploading(true);
    
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}/${Date.now()}-${file.name}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(fileName);
      
      // Create document record in database
      const { data: docData, error: docError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
          branch_id: branchId,
          document_name: file.name,
          document_type: documentType,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          description: description || null,
        })
        .select()
        .single();
      
      if (docError) throw docError;
      
      toast.success(`Document "${file.name}" uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      
      return docData;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = useMutation({
    mutationFn: async (document: EmployeeDocument) => {
      // Extract file path from URL
      const urlParts = document.file_url.split('/employee-documents/');
      const filePath = urlParts[1];
      
      if (filePath) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('employee-documents')
          .remove([filePath]);
        
        if (storageError) {
          console.warn('Storage delete error:', storageError);
        }
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', document.id);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete document');
    }
  });

  const getSignedUrl = async (document: EmployeeDocument) => {
    // Extract file path from URL
    const urlParts = document.file_url.split('/employee-documents/');
    const filePath = urlParts[1];
    
    if (!filePath) return document.file_url;
    
    const { data, error } = await supabase.storage
      .from('employee-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Signed URL error:', error);
      return document.file_url;
    }
    
    return data.signedUrl;
  };

  return {
    documents,
    isLoading,
    uploading,
    uploadDocument,
    deleteDocument: deleteDocument.mutate,
    getSignedUrl,
  };
};
