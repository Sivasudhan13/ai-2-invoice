export const exportToCSV = (data) => {
  if (!data) return;

  const rows = [];
  
  // Header
  rows.push(['Field', 'Value', 'Confidence']);
  
  // Basic Info
  rows.push(['Invoice Number', data.invoice_number || '', data._confidence?.invoice_number || 'High']);
  rows.push(['Invoice Date', data.invoice_date || '', data._confidence?.invoice_date || 'High']);
  rows.push(['Due Date', data.due_date || '', data._confidence?.due_date || 'Medium']);
  rows.push(['Payment Terms', data.payment_terms || '', data._confidence?.payment_terms || 'Medium']);
  
  // Supplier
  if (data.supplier) {
    rows.push(['', '', '']);
    rows.push(['SUPPLIER DETAILS', '', '']);
    rows.push(['Supplier Name', data.supplier.name || '', data._confidence?.supplier?.name || 'High']);
    rows.push(['Supplier Address', data.supplier.address || '', data._confidence?.supplier?.address || 'High']);
    rows.push(['Supplier Phone', data.supplier.phone || '', data._confidence?.supplier?.phone || 'Medium']);
    rows.push(['Supplier Email', data.supplier.email || '', data._confidence?.supplier?.email || 'Medium']);
    rows.push(['Supplier GSTIN', data.supplier.gstin || '', data._confidence?.supplier?.gstin || 'High']);
  }
  
  // Bill To
  if (data.bill_to) {
    rows.push(['', '', '']);
    rows.push(['BILL TO DETAILS', '', '']);
    rows.push(['Customer Name', data.bill_to.name || '', data._confidence?.bill_to?.name || 'High']);
    rows.push(['Customer Address', data.bill_to.address || '', data._confidence?.bill_to?.address || 'High']);
    rows.push(['Customer GSTIN', data.bill_to.gstin || '', data._confidence?.bill_to?.gstin || 'Medium']);
  }
  
  // Line Items
  if (data.line_items && data.line_items.length > 0) {
    rows.push(['', '', '']);
    rows.push(['LINE ITEMS', '', '']);
    rows.push(['Description', 'Quantity', 'Unit Price', 'Tax Rate', 'Amount']);
    
    data.line_items.forEach(item => {
      rows.push([
        item.description || '',
        `${item.quantity || 0} ${item.unit || ''}`,
        `${data.currency || '₹'}${item.unit_price || 0}`,
        `${item.tax_rate || 0}%`,
        `${data.currency || '₹'}${item.amount || 0}`
      ]);
    });
  }
  
  // Totals
  rows.push(['', '', '']);
  rows.push(['TOTALS', '', '']);
  rows.push(['Subtotal', `${data.currency || '₹'}${data.subtotal || 0}`, 'High']);
  rows.push(['Total Tax', `${data.currency || '₹'}${data.total_tax || 0}`, 'High']);
  rows.push(['Grand Total', `${data.currency || '₹'}${data.grand_total || 0}`, 'High']);
  
  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `invoice_${data.invoice_number || 'export'}_${Date.now()}.csv`;
  link.click();
};
