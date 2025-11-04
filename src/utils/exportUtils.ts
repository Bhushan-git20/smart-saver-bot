import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  date: string;
  category: string;
  type: string;
  amount: number;
  description?: string | null;
  balance?: number | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export class ExportUtils {
  static exportToPDF(transactions: Transaction[], userName: string = 'User') {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Transaction Report', 20, 20);
    
    // User info
    doc.setFontSize(12);
    doc.text(`Generated for: ${userName}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 37);
    
    // Summary
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    doc.setFontSize(14);
    doc.text('Summary', 20, 50);
    doc.setFontSize(11);
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 25, 58);
    doc.text(`Total Expenses: $${totalExpense.toFixed(2)}`, 25, 65);
    doc.text(`Net: $${(totalIncome - totalExpense).toFixed(2)}`, 25, 72);
    
    // Transactions table
    doc.setFontSize(14);
    doc.text('Transactions', 20, 85);
    
    let yPos = 95;
    doc.setFontSize(9);
    
    transactions.slice(0, 30).forEach((transaction, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const text = `${transaction.date} | ${transaction.category} | ${transaction.type} | $${Number(transaction.amount).toFixed(2)}`;
      doc.text(text, 20, yPos);
      yPos += 7;
    });
    
    doc.save(`transactions-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static exportToExcel(transactions: Transaction[]) {
    const worksheet = XLSX.utils.json_to_sheet(
      transactions.map(t => ({
        Date: t.date,
        Category: t.category,
        Type: t.type,
        Amount: Number(t.amount),
        Description: t.description || '',
        Balance: t.balance ? Number(t.balance) : '',
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Add summary sheet
    const summaryData = [
      { Metric: 'Total Income', Value: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) },
      { Metric: 'Total Expenses', Value: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) },
      { Metric: 'Net', Value: transactions.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0) },
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    XLSX.writeFile(workbook, `transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}
