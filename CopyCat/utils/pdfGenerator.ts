import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateDashboardPdf = async (elementId: string, filename: string = 'dashboard-report.pdf') => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID '${elementId}' not found.`);
    return;
  }

  // Temporarily hide elements that should not appear in the PDF
  // You might need to add specific classes to elements you want to hide, e.g., 'hide-on-pdf'
  const elementsToHide = document.querySelectorAll('.hide-on-pdf');
  elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');

  try {
    const canvas = await html2canvas(input, {
      scale: 2, // Increase scale for better resolution in PDF
      useCORS: true, // Enable if you have images from different origins
      logging: true, // Enable for debugging
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    // Restore hidden elements
    elementsToHide.forEach(el => (el as HTMLElement).style.display = '');
  }
};
