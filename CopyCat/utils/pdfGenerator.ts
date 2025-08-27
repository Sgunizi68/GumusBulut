import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PreparedInput {
  originalElement: HTMLElement;
  textElement: HTMLSpanElement;
}

interface LayoutBackup {
  element: HTMLElement;
  originalStyles: {
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
    overflow?: string;
    display?: string;
    position?: string;
    transform?: string;
  };
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

const prepareLayoutForPdf = (container: HTMLElement): LayoutBackup[] => {
  const backups: LayoutBackup[] = [];
  
  // Handle responsive grids and overflow containers
  const elementsToExpand = container.querySelectorAll(
    '.grid, .overflow-x-auto, .overflow-hidden, .overflow-auto, .space-y-1, .space-y-2, .space-y-4, .space-y-6'
  );
  
  elementsToExpand.forEach(element => {
    const el = element as HTMLElement;
    const styles = window.getComputedStyle(el);
    
    const backup: LayoutBackup = {
      element: el,
      originalStyles: {
        width: el.style.width || styles.width,
        height: el.style.height || styles.height,
        maxWidth: el.style.maxWidth || styles.maxWidth,
        maxHeight: el.style.maxHeight || styles.maxHeight,
        overflow: el.style.overflow || styles.overflow,
        display: el.style.display || styles.display,
        position: el.style.position || styles.position,
        transform: el.style.transform || styles.transform,
      }
    };
    
    backups.push(backup);
    
    // Expand containers to show all content
    if (el.classList.contains('overflow-x-auto') || el.classList.contains('overflow-hidden') || el.classList.contains('overflow-auto')) {
      el.style.overflow = 'visible';
      el.style.width = 'max-content';
      el.style.maxWidth = 'none';
    }
    
    // Handle grid layouts - force to single column for better PDF layout
    if (el.classList.contains('grid')) {
      if (el.classList.contains('md:grid-cols-3') || el.classList.contains('grid-cols-3')) {
        el.style.display = 'block';
        el.style.width = '100%';
      }
    }
  });
  
  return backups;
};

const restoreInputsAfterPdf = (preparedInputs: PreparedInput[]) => {
  preparedInputs.forEach(({ originalElement, textElement }) => {
    originalElement.classList.remove('screen-only-input');
    originalElement.style.display = ''; // Restore original display
    textElement.parentNode?.removeChild(textElement); // Remove the temporary text element
  });
};

const restoreLayoutAfterPdf = (backups: LayoutBackup[]) => {
  backups.forEach(({ element, originalStyles }) => {
    Object.keys(originalStyles).forEach(property => {
      const key = property as keyof typeof originalStyles;
      const value = originalStyles[key];
      if (value !== undefined) {
        (element.style as any)[property] = value === 'auto' || value === 'none' ? '' : value;
      }
    });
  });
};

export const generateDashboardPdf = async (elementId: string, filename: string = 'dashboard-report.pdf') => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID '${elementId}' not found.`);
    return;
  }

  const preparedInputs = prepareInputsForPdf(input);
  const layoutBackups = prepareLayoutForPdf(input);

  // Temporarily hide elements that should not appear in the PDF
  const elementsToHide = document.querySelectorAll('.hide-on-pdf, .screen-only-input');
  elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');

  // Temporarily show elements that should only appear in the PDF
  const elementsToShow = document.querySelectorAll('.print-only-text');
  elementsToShow.forEach(el => (el as HTMLElement).style.display = 'block');

  try {
    // Add a small delay to ensure layout changes are applied
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Enhanced canvas options for better quality and complete content capture
    const canvas = await html2canvas(input, { 
      scale: 2, // Good balance between quality and performance
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      width: input.scrollWidth,
      height: input.scrollHeight,
      windowWidth: Math.max(input.scrollWidth, window.innerWidth),
      windowHeight: Math.max(input.scrollHeight, window.innerHeight)
    });

    const imgData = canvas.toDataURL('image/png', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const margin = 10; // 10mm margin
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    
    let position = margin;
    let heightLeft = imgHeight;

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= contentHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    // Restore all elements and layouts
    elementsToHide.forEach(el => (el as HTMLElement).style.display = '');
    elementsToShow.forEach(el => (el as HTMLElement).style.display = '');
    restoreInputsAfterPdf(preparedInputs);
    restoreLayoutAfterPdf(layoutBackups);
  }
};

// Enhanced Dashboard PDF generator with special layout handling
export const generateEnhancedDashboardPdf = async (elementId: string, filename: string = 'dashboard-report.pdf') => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID '${elementId}' not found.`);
    return;
  }

  // Clone the element for manipulation
  const clone = input.cloneNode(true) as HTMLElement;
  clone.id = elementId + '-pdf-clone';
  
  // Apply special PDF styling
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = '210mm'; // A4 width
  clone.style.maxWidth = 'none';
  clone.style.overflow = 'visible';
  clone.style.backgroundColor = '#ffffff';
  
  // Force grid to single column for better PDF layout
  const gridElements = clone.querySelectorAll('.grid');
  gridElements.forEach(grid => {
    const gridEl = grid as HTMLElement;
    gridEl.style.display = 'block';
    gridEl.style.gridTemplateColumns = 'none';
  });
  
  // Ensure all columns are visible
  const columnElements = clone.querySelectorAll('.space-y-1, .space-y-2, .space-y-4, .space-y-6');
  columnElements.forEach(col => {
    const colEl = col as HTMLElement;
    colEl.style.marginBottom = '2rem';
    colEl.style.pageBreakInside = 'avoid';
  });
  
  // Remove actions and other elements that shouldn't be in PDF
  const elementsToRemove = clone.querySelectorAll('.hide-on-pdf, .screen-only-input, .card-actions');
  elementsToRemove.forEach(el => el.remove());
  
  document.body.appendChild(clone);
  
  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: clone.scrollWidth,
      height: clone.scrollHeight
    });
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png', 0.95);
    
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    
    let position = margin;
    let heightLeft = imgHeight;
    
    // Add title/header if needed
    pdf.setFontSize(16);
    pdf.text('Dashboard Raporu', margin, margin - 2);
    
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= contentHeight;
    
    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;
    }
    
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating enhanced PDF:", error);
    alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    // Clean up the clone
    document.body.removeChild(clone);
  }
};
