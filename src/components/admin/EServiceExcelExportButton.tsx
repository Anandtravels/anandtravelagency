import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { exportEServiceRequestsToExcel, exportFilteredEServiceRequests, exportEServiceSummary } from '@/utils/eserviceExcelExport';
import { EServiceRequest, E_SERVICE_TYPES } from '@/types/eservices';
import { useToast } from '@/hooks/use-toast';

interface EServiceExcelExportButtonProps {
  requests: EServiceRequest[];
  filteredRequests?: EServiceRequest[];
  agents?: any[];
  className?: string;
}

const EServiceExcelExportButton = ({ requests, filteredRequests, agents, className }: EServiceExcelExportButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeAllRequests: true,
    dateRange: false,
    statusFilter: 'all',
    serviceTypeFilter: 'all',
    assignedAgentFilter: 'all'
  });
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  const handleExport = () => {
    try {
      let requestsToExport = exportOptions.includeAllRequests ? requests : (filteredRequests || requests);
      
      // Apply additional filters if specified
      const filters: any = {};
      
      if (exportOptions.statusFilter !== 'all') {
        filters.status = exportOptions.statusFilter;
      }
      
      if (exportOptions.serviceTypeFilter !== 'all') {
        filters.serviceType = exportOptions.serviceTypeFilter;
      }
      
      if (exportOptions.assignedAgentFilter !== 'all') {
        filters.assignedAgent = exportOptions.assignedAgentFilter;
      }
      
      if (exportOptions.dateRange && dateRange.from) {
        filters.dateFrom = dateRange.from;
        if (dateRange.to) {
          filters.dateTo = dateRange.to;
        }
      }

      // Export with filters
      if (Object.keys(filters).length > 0) {
        exportFilteredEServiceRequests(requestsToExport, filters);
      } else {
        exportEServiceRequestsToExcel(requestsToExport);
      }
      
      toast({
        title: "Export Successful",
        description: `Exported ${requestsToExport.length} E-service requests to Excel`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export E-service requests. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleQuickExport = () => {
    try {
      exportEServiceRequestsToExcel(filteredRequests || requests);
      toast({
        title: "Export Successful",
        description: `Exported ${(filteredRequests || requests).length} E-service requests to Excel`,
      });
    } catch (error) {
      console.error("Quick export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export E-service requests. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSummaryExport = () => {
    try {
      exportEServiceSummary(requests);
      toast({
        title: "Summary Export Successful",
        description: "Exported E-services summary report to Excel",
      });
    } catch (error) {
      console.error("Summary export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export summary report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Quick Export Button */}
      <Button
        onClick={handleQuickExport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download size={16} />
        Quick Export
      </Button>

      {/* Summary Export Button */}
      <Button
        onClick={handleSummaryExport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <BarChart3 size={16} />
        Summary Report
      </Button>

      {/* Advanced Export Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileSpreadsheet size={16} />
            Advanced Export
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet size={20} />
              Export E-Service Requests
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Data Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data Selection</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="all-requests"
                    checked={exportOptions.includeAllRequests}
                    onChange={() => setExportOptions(prev => ({ ...prev, includeAllRequests: true }))}
                  />
                  <Label htmlFor="all-requests" className="text-sm">All E-service requests ({requests.length})</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="filtered-requests"
                    checked={!exportOptions.includeAllRequests}
                    onChange={() => setExportOptions(prev => ({ ...prev, includeAllRequests: false }))}
                  />
                  <Label htmlFor="filtered-requests" className="text-sm">
                    Current filtered view ({(filteredRequests || requests).length})
                  </Label>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Status Filter</Label>
                <Select
                  value={exportOptions.statusFilter}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, statusFilter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Service Type Filter</Label>
                <Select
                  value={exportOptions.serviceTypeFilter}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, serviceTypeFilter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {Object.entries(E_SERVICE_TYPES).map(([key, service]) => (
                      <SelectItem key={key} value={key}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Agent Filter */}
            {agents && agents.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Assigned Agent Filter</Label>
                <Select
                  value={exportOptions.assignedAgentFilter}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, assignedAgentFilter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    <SelectItem value="">Unassigned</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.email} value={agent.email}>
                        {agent.name} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="date-range"
                  checked={exportOptions.dateRange}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.checked }))}
                />
                <Label htmlFor="date-range" className="text-sm">Filter by date range</Label>
              </div>
              
              {exportOptions.dateRange && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download size={16} />
              Export to Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EServiceExcelExportButton;
