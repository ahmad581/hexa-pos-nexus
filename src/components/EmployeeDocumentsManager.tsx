import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, Download, Loader2, X, Eye } from "lucide-react";
import { useEmployeeDocuments, EmployeeDocument } from "@/hooks/useEmployeeDocuments";
import { formatDistanceToNow } from "date-fns";

interface EmployeeDocumentsManagerProps {
  employeeId: string;
  branchId: string;
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
}

const DOCUMENT_TYPES = [
  { value: 'personal_id', label: 'Personal ID' },
  { value: 'contract', label: 'Employment Contract' },
  { value: 'resume', label: 'Resume/CV' },
  { value: 'certification', label: 'Certification' },
  { value: 'medical', label: 'Medical Records' },
  { value: 'tax', label: 'Tax Documents' },
  { value: 'bank', label: 'Bank Details' },
  { value: 'other', label: 'Other' },
];

export const EmployeeDocumentsManager = ({
  employeeId,
  branchId,
  isOpen,
  onClose,
  employeeName
}: EmployeeDocumentsManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('other');
  const [description, setDescription] = useState('');
  
  const { 
    documents, 
    isLoading, 
    uploading, 
    uploadDocument, 
    deleteDocument,
    getSignedUrl 
  } = useEmployeeDocuments(employeeId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadDocument(employeeId, branchId, selectedFile, documentType, description);
      setSelectedFile(null);
      setDocumentType('other');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleViewDocument = async (doc: EmployeeDocument) => {
    const url = await getSignedUrl(doc);
    window.open(url, '_blank');
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    const url = await getSignedUrl(doc);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.document_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents for {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="font-medium">Upload New Document</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>PDF File</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
            </div>
            
            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Add a description for this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>

          {/* Documents List */}
          <div>
            <h4 className="font-medium mb-3">Uploaded Documents ({documents.length})</h4>
            
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No documents uploaded yet
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.document_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {getDocumentTypeLabel(doc.document_type)}
                          </Badge>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewDocument(doc)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDownload(doc)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteDocument(doc)}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
