import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import PDFDocument from 'pdfkit'; // Standard build fails in serverless due to fs dependency
import QRCode from 'qrcode';
import { Readable } from 'stream';
import { getDriveService, findSubfolder, createFolder, uploadFileToDrive, getFileStream } from '@/lib/drive';

// Use the standalone build of PDFKit which includes a virtual filesystem for standard fonts.
// This prevents 'ENOENT: no such file' errors in Vercel.
/* eslint-disable @typescript-eslint/no-require-imports */
const PDFDocument = require("pdfkit/js/pdfkit.standalone");

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // invoice id (displayId or cuid)

        // 1. Fetch Invoice Data
        const invoice = await prisma.invoice.findFirst({
            where: {
                OR: [
                    { id: id },
                    { displayId: id }
                ]
            },
            include: {
                client: true,
                request: {
                    include: {
                        service: true,
                        pricingPlan: true
                    }
                }
            }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // 2. Check if already on Drive
        if (invoice.driveId) {
            console.log(`[Invoice] Serving from Drive: ${invoice.driveId}`);
            const driveStreamData = await getFileStream(invoice.driveId);
            if (driveStreamData) {
                // Return the stream directly
                // Next.js App Router streaming response
                const headers = new Headers();
                headers.set('Content-Type', 'application/pdf');
                headers.set('Content-Disposition', `inline; filename="${invoice.displayId || invoice.id}.pdf"`);

                // Convert Node stream to Web stream (if needed) or use NextResponse with the stream
                // casting to any because of type mismatch between node stream and web stream
                return new NextResponse(driveStreamData.stream as any, { status: 200, headers });
            } else {
                console.warn("[Invoice] Drive ID exists but file not found. Regenerating.");
            }
        }

        // 3. Generate PDF
        // User requested to switch to Times New Roman due to font errors.
        // Using standard fonts is safer with the standalone build.
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));

        // --- CONTENT GENERATION ---

        // ZATCA / Company Info
        doc.font('Times-Bold');
        doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
        doc.moveDown();

        doc.fontSize(10);
        doc.font('Times-Roman');
        doc.text('Finume Marketplace', 50, 80)
            .text('Riyadh, Saudi Arabia')
            .text('VAT ID: 310123456700003')
            .moveDown();

        // Invoice Details
        doc.text(`Invoice Number: ${invoice.displayId}`, 400, 80)
            .text(`Request Ref: ${invoice.request?.displayId || 'N/A'}`, 400, 95)
            .text(`Date: ${invoice.createdAt.toISOString().split('T')[0]}`, 400, 110)
            .text(`Status: ${invoice.status}`, 400, 125)
            .moveDown();

        doc.moveDown();

        // Client Info
        doc.text('Bill To:', 50, 150)
            .font('Times-Bold').text(invoice.client.companyName)
            .font('Times-Roman').text(invoice.client.nationalAddress || 'Address not provided')
            .text(`VAT ID: ${invoice.client.vatNumber || 'N/A'}`);

        doc.moveDown();
        doc.moveDown();

        // Table Header
        const tableTop = 250;
        doc.font('Times-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Rate', 280, tableTop, { width: 90, align: 'right' });
        doc.text('Tax (15%)', 370, tableTop, { width: 90, align: 'right' });
        doc.text('Amount (SAR)', 460, tableTop, { width: 90, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Line Item
        doc.font('Times-Roman');
        const description = invoice.request?.pricingPlan?.name || invoice.request?.service?.nameEn || 'Service Request';
        const totalAmount = Number(invoice.amount);
        const vatAmount = totalAmount - (totalAmount / 1.15);
        const baseAmount = totalAmount - vatAmount;

        const itemY = tableTop + 30;
        doc.text(description, 50, itemY);
        doc.text(baseAmount.toFixed(2), 280, itemY, { width: 90, align: 'right' });
        doc.text(vatAmount.toFixed(2), 370, itemY, { width: 90, align: 'right' });
        doc.text(totalAmount.toFixed(2), 460, itemY, { width: 90, align: 'right' });

        doc.moveTo(50, itemY + 20).lineTo(550, itemY + 20).strokeOpacity(0.5).stroke();

        // Totals
        const totalY = itemY + 40;
        doc.font('Times-Bold');
        doc.text('Subtotal:', 350, totalY);
        doc.text(baseAmount.toFixed(2), 460, totalY, { width: 90, align: 'right' });

        doc.text('Total VAT (15%):', 350, totalY + 15);
        doc.text(vatAmount.toFixed(2), 460, totalY + 15, { width: 90, align: 'right' });

        doc.fontSize(12).text('Grand Total:', 350, totalY + 35);
        doc.text(`${totalAmount.toFixed(2)} SAR`, 460, totalY + 35, { width: 90, align: 'right' });

        // QR Code
        const qrData = `Finume|${invoice.createdAt.toISOString()}|${totalAmount.toFixed(2)}|${vatAmount.toFixed(2)}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);

        doc.image(qrCodeDataUrl, 50, 700, { width: 100 });
        doc.fontSize(8).text('Scan to verify (Simplified)', 50, 810);

        doc.end();

        // Wait for stream to finish
        await new Promise((resolve) => doc.on('end', resolve));
        const pdfBuffer = Buffer.concat(buffers);

        // 4. Upload to Drive
        // Find/Create "Invoices" folder
        // We'll check the master folder for an "Invoices" subfolder
        let invoicesFolderId: string | null = null;

        if (process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID) {
            const invoicesFolder = await findSubfolder(process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID, "Invoices");
            if (invoicesFolder && invoicesFolder.id) {
                invoicesFolderId = invoicesFolder.id;
            } else {
                try {
                    const newFolder = await createFolder("Invoices", process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID);
                    invoicesFolderId = newFolder?.id || null;
                } catch (e) {
                    console.warn("Failed to create Invoices folder:", e);
                }
            }
        }

        if (invoicesFolderId) {
            const fileName = `INV-${invoice.displayId || invoice.id}.pdf`;
            const uploadedFile = await uploadFileToDrive(pdfBuffer, fileName, invoicesFolderId, 'application/pdf');

            if (uploadedFile?.id) {
                // Update Invoice
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { driveId: uploadedFile.id }
                });
                console.log(`[Invoice] Uploaded to Drive: ${uploadedFile.id}`);
            }
        } else {
            console.warn("[Invoice] Could not resolve Invoices folder on Drive. Skipping upload.");
        }

        // 5. Return Response
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `inline; filename="${invoice.displayId || invoice.id}.pdf"`);

        return new NextResponse(pdfBuffer, { status: 200, headers });

    } catch (error: any) {
        console.error("PDF Generation Error:", error);

        if (error.message && error.message.includes('invalid_grant')) {
            return NextResponse.json({
                error: 'Server Storage Auth Error: The Google Drive connection has expired. Please refresh credentials.'
            }, { status: 503 });
        }

        return NextResponse.json({
            error: 'Failed to generate PDF',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
