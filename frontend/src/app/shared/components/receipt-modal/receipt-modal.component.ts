// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (...args: any[]) => void;
  }
}
// Removed duplicate top-level getReceiptNo
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-modal.component.html',
  styleUrls: ['./receipt-modal.component.scss'],
})
export class ReceiptModalComponent {
  downloadVectorPDF() {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const margin = 15;
    let y = margin;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);

    // Header
    pdf.text(`Receipt No.: ${this.getReceiptNo()}`, margin, y);
    pdf.text(
      `Date: ${this.order?.createdAt ? new Date(this.order.createdAt).toLocaleDateString() : '-'}`,
      170,
      y,
      { align: 'right' },
    );
    y += 10;
    pdf.setFontSize(18);
    // Center-align PAYMENT RECEIPT
    const pageWidth = pdf.internal.pageSize.getWidth();
    const receiptTitle = 'PAYMENT RECEIPT';
    const textWidth = pdf.getTextWidth(receiptTitle);
    pdf.text(receiptTitle, (pageWidth - textWidth) / 2, y);
    pdf.setFont('helvetica', 'normal');
    y += 10;

    // Customer & Company details (aligned left, stacked)
    pdf.setFontSize(11);
    pdf.setTextColor(120);
    pdf.text('CUSTOMER DETAILS', margin, y);
    pdf.setTextColor(30);
    y += 7;
    pdf.text(`Name: ${this.getUserName()}`, margin, y);
    y += 6;
    pdf.text(`Email: ${this.getUserEmail()}`, margin, y);
    y += 7;
    pdf.setTextColor(120);
    pdf.text('COMPANY DETAILS', margin, y);
    pdf.setTextColor(30);
    y += 7;
    pdf.text('Name: GameStore', margin, y);
    y += 6;
    pdf.text('Email: support@gamestore.com', margin, y);
    y += 10;

    // Table of items
    autoTable(pdf, {
      startY: y,
      head: [['DESCRIPTION', 'PRICE']],
      body: (this.order?.orderItems || []).map((item: any) => [
        this.getProductName(item),
        `$${item.price.toFixed(2)}`,
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [79, 110, 247],
        textColor: 255,
        fontStyle: 'bold',
      },
      bodyStyles: { textColor: 30 },
      styles: { font: 'helvetica', fontSize: 11 },
      margin: { left: margin, right: margin },
      tableWidth: 180,
    });
    y = (pdf as any).lastAutoTable.finalY + 6;

    // Totals
    pdf.setFontSize(11);
    pdf.text(`SUBTOTAL`, margin, y);
    pdf.text(`$${this.order?.itemsPrice?.toFixed(2) ?? '0.00'}`, 70, y, {
      align: 'right',
    });
    y += 6;
    pdf.text(`TAXABLE AMOUNT`, margin, y);
    pdf.text(`$${this.order?.taxPrice?.toFixed(2) ?? '0.00'}`, 70, y, {
      align: 'right',
    });
    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(79, 110, 247);
    pdf.rect(margin, y - 5, 60, 8, 'F');
    pdf.setTextColor(255);
    pdf.text('GRAND TOTAL', margin + 2, y);
    pdf.text(`$${this.order?.totalPrice?.toFixed(2) ?? '0.00'}`, 70, y, {
      align: 'right',
    });
    pdf.setTextColor(30);
    pdf.setFont('helvetica', 'normal');
    y += 12;

    // Payment info
    pdf.text(`Payment Method: ${this.order?.paymentMethod ?? '-'}`, margin, y);
    y += 7;
    pdf.text(
      `Amount Paid: $${this.order?.isPaid ? (this.order?.totalPrice?.toFixed(2) ?? '0.00') : '0.00'}`,
      margin,
      y,
    );
    y += 12;

    // Thank you
    pdf.setFontSize(15);
    pdf.setTextColor(79, 110, 247);
    pdf.text('Thank you!', margin, y);

    const receiptNo = this.getReceiptNo()
      .replace(/\s+/g, '')
      .replace(/\-/g, '-');
    pdf.save(`receipt-${receiptNo}.pdf`);
  }
  getReceiptNo(): string {
    if (!this.order || !this.order._id) return 'R26 - 00001';
    // Use last 5 chars of order._id as a simple unique number, pad with zeros
    const num = this.order._id.slice(-5).replace(/[^0-9]/g, '');
    const padded = num.padStart(5, '0') || '00001';
    return `R26 - ${padded}`;
  }
  @Input() order: Order | null = null;
  @ViewChild('receiptContent', { static: false }) receiptContent!: any;

  getProductName(item: any): string {
    if (
      item.product &&
      typeof item.product === 'object' &&
      'name' in item.product
    ) {
      return item.product.name;
    }
    return item.name;
  }

  getUserName(): string {
    if (!this.order) return '-';
    if (typeof this.order.user === 'object' && 'name' in this.order.user) {
      return this.order.user.name;
    }
    return '-';
  }

  getUserEmail(): string {
    if (!this.order) return '-';
    if (typeof this.order.user === 'object' && 'email' in this.order.user) {
      return this.order.user.email;
    }
    return '-';
  }

  downloadPDF() {
    const data = this.receiptContent.nativeElement;
    html2canvas(data).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${this.order?._id || 'order'}.pdf`);
    });
  }
}
