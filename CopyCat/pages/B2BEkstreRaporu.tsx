import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../App';
import { API_BASE_URL } from '../constants';
import { Card, Button, Select } from '../components';
import { Icons, YAZDIRMA_YETKISI_ADI, EXCELE_AKTAR_YETKISI_ADI, GIZLI_KATEGORI_YETKISI_ADI, B2B_EKSTRE_RAPOR_YETKI_ADI } from '../constants';
import { generateDashboardPdf } from '../utils/pdfGenerator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { 
    B2BEkstreRaporResponse, 
    B2BEkstreDonemGroup, 
    B2BEkstreKategoriGroup, 
    B2BEkstreDetail,
    Kategori 
} from '../types';
import { sortEFaturaKategoriler, createKategoriMultiSelectOptions } from '../utils/categoryUtils';
import { formatNumber } from '../utils/formatNumber';

// Custom MultiSelect component for filters
interface MultiSelectProps {
    label: string;
    options: { value: number; label: string }[];
    selectedValues: number[];
    onChange: (values: number[]) => void;
    placeholder: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
    label, 
    options = [], 
    selectedValues = [], 
    onChange,
    placeholder
}) => {
    // Add error handling for useRef
    let wrapperRef: React.RefObject<HTMLDivElement>;
    try {
        wrapperRef = useRef<HTMLDivElement>(null);
    } catch (e) {
        console.error("Error initializing useRef:", e);
        // Fallback to a dummy ref if useRef fails
        wrapperRef = { current: null };
    }

    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Mark component as initialized after first render
    useEffect(() => {
        setIsInitialized(true);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        // Only attach event listener if component is initialized and ref is available
        if (!isInitialized || !wrapperRef.current) return;

        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isInitialized]);

    const handleToggle = (value: number) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const handleSelectAll = () => {
        if (selectedValues.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map(opt => opt.value));
        }
    };

    // Don't render dropdown if not initialized
    if (!isInitialized) {
        return (
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="border border-gray-300 rounded-md p-2 bg-gray-100 min-h-[38px] flex items-center">
                    <span className="text-sm text-gray-500">{placeholder}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div 
                className="border border-gray-300 rounded-md p-2 cursor-pointer bg-white min-h-[38px] flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm text-gray-700 truncate">
                    {selectedValues.length === 0 
                        ? placeholder 
                        : options.length > 0 && selectedValues.length === options.length
                        ? "Tümü"
                        : `${selectedValues.length} seçili`
                    }
                </span>
                <div className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    {/* Simple SVG arrow icon instead of Icons.ChevronDown */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            
            {isOpen && options.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAll();
                            }}
                            className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
                            disabled={options.length === 0}
                        >
                            {selectedValues.length === options.length && options.length > 0 ? "Hiçbirini Seçme" : "Tümünü Seç"}
                        </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                        {options.length > 0 ? (
                            options.map((option) => (
                                <div
                                    key={option.value}
                                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle(option.value);
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option.value)}
                                        readOnly
                                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-gray-500">
                                Seçenek bulunamadı
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Custom PDF generation function for B2B Ekstre Raporu
const generateB2BEkstreRaporuPdf = async (
  elementId: string, 
  filename: string = 'b2b-ekstre-raporu.pdf',
  reportData: B2BEkstreRaporResponse | null,
  expandedDonemler: Set<number>,
  expandedKategoriler: Set<string>,
  setExpandedDonemler: React.Dispatch<React.SetStateAction<Set<number>>>,
  setExpandedKategoriler: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID '${elementId}' not found.`);
    alert('Rapor bulunamadı. Lütfen tekrar deneyin.');
    return;
  }

  // Store original button content
  let originalButtonContent = '';
  const printButton = input.querySelector('.print-button');
  if (printButton) {
    originalButtonContent = printButton.innerHTML;
    // Show loading state
    printButton.innerHTML = '<div class="flex items-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>PDF Oluşturuluyor...</div>';
  }

  // Store original expanded states
  const originalExpandedDonemler = new Set(expandedDonemler);
  const originalExpandedKategoriler = new Set(expandedKategoriler);

  try {
    // Expand all periods and categories temporarily
    const allDonemler = reportData?.data.map(donemGroup => donemGroup.donem) || [];
    const allKategoriler = new Set<string>();
    
    reportData?.data.forEach(donemGroup => {
      donemGroup.kategoriler.forEach(kategoriGroup => {
        const key = `${donemGroup.donem}-${kategoriGroup.kategori_id || 'uncategorized'}`;
        allKategoriler.add(key);
      });
    });

    // Update state to expand all periods and categories
    setExpandedDonemler(new Set(allDonemler));
    setExpandedKategoriler(allKategoriler);

    // Wait for state updates and re-rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // Refresh the input element reference after state changes
    const updatedInput = document.getElementById(elementId);
    if (!updatedInput) {
      throw new Error('Element not found after state update');
    }

    // Temporarily hide elements that shouldn't appear in PDF
    const elementsToHide = updatedInput.querySelectorAll('.hide-on-pdf, .print-button, .screen-only-input');
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Temporarily adjust layout for better PDF rendering
    const originalStyles: {element: HTMLElement, styles: {[key: string]: string}}[] = [];
    
    // Handle overflow containers
    const overflowContainers = updatedInput.querySelectorAll('.overflow-x-auto, .overflow-hidden, .overflow-auto');
    overflowContainers.forEach(container => {
      const el = container as HTMLElement;
      originalStyles.push({
        element: el,
        styles: {
          overflow: el.style.overflow,
          width: el.style.width,
          maxWidth: el.style.maxWidth,
          maxHeight: el.style.maxHeight
        }
      });
      el.style.overflow = 'visible';
      el.style.width = 'max-content';
      el.style.maxWidth = 'none';
      el.style.maxHeight = 'none';
    });

    // Handle table layouts
    const tables = updatedInput.querySelectorAll('table');
    tables.forEach(table => {
      const el = table as HTMLElement;
      originalStyles.push({
        element: el,
        styles: {
          width: el.style.width,
          tableLayout: el.style.tableLayout
        }
      });
      el.style.width = '100%';
      el.style.tableLayout = 'auto';
    });

    // Handle grid layouts
    const grids = updatedInput.querySelectorAll('.grid');
    grids.forEach(grid => {
      const el = grid as HTMLElement;
      originalStyles.push({
        element: el,
        styles: {
          display: el.style.display,
          gridTemplateColumns: el.style.gridTemplateColumns
        }
      });
      // Force single column layout for PDF
      el.style.display = 'block';
    });

    // Handle flex layouts that might cause issues
    const flexContainers = updatedInput.querySelectorAll('.flex');
    flexContainers.forEach(flex => {
      const el = flex as HTMLElement;
      originalStyles.push({
        element: el,
        styles: {
          flexWrap: el.style.flexWrap
        }
      });
      // Prevent wrapping for better PDF layout
      el.style.flexWrap = 'nowrap';
    });

    // Wait for layout changes to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    // Calculate the full dimensions of the content
    const scrollWidth = Math.max(updatedInput.scrollWidth, window.innerWidth);
    const scrollHeight = Math.max(updatedInput.scrollHeight, window.innerHeight);
    
    // Add some padding to ensure all content is captured
    const padding = 20;
    const canvasWidth = scrollWidth + padding * 2;
    const canvasHeight = scrollHeight + padding * 2;

    // Use html2canvas with enhanced options for better quality
    const canvas = await html2canvas(updatedInput, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollX: -padding,
      scrollY: -padding,
      width: canvasWidth,
      height: canvasHeight,
      windowWidth: canvasWidth,
      windowHeight: canvasHeight,
      logging: false, // Reduce console output
      onclone: (clonedDoc) => {
        // Additional adjustments in the cloned document
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.padding = `${padding}px`;
        }
      }
    });

    // Create PDF with proper dimensions
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Use landscape orientation for better width handling
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    // If content is very wide, consider using portrait with smaller scale
    const isVeryWide = canvas.width > canvas.height * 1.5;
    if (isVeryWide) {
      // For very wide content, use portrait with adjusted scaling
      const portraitPdf = new jsPDF('p', 'mm', 'a4');
      portraitPdf.deletePage(1); // Remove default page
      pdf.deletePage(1); // Remove landscape page
      
      // Add pages with proper scaling
      const pageWidth = portraitPdf.internal.pageSize.getWidth();
      const pageHeight = portraitPdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add first page
      portraitPdf.addPage();
      portraitPdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Add additional pages if needed
      if (canvas.height > canvas.width) {
        const totalPages = Math.ceil(canvas.height / canvas.width);
        for (let i = 1; i < totalPages; i++) {
          portraitPdf.addPage();
          const sourceY = i * canvas.width;
          const sourceHeight = Math.min(canvas.width, canvas.height - sourceY);
          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = canvas.width;
          croppedCanvas.height = sourceHeight;
          const ctx = croppedCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            const croppedImgData = croppedCanvas.toDataURL('image/png', 1.0);
            portraitPdf.addImage(croppedImgData, 'PNG', 10, 10, imgWidth, (sourceHeight * imgWidth) / canvas.width);
          }
        }
      }
      
      // Save the PDF
      portraitPdf.save(filename);
    } else {
      // For normal content, use landscape
      const imgWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(filename);
    }

    // Restore original styles
    originalStyles.forEach(({element, styles}) => {
      Object.entries(styles).forEach(([key, value]) => {
        (element.style as any)[key] = value;
      });
    });

    // Show hidden elements again
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = '';
    });

    // Restore original expanded states
    setExpandedDonemler(originalExpandedDonemler);
    setExpandedKategoriler(originalExpandedKategoriler);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    // Restore original button content
    if (printButton) {
      printButton.innerHTML = originalButtonContent;
    }
  }
};

// Excel export function for B2B Ekstre Raporu
const exportToExcel = (reportData: B2BEkstreRaporResponse | null) => {
  if (!reportData) {
    alert('Veri bulunamadı. Lütfen önce raporu oluşturun.');
    return;
  }

  // Prepare data for Excel
  const excelData: any[] = [];
  
  // Add header row
  excelData.push(['Dönem', 'Kategori', 'Fiş No', 'Tarih', 'Açıklama', 'Borç', 'Alacak', 'Tutar']);
  
  // Add data rows
  reportData.data.forEach(donemGroup => {
    donemGroup.kategoriler.forEach(kategoriGroup => {
      kategoriGroup.kayitlar.forEach(kayit => {
        excelData.push([
          donemGroup.donem,
          kategoriGroup.kategori_adi,
          kayit.fis_no,
          kayit.tarih,
          kayit.aciklama || '',
          kayit.borc,
          kayit.alacak,
          kayit.tutar
        ]);
      });
    });
  });
  
  // Add totals row
  excelData.push([]);
  excelData.push(['', '', '', '', 'Toplam:', reportData.totals.grand_total]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Adjust column widths
  const colWidths = [
    { wch: 10 }, // Dönem
    { wch: 20 }, // Kategori
    { wch: 15 }, // Fiş No
    { wch: 12 }, // Tarih
    { wch: 30 }, // Açıklama
    { wch: 15 }, // Borç
    { wch: 15 }, // Alacak
    { wch: 15 }  // Tutar
  ];
  ws['!cols'] = colWidths;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'B2B Ekstre Raporu');
  
  // Export to file
  XLSX.writeFile(wb, 'b2b-ekstre-raporu.xlsx');
};

const B2BEkstreRaporuPage: React.FC = () => {
  const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
  const [reportData, setReportData] = useState<B2BEkstreRaporResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<number[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Kategori[]>([]);
  const [expandedDonemler, setExpandedDonemler] = useState<Set<number>>(new Set());
  const [expandedKategoriler, setExpandedKategoriler] = useState<Set<string>>(new Set());
  const [selectAllPeriods, setSelectAllPeriods] = useState<boolean>(false);
  const [selectAllCategories, setSelectAllCategories] = useState<boolean>(false);

  // Generate available periods (last 12 months)
  const generatedPeriods = useMemo(() => {
    if (!currentPeriod) return [];
    
    const periods: number[] = [];
    const currentPeriodNum = parseInt(currentPeriod);
    
    // Check if currentPeriod is a valid number
    if (isNaN(currentPeriodNum)) return [];
    
    for (let i = 0; i < 12; i++) {
      let year = Math.floor(currentPeriodNum / 100);
      let month = currentPeriodNum % 100;
      
      month -= i;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const period = year * 100 + month;
      periods.push(period);
    }
    
    return periods.sort((a, b) => b - a);
  }, [currentPeriod]);

  // Check permissions
  const canViewReport = hasPermission(B2B_EKSTRE_RAPOR_YETKI_ADI);
  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExport = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  // Fetch available categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available categories
        const categoryResponse = await fetch(`${API_BASE_URL}/api/v1/kategori/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (categoryResponse.ok) {
          const categoryData: Kategori[] = await categoryResponse.json();
          // Filter for only "Bilgi" type categories as per B2B requirements
          const b2bCategories = categoryData.filter(cat => cat.Tip === 'Bilgi');
          setAvailableCategories(sortEFaturaKategoriler(b2bCategories));
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (canViewReport && selectedBranch) {
      fetchData();
    }
  }, [canViewReport, selectedBranch]);

  // Set available periods from generated periods
  useEffect(() => {
    if (generatedPeriods && generatedPeriods.length > 0) {
      setAvailablePeriods(generatedPeriods);
    }
  }, [generatedPeriods]);

  // Set default filters (current period)
  useEffect(() => {
    if (availablePeriods && availablePeriods.length > 0 && selectedPeriods.length === 0) {
      // Default to current period
      setSelectedPeriods([availablePeriods[0]]);
      setSelectAllPeriods(false);
    }
  }, [availablePeriods, selectedPeriods.length]);

  // Handle period selection
  const handlePeriodChange = (period: number, checked: boolean) => {
    if (checked) {
      setSelectedPeriods(prev => [...prev, period]);
    } else {
      setSelectedPeriods(prev => prev.filter(p => p !== period));
      setSelectAllPeriods(false);
    }
  };

  // Handle select all periods
  const handleSelectAllPeriods = (checked: boolean) => {
    setSelectAllPeriods(checked);
    if (checked) {
      setSelectedPeriods([...availablePeriods]);
    } else {
      setSelectedPeriods([]);
    }
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
      setSelectAllCategories(false);
    }
  };

  // Handle select all categories
  const handleSelectAllCategories = (checked: boolean) => {
    setSelectAllCategories(checked);
    if (checked) {
      setSelectedCategories(availableCategories.map(cat => cat.Kategori_ID));
    } else {
      setSelectedCategories([]);
    }
  };

  // Toggle period expansion
  const toggleDonemExpansion = (donem: number) => {
    setExpandedDonemler(prev => {
      const newSet = new Set(prev);
      if (newSet.has(donem)) {
        newSet.delete(donem);
      } else {
        newSet.add(donem);
      }
      return newSet;
    });
  };

  // Toggle category expansion within a period
  const toggleKategoriExpansion = (donem: number, kategoriId: number | null) => {
    const key = `${donem}-${kategoriId || 'uncategorized'}`;
    setExpandedKategoriler(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Check if a category is expanded
  const isKategoriExpanded = (donem: number, kategoriId: number | null) => {
    const key = `${donem}-${kategoriId || 'uncategorized'}`;
    return expandedKategoriler.has(key);
  };

  // Generate report
  const generateReport = async () => {
    if (!selectedBranch) {
      setError('Lütfen bir şube seçin.');
      return;
    }

    if (selectedPeriods.length === 0) {
      setError('Lütfen en az bir dönem seçin.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('sube_id', selectedBranch.Sube_ID.toString());
      
      selectedPeriods.forEach(period => {
        params.append('donem', period.toString());
      });
      
      selectedCategories.forEach(categoryId => {
        params.append('kategori', categoryId.toString());
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/report/b2b-ekstre-rapor/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data: B2BEkstreRaporResponse = await response.json();
        setReportData(data);
        // Expand all by default
        const allDonemler = data.data.map(donemGroup => donemGroup.donem);
        const allKategoriler = new Set<string>();
        data.data.forEach(donemGroup => {
          donemGroup.kategoriler.forEach(kategoriGroup => {
            const key = `${donemGroup.donem}-${kategoriGroup.kategori_id || 'uncategorized'}`;
            allKategoriler.add(key);
          });
        });
        setExpandedDonemler(new Set(allDonemler));
        setExpandedKategoriler(allKategoriler);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Rapor oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Rapor oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedPeriods([]);
    setSelectedCategories([]);
    setSelectAllPeriods(false);
    setSelectAllCategories(false);
    setReportData(null);
    setError(null);
  };

  // Memoized category options
  const categoryOptions = useMemo(() => {
    return createKategoriMultiSelectOptions(availableCategories, false);
  }, [availableCategories]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!reportData) return null;
    
    return {
      totalRecords: reportData.total_records,
      periodCount: reportData.data.length,
      grandTotal: reportData.totals.grand_total
    };
  }, [reportData]);

  // Check if data is still loading
  const isDataLoading = (!availablePeriods || availablePeriods.length === 0) && (!categoryOptions || categoryOptions.length === 0);

  if (!canViewReport) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Icons.Lock className="w-12 h-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Erişim Yetkiniz Bulunmamaktadır</h3>
            <p>B2B Ekstre Raporu görüntüleme yetkiniz bulunmamaktadır.</p>
          </div>
        </Card>
      </div>
    );
  }

  // We'll render the component even while loading, but with disabled filters
  // This prevents issues with component initialization

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">B2B Ekstre Raporu</h1>
        <p className="text-gray-600">B2B ekstrelerini dönem ve kategori bazında görüntüleyin.</p>
      </div>

      {/* Filters Section */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end">
          {/* Period Selection */}
          {availablePeriods ? (
            <MultiSelect
              label="Dönem"
              options={availablePeriods.map(period => ({
                value: period,
                label: period.toString()
              }))}
              selectedValues={selectedPeriods}
              onChange={(values) => {
                setSelectedPeriods(values);
                setSelectAllPeriods(values.length === availablePeriods.length && values.length > 0);
              }}
              placeholder="Dönem seçiniz..."
            />
          ) : (
            <div className="flex flex-col space-y-1">
              <label className="block text-sm font-medium text-gray-700">Dönem</label>
              <div className="border border-gray-300 rounded-md p-2 bg-gray-100 min-h-[38px] flex items-center">
                <span className="text-sm text-gray-500">Yükleniyor...</span>
              </div>
            </div>
          )}

          {/* Category Selection */}
          {categoryOptions ? (
            <MultiSelect
              label="Kategori"
              options={categoryOptions}
              selectedValues={selectedCategories}
              onChange={(values) => {
                setSelectedCategories(values);
                setSelectAllCategories(values.length === categoryOptions.length && values.length > 0);
              }}
              placeholder="Kategori seçiniz..."
            />
          ) : (
            <div className="flex flex-col space-y-1">
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <div className="border border-gray-300 rounded-md p-2 bg-gray-100 min-h-[38px] flex items-center">
                <span className="text-sm text-gray-500">Yükleniyor...</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <Button 
              onClick={generateReport} 
              disabled={loading || !selectedBranch || selectedPeriods.length === 0 || isDataLoading}
              className="flex items-center w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Icons.DocumentReport className="w-4 h-4 mr-2" />
                  Filtrele
                </>
              )}
            </Button>
          </div>

          <div className="flex items-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={clearFilters}
              disabled={loading || isDataLoading}
              className="flex items-center w-full"
            >
              <Icons.Close className="w-4 h-4 mr-2" />
              Temizle
            </Button>
          </div>
        </div>

        {isDataLoading && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Veriler yükleniyor...
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </Card>

      {/* Summary Section */}
      {summaryStats && (
        <Card className="mb-6 p-6">
          <h3 className="text-lg font-medium mb-4">Özet Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-sm text-blue-700">Toplam Kayıt</div>
              <div className="text-2xl font-bold text-blue-900">{summaryStats.totalRecords}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-sm text-green-700">Dönem Sayısı</div>
              <div className="text-2xl font-bold text-green-900">{summaryStats.periodCount}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <div className="text-sm text-purple-700">Genel Toplam</div>
              <div className="text-2xl font-bold text-purple-900">{formatNumber(summaryStats.grandTotal)} ₺</div>
            </div>
          </div>
        </Card>
      )}

      {/* Report Table */}
      {reportData && reportData.data.length > 0 && (
        <Card className="p-6" id="b2b-ekstre-raporu-content">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Rapor Detayları</h3>
            <div className="flex gap-2">
              {canPrint && (
                <Button 
                  variant="secondary" 
                  onClick={() => generateB2BEkstreRaporuPdf(
                    'b2b-ekstre-raporu-content', 
                    'b2b-ekstre-raporu.pdf',
                    reportData,
                    expandedDonemler,
                    expandedKategoriler,
                    setExpandedDonemler,
                    setExpandedKategoriler
                  )}
                  className="print-button flex items-center text-sm"
                >
                  <Icons.Print className="w-4 h-4 mr-1" />
                  Yazdır
                </Button>
              )}
              {canExport && (
                <Button 
                  variant="secondary" 
                  onClick={() => exportToExcel(reportData)}
                  className="flex items-center text-sm"
                >
                  <Icons.Download className="w-4 h-4 mr-1" />
                  Excel'e Aktar
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dönem</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiş No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borç</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alacak</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.data.map((donemGroup) => (
                  <React.Fragment key={donemGroup.donem}>
                    {/* Period Group Header */}
                    <tr 
                      className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                      onClick={() => toggleDonemExpansion(donemGroup.donem)}
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <Icons.ChevronRight className={`w-4 h-4 transform transition-transform ${expandedDonemler.has(donemGroup.donem) ? 'rotate-90' : ''}`} />
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap font-medium">
                        {donemGroup.donem}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="font-medium">Dönem Toplamı:</span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap"></td>
                      <td className="px-6 py-3 whitespace-nowrap"></td>
                      <td className="px-6 py-3 whitespace-nowrap"></td>
                      <td className="px-6 py-3 whitespace-nowrap font-medium">
                        {formatNumber(donemGroup.donem_total)} ₺
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap"></td>
                      <td className="px-6 py-3 whitespace-nowrap font-medium">
                        {formatNumber(donemGroup.donem_total)} ₺
                      </td>
                    </tr>

                    {/* Category Groups and Details */}
                    {expandedDonemler.has(donemGroup.donem) && donemGroup.kategoriler.map((kategoriGroup) => {
                      const kategoriKey = `${donemGroup.donem}-${kategoriGroup.kategori_id || 'uncategorized'}`;
                      const isExpanded = expandedKategoriler.has(kategoriKey);
                      
                      return (
                        <React.Fragment key={kategoriKey}>
                          {/* Category Group Header */}
                          <tr 
                            className="bg-blue-50 cursor-pointer hover:bg-blue-100"
                            onClick={() => toggleKategoriExpansion(donemGroup.donem, kategoriGroup.kategori_id)}
                          >
                            <td className="px-8 py-2 whitespace-nowrap">
                              <Icons.ChevronRight className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </td>
                            <td className="px-8 py-2 whitespace-nowrap"></td>
                            <td className="px-6 py-2 whitespace-nowrap font-medium">
                              {kategoriGroup.kategori_adi}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <span className="font-medium">Kategori Toplamı:</span>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap"></td>
                            <td className="px-6 py-2 whitespace-nowrap"></td>
                            <td className="px-6 py-2 whitespace-nowrap font-medium">
                              {formatNumber(kategoriGroup.kategori_total)} ₺
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap"></td>
                            <td className="px-6 py-2 whitespace-nowrap font-medium">
                              {formatNumber(kategoriGroup.kategori_total)} ₺
                            </td>
                          </tr>

                          {/* Detail Rows */}
                          {isExpanded && kategoriGroup.kayitlar.map((kayit) => (
                            <tr key={kayit.ekstre_id} className="hover:bg-gray-50">
                              <td className="px-10 py-2 whitespace-nowrap"></td>
                              <td className="px-8 py-2 whitespace-nowrap"></td>
                              <td className="px-8 py-2 whitespace-nowrap"></td>
                              <td className="px-6 py-2 whitespace-nowrap">
                                {kayit.fis_no}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap">
                                {kayit.tarih}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap">
                                {kayit.aciklama}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap">
                                {formatNumber(kayit.borc)} ₺
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap">
                                {formatNumber(kayit.alacak)} ₺
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap font-medium">
                                {formatNumber(kayit.tutar)} ₺
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* No Data Message */}
      {reportData && reportData.data.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Icons.DocumentReport className="w-12 h-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Kayıt Bulunamadı</h3>
            <p>Seçilen kriterlere uygun B2B ekstresi bulunamadı.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default B2BEkstreRaporuPage;