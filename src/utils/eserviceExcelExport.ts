import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { EServiceRequest, E_SERVICE_TYPES } from '@/types/eservices';

export const exportEServiceRequestsToExcel = (
  requests: EServiceRequest[],
  filename: string = `eservice_requests_${new Date().toISOString().split('T')[0]}.xlsx`
) => {
  // Prepare data for Excel export
  const excelData = requests.map(request => ({
    'Request ID': request.id,
    'Name': request.name,
    'Email': request.email,
    'Phone': request.phone,
    'Service Type': E_SERVICE_TYPES[request.serviceType]?.label || request.serviceType,
    'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' '),
    'Created Date': new Date(request.created_at).toLocaleDateString('en-IN'),
    'Updated Date': request.updated_at ? new Date(request.updated_at).toLocaleDateString('en-IN') : '',
    'Assigned Agent': request.assignedAgent || 'Not Assigned',
    'Estimated Processing Time': E_SERVICE_TYPES[request.serviceType]?.estimatedTime || '',
    'Service Fee': E_SERVICE_TYPES[request.serviceType]?.fee || '',
    
    // Request Details (flattened)
    'Address': request.requestDetails?.address || '',
    'Date of Birth': request.requestDetails?.dateOfBirth || '',
    'Father Name': request.requestDetails?.fatherName || '',
    'PAN Card Type': request.requestDetails?.panCardType || '',
    'Passport Type': request.requestDetails?.passportType || '',
    'Place of Birth': request.requestDetails?.placeOfBirth || '',
    'Emergency Contact': request.requestDetails?.emergencyContact || '',
    'Aadhaar Number': request.requestDetails?.aadhaarNumber || '',
    'Bank Preference': request.requestDetails?.bankPreference || '',
    'Employment Type': request.requestDetails?.employmentType || '',
    'Monthly Income': request.requestDetails?.monthlyIncome || '',
    'Card Type': request.requestDetails?.cardType || '',
    'Account Type': request.requestDetails?.accountType || '',
    'Initial Deposit': request.requestDetails?.initialDeposit || '',
    'Nominee Name': request.requestDetails?.nomineeName || '',
    'Nominee Relation': request.requestDetails?.nomineeRelation || '',
    
    // Documents count
    'Documents Submitted': request.documents?.length || 0,
    'Document Names': request.documents?.map(doc => doc.fileName).join(', ') || '',
    
    // Admin details
    'Admin Notes': request.adminNotes || '',
    'Updated By': request.updated_by || '',
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  // Auto-size columns
  const colWidths = [];
  for (let i = 0; i < Object.keys(excelData[0] || {}).length; i++) {
    colWidths.push({ wch: 15 });
  }
  worksheet['!cols'] = colWidths;
  
  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'E-Service Requests');
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Save file
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, filename);
};

export const exportFilteredEServiceRequests = (
  requests: EServiceRequest[],
  filters: {
    serviceType?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    assignedAgent?: string;
  }
) => {
  let filteredRequests = [...requests];
  
  // Apply filters
  if (filters.serviceType && filters.serviceType !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.serviceType === filters.serviceType);
  }
  
  if (filters.status && filters.status !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.status === filters.status);
  }
  
  if (filters.dateFrom) {
    filteredRequests = filteredRequests.filter(req => 
      new Date(req.created_at) >= filters.dateFrom!
    );
  }
  
  if (filters.dateTo) {
    filteredRequests = filteredRequests.filter(req => 
      new Date(req.created_at) <= filters.dateTo!
    );
  }
  
  if (filters.assignedAgent && filters.assignedAgent !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.assignedAgent === filters.assignedAgent);
  }
  
  const filterSuffix = Object.entries(filters)
    .filter(([key, value]) => value && value !== 'all')
    .map(([key, value]) => key)
    .join('_');
  
  const filename = `eservice_requests_${filterSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  exportEServiceRequestsToExcel(filteredRequests, filename);
};

// Export summary statistics
export const exportEServiceSummary = (requests: EServiceRequest[]) => {
  const summary = {
    totalRequests: requests.length,
    byStatus: {} as Record<string, number>,
    byServiceType: {} as Record<string, number>,
    byMonth: {} as Record<string, number>,
  };
  
  // Calculate statistics
  requests.forEach(request => {
    // Status summary
    summary.byStatus[request.status] = (summary.byStatus[request.status] || 0) + 1;
    
    // Service type summary
    const serviceLabel = E_SERVICE_TYPES[request.serviceType]?.label || request.serviceType;
    summary.byServiceType[serviceLabel] = (summary.byServiceType[serviceLabel] || 0) + 1;
    
    // Monthly summary
    const month = new Date(request.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    summary.byMonth[month] = (summary.byMonth[month] || 0) + 1;
  });
  
  // Create summary data for Excel
  const summaryData = [
    ['E-Services Summary Report', ''],
    ['Generated on', new Date().toLocaleDateString('en-IN')],
    ['', ''],
    ['Total Requests', summary.totalRequests],
    ['', ''],
    ['Status Breakdown', ''],
    ...Object.entries(summary.byStatus).map(([status, count]) => [status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '), count]),
    ['', ''],
    ['Service Type Breakdown', ''],
    ...Object.entries(summary.byServiceType).map(([type, count]) => [type, count]),
    ['', ''],
    ['Monthly Distribution', ''],
    ...Object.entries(summary.byMonth).map(([month, count]) => [month, count]),
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
  const workbook = XLSX.utils.book_new();
  
  // Style the summary sheet
  worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `eservice_summary_${new Date().toISOString().split('T')[0]}.xlsx`);
};
