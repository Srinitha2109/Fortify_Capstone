import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Payment } from './payment';

@Injectable({
    providedIn: 'root'
})
export class InvoiceGeneratorService {
    generateInvoice(payment: Payment, userName: string) {
        const doc = new jsPDF();

        // Header
        const burgundy = [128, 0, 0];
        doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('FORTIFY INSURANCE', 20, 25);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('PREMIUM INSURANCE SOLUTIONS', 20, 32);

        doc.setFontSize(8);
        doc.text('123 BUSINESS AVENUE, SUITE 500', 20, 38);
        doc.text('FINANCIAL DISTRICT, NY 10004', 20, 42);

        // Top Right
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('TAX INVOICE', 140, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`REF: #${payment.transactionReference}`, 140, 32);
        doc.text('DATE ISSUED', 140, 40);
        doc.setFont('helvetica', 'bold');
        const issueDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date();
        doc.text(issueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 140, 45);

        doc.setDrawColor(burgundy[0], burgundy[1], burgundy[2]);
        doc.setLineWidth(1);
        doc.line(20, 55, 190, 55);

        // Billed To & Policy Info
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('BILLED TO', 20, 68);
        doc.text('POLICY INFORMATION', 110, 68);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(userName, 20, 78);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Client ID: PH-${payment.policyApplicationId}`, 20, 85);
        doc.text('Verified Business Account', 20, 90);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(payment.planName || 'Insurance Plan', 110, 78);
        doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
        doc.text(payment.policyNumber || 'N/A', 110, 85);

        doc.setFillColor(245, 245, 245);
        doc.roundedRect(110, 92, 55, 10, 2, 2, 'F');
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('COVERAGE PERIOD: CURRENT', 115, 98);

        // Content Table Body
        doc.setDrawColor(245, 245, 245);
        doc.roundedRect(20, 115, 170, 100, 5, 5);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('DESCRIPTION OF COVERAGE', 35, 130);
        doc.text('AMOUNT (USD)', 150, 130);

        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.5);
        doc.line(35, 135, 175, 135);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`PREMIUM ${payment.paymentType || 'Premium'} Payment`, 35, 155);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('PROFESSIONAL SERVICES & COMMERCIAL PROTECTION', 35, 162);

        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`$${payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 150, 158);

        doc.line(35, 175, 175, 175);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text('TOTAL AMOUNT PAID', 35, 195);
        doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
        doc.setFontSize(28);
        doc.text(`$${payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 135, 205);

        // Success Indicator
        doc.setDrawColor(200, 255, 230);
        doc.setFillColor(245, 255, 250);
        doc.roundedRect(35, 230, 140, 30, 5, 5, 'FD');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT SUCCESSFUL', 45, 245);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`TRANSACTION REFERENCE: ${payment.transactionReference}`, 45, 252);

        // Footer
        doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TERMS & CONDITIONS', 20, 280);
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Claims are subject to policy terms. This document serves as legal proof of premium payment for the', 20, 286);
        doc.text('specified policy period. Keep for your tax records.', 20, 290);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('FORTIFY DIGITAL GATEWAY', 140, 282);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('ELECTRONIC SIGNATURE VERIFIED', 148, 290);

        doc.save(`Invoice_${payment.transactionReference}.pdf`);
    }
}
