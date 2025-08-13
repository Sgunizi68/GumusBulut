import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PreparedInput {
  originalElement: HTMLElement;
  textElement: HTMLSpanElement;
}

const prepareInputsForPdf = (container: HTMLElement): PreparedInput[] => {
  const preparedInputs: PreparedInput[] = [];
  const inputs = container.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    const originalElement = input as HTMLElement;
    let textContent = '';

    if (originalElement instanceof HTMLInputElement) {
      if (originalElement.type === 'checkbox') {
        textContent = originalElement.checked ? 'X' : '';
      } else {
        textContent = originalElement.value;
      }
    } else if (originalElement instanceof HTMLTextAreaElement) {
      textContent = originalElement.value;
    } else if (originalElement instanceof HTMLSelectElement) {
      const selectedOption = originalElement.options[originalElement.selectedIndex];
      textContent = selectedOption ? selectedOption.text : '';
    }

    const textElement = document.createElement('span');
    textElement.textContent = textContent;
    textElement.classList.add('print-only-text');
    textElement.style.display = 'none'; // Hidden by default on screen

    originalElement.classList.add('screen-only-input');
    originalElement.style.display = 'block'; // Ensure it's visible on screen by default

    originalElement.parentNode?.insertBefore(textElement, originalElement);
    preparedInputs.push({ originalElement, textElement });
  });

  return preparedInputs;
};

const restoreInputsAfterPdf = (preparedInputs: PreparedInput[]) => {
  preparedInputs.forEach(({ originalElement, textElement }) => {
    originalElement.classList.remove('screen-only-input');
    originalElement.style.display = ''; // Restore original display
    textElement.parentNode?.removeChild(textElement); // Remove the temporary text element
  });
};

export const generateDashboardPdf = async (elementId: string, filename: string = 'dashboard-report.pdf') => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID '${elementId}' not found.`);
    return;
  }

  const preparedInputs = prepareInputsForPdf(input);

  // Temporarily hide elements that should not appear in the PDF
  const elementsToHide = document.querySelectorAll('.hide-on-pdf, .screen-only-input');
  elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');

  // Temporarily show elements that should only appear in the PDF
  const elementsToShow = document.querySelectorAll('.print-only-text');
  elementsToShow.forEach(el => (el as HTMLElement).style.display = 'block'); // Or 'inline', 'inline-block' depending on desired layout

  try {
      const canvas = await html2canvas(input, { scale: 3 }); // Increased scale for better quality to fix text truncation

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
    elementsToShow.forEach(el => (el as HTMLElement).style.display = ''); // Revert to original display
    restoreInputsAfterPdf(preparedInputs);
  }
};
