import React, { ReactNode, useState, useEffect, useRef, forwardRef, useMemo } from 'react';
import { Icons, DEFAULT_END_DATE, MOCK_UST_KATEGORILER, OZEL_FATURA_YETKI_ADI, HarcamaTipiOptions } from './constants';
import { useAppContext, useDataContext } from './App';
import { 
    Sube, SubeFormData, Kullanici, Rol, Yetki, KullaniciRol, RolYetki, KullaniciFormData, RolFormData, YetkiFormData, 
    DegerFormData, UstKategoriFormData, KategoriFormData, KategoriTip, UstKategori, Kategori, 
    EFatura, InvoiceAssignmentFormData, DigerHarcamaFormData, HarcamaTipi, StokFormData, Stok, StokFiyatFormData, CalisanFormData, PuantajSecimiFormData, NakitFormData, AvansIstekFormData, EFaturaReferansFormData, OdemeReferansFormData, OdemeReferans
} from './types';

// Helper function to convert DD.MM.YYYY to YYYY-MM-DD
const parseDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    // Assuming DD.MM.YYYY
    const [day, month, year] = parts;
    if (day && month && year && year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  // If already YYYY-MM-DD or other, return as is (could add more robust parsing)
  return dateStr; 
};

const calculatePeriod = (dateString: string): string => { // Expects YYYY-MM-DD
  try {
    const date = new Date(dateString); 
    if (isNaN(date.getTime())) throw new Error("Invalid date for period calculation");
    const year = date.getFullYear().toString().substring(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
  } catch (e) {
    console.error("Error calculating period for date:", dateString, e);
    const now = new Date();
    const year = now.getFullYear().toString().substring(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`; // Fallback to current period
  }
};

const getPreviousPeriod = (periodYYAA: string): string => {
  if (!periodYYAA || periodYYAA.length !== 4) return periodYYAA; // Basic validation
  let year = 2000 + parseInt(periodYYAA.substring(0, 2));
  let month = parseInt(periodYYAA.substring(2, 4));

  month--;
  if (month === 0) {
    month = 12;
    year--;
  }
  return `${(year % 100).toString().padStart(2, '0')}${month.toString().padStart(2, '0')}`;
};

// --- Shared UI Components ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, leftIcon, rightIcon, ...props }) => {
  const baseStyle = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center transition-colors duration-150';
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400 border border-gray-300',
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className || ''}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        id={id}
        ref={ref}
        className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        id={id}
        className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
  wrapperClassName?: string;
}
export const Select: React.FC<SelectProps> = ({ label, id, error, children, className, wrapperClassName, ...props }) => {
  return (
    <div className={`w-full ${wrapperClassName || ''}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        id={id}
        className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className || ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className={`bg-white rounded-lg shadow-xl flex flex-col m-4 w-full ${sizeClasses[size]} transform transition-all duration-300 scale-100 max-h-[90vh]`}>
        <div className="flex-shrink-0 flex justify-between items-center p-6 pb-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export const Card: React.FC<{ title?: string; children: ReactNode; className?: string; actions?: ReactNode }> = ({ title, children, className, actions }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 ${className || ''}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          {title && <h2 className="text-lg font-semibold text-gray-700">{title}</h2>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <span title={isActive ? 'Aktif' : 'Pasif'} className="inline-flex items-center justify-center">
      {isActive 
        ? <Icons.ToggleOn /> 
        : <Icons.ToggleOff />}
    </span>
  );
};

interface InlineEditInputProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
}

export const InlineEditInput: React.FC<InlineEditInputProps> = ({ value, onSave, className, placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur(); // Trigger blur to save
    } else if (e.key === 'Escape') {
      setCurrentValue(value); // Revert
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-1 py-0.5 text-sm border border-blue-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)} 
      className={`cursor-pointer min-h-[24px] px-1 py-0.5 text-sm hover:bg-gray-100 rounded-sm truncate ${className || ''}`}
      title="Düzenlemek için tıklayın"
    >
      {currentValue || <span className="text-gray-400">{placeholder || 'Değer girin'}</span>}
    </div>
  );
};


interface NumberSpinnerInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number; // Step for direct input and arrow keys
  buttonStep?: number; // Step for +/- buttons
  precision?: number; // Number of decimal places
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

export const NumberSpinnerInput: React.FC<NumberSpinnerInputProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  buttonStep = 1,
  precision = 3, // Default to 3 for general use like Miktar in StokSayim
  className,
  inputClassName,
  buttonClassName,
  disabled = false,
  onBlur,
}) => {
  const [internalDisplayValue, setInternalDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === undefined || value === null) {
      setInternalDisplayValue('');
    } else {
      setInternalDisplayValue(value.toLocaleString('tr-TR', { minimumFractionDigits: precision, maximumFractionDigits: precision }));
    }
  }, [value, precision]);

  const handleStep = (direction: 'up' | 'down') => {
    if (disabled) return;
    let currentValue = value === undefined ? 0 : value;
    let newValue = direction === 'up' ? currentValue + buttonStep : currentValue - buttonStep;

    if (precision === 0) {
      newValue = Math.round(newValue);
    } else {
      newValue = parseFloat(newValue.toFixed(precision));
    }
    
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const valStr = e.target.value;

    if (valStr === '') {
      setInternalDisplayValue('');
      onChange(undefined);
      return;
    }

    // Convert Turkish format (e.g., "1.234,56") to standard format (e.g., "1234.56")
    const sanitizedValStr = valStr.replace(/\./g, '').replace(',', '.');
    let numVal = parseFloat(sanitizedValStr);

    if (isNaN(numVal)) {
      setInternalDisplayValue(valStr); // Keep invalid input in display for user to correct
      return;
    }
    setInternalDisplayValue(valStr); // Keep user's input format in display
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    const valStr = e.target.value;

    if (valStr === '') {
        onChange(undefined);
    } else {
      // Convert Turkish format (e.g., "1.234,56") to standard format (e.g., "1234.56")
      const sanitizedValStr = valStr.replace(/\./g, '').replace(',', '.');
      let numVal = parseFloat(sanitizedValStr);

      if (isNaN(numVal)) {
          // If after sanitizing and parsing, it's still NaN, revert to previous valid value or empty
          setInternalDisplayValue(value === undefined ? '' : value.toLocaleString('tr-TR', { minimumFractionDigits: precision, maximumFractionDigits: precision }));
          onChange(value); // Revert the actual value as well
      } else {
        if (precision === 0) {
          numVal = Math.round(numVal);
        } else if (precision !== undefined) {
          numVal = parseFloat(numVal.toFixed(precision));
        }

        numVal = Math.max(min, Math.min(max, numVal));
        
        if(numVal !== value) { 
            onChange(numVal);
        }
        setInternalDisplayValue(numVal.toLocaleString('tr-TR', { minimumFractionDigits: precision, maximumFractionDigits: precision }));
      }
    }

    if (onBlur) {
        onBlur();
    }
  };


  return (
    <input
      type="text"
      value={internalDisplayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={precision === 0 ? "1" : (1 / Math.pow(10, precision)).toString()}
      disabled={disabled}
      className={`text-center w-full border-t border-b px-1 py-0.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${inputClassName || 'border-gray-300'}`}
      style={{ MozAppearance: 'textfield' }} // For Firefox to hide default spinners
    />
  );
};


// --- Feature Specific Components --- (Forms, Tables)

// Sube (Branch) Form
interface SubeFormProps {
  initialData?: SubeFormData | null;
  onSubmit: (data: SubeFormData) => void;
  onCancel: () => void;
}
export const SubeForm: React.FC<SubeFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<SubeFormData>(
    initialData || { Sube_Adi: '', Aciklama: '', Aktif_Pasif: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Sube_Adi.trim()) {
      alert("Şube Adı boş olamaz.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Şube Adı" name="Sube_Adi" value={formData.Sube_Adi} onChange={handleChange} required />
      <Textarea label="Açıklama" name="Aciklama" value={formData.Aciklama || ''} onChange={handleChange} rows={3} />
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};


// User Components
interface UserFormProps {
  initialData?: KullaniciFormData | null;
  onSubmit: (data: KullaniciFormData) => void;
  onCancel: () => void;
}
export const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<KullaniciFormData>(
    initialData || { Adi_Soyadi: '', Kullanici_Adi: '', Email: '', Aktif_Pasif: true, Password: '' }
  );

  useEffect(() => {
    if (!initialData) {
      setFormData(prev => ({ ...prev, Password: prev.Kullanici_Adi }));
    }
  }, [formData.Kullanici_Adi, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Adı Soyadı" name="Adi_Soyadi" value={formData.Adi_Soyadi} onChange={handleChange} required />
      <Input label="Kullanıcı Adı" name="Kullanici_Adi" value={formData.Kullanici_Adi} onChange={handleChange} required />
      <Input label="Email" name="Email" type="email" value={formData.Email || ''} onChange={handleChange} />
      <Input 
        label="Şifre" 
        name="Password" 
        type="password" 
        value={formData.Password || ''} 
        onChange={handleChange} 
        required={!initialData} // Required only for new users
        placeholder={!initialData ? "Şifre girin" : "Değiştirmek için yeni şifre girin"}
      />
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

// Role Components
interface RoleFormProps {
  initialData?: RolFormData | null;
  onSubmit: (data: RolFormData) => void;
  onCancel: () => void;
}
export const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<RolFormData>(
    initialData || { Rol_Adi: '', Aciklama: '', Aktif_Pasif: true }
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement> | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
     if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Rol Adı" name="Rol_Adi" value={formData.Rol_Adi} onChange={handleChange} required />
      <Input label="Açıklama" name="Aciklama" value={formData.Aciklama || ''} onChange={handleChange} />
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

// Permission Components
interface PermissionFormProps {
  initialData?: YetkiFormData | null;
  onSubmit: (data: YetkiFormData) => void;
  onCancel: () => void;
}
export const PermissionForm: React.FC<PermissionFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<YetkiFormData>(
    initialData || { Yetki_Adi: '', Aciklama: '', Tip: 'Ekran', Aktif_Pasif: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement> | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Yetki Adı" name="Yetki_Adi" value={formData.Yetki_Adi} onChange={handleChange} required />
      <Input label="Açıklama" name="Aciklama" value={formData.Aciklama || ''} onChange={handleChange} />
      <Select label="Tip" name="Tip" value={formData.Tip || 'Ekran'} onChange={handleChange}>
        <option value="Ekran">Ekran</option>
        <option value="İşlem">İşlem</option>
        <option value="Rapor">Rapor</option>
        <option value="Alan">Alan</option>
      </Select>
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

// Deger (Value) Components
interface DegerFormProps {
  initialData?: DegerFormData | null;
  onSubmit: (data: DegerFormData) => void;
  onCancel: () => void;
}
export const DegerForm: React.FC<DegerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<DegerFormData>({
    Deger_Adi: '',
    Gecerli_Baslangic_Tarih: new Date().toISOString().split('T')[0],
    Gecerli_Bitis_Tarih: DEFAULT_END_DATE,
    Deger_Aciklama: '',
    Deger: 0 
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        Deger: initialData.Deger ?? 0,
        Deger_Aciklama: initialData.Deger_Aciklama ?? '',
      });
    } else {
      // Reset for new entry form
      setFormData({
        Deger_Adi: '',
        Gecerli_Baslangic_Tarih: new Date().toISOString().split('T')[0],
        Gecerli_Bitis_Tarih: DEFAULT_END_DATE,
        Deger_Aciklama: '',
        Deger: 0,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.Gecerli_Baslangic_Tarih) > new Date(formData.Gecerli_Bitis_Tarih)) {
      alert("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
      return;
    }
    onSubmit({
      ...formData,
      Deger: Number(formData.Deger),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Değer Adı" name="Deger_Adi" value={formData.Deger_Adi} onChange={handleChange} required />
      <Input
        label="Geçerli Başlangıç Tarihi"
        name="Gecerli_Baslangic_Tarih"
        type="date"
        value={formData.Gecerli_Baslangic_Tarih}
        onChange={handleChange}
        required
      />
      <Input
        label="Geçerli Bitiş Tarihi"
        name="Gecerli_Bitis_Tarih"
        type="date"
        value={formData.Gecerli_Bitis_Tarih}
        onChange={handleChange}
        required
      />
      <Input
        label="Değer"
        name="Deger"
        type="number"
        step="0.01"
        value={formData.Deger}
        onChange={handleChange}
        required
      />
      <Textarea label="Açıklama" name="Deger_Aciklama" value={formData.Deger_Aciklama || ''} onChange={handleChange} rows={3} />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

// UstKategori Components
interface UstKategoriFormProps {
  initialData?: UstKategoriFormData | null;
  onSubmit: (data: UstKategoriFormData) => void;
  onCancel: () => void;
}
export const UstKategoriForm: React.FC<UstKategoriFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<UstKategoriFormData>(
    initialData || { UstKategori_Adi: '', Aktif_Pasif: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.UstKategori_Adi.trim()) {
        alert("Üst Kategori Adı boş olamaz.");
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Üst Kategori Adı" name="UstKategori_Adi" value={formData.UstKategori_Adi} onChange={handleChange} required />
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

// Kategori Components
interface KategoriFormProps {
  initialData?: KategoriFormData | null;
  ustKategoriler: UstKategori[]; 
  onSubmit: (data: KategoriFormData) => void;
  onCancel: () => void;
}
export const KategoriForm: React.FC<KategoriFormProps> = ({ initialData, ustKategoriler, onSubmit, onCancel }) => {
  const activeUstKategoriler = useMemo(() => {
    return ustKategoriler
      .filter(uk => uk.Aktif_Pasif || (initialData && uk.UstKategori_ID === initialData.Ust_Kategori_ID))
      .sort((a, b) => a.UstKategori_Adi.localeCompare(b.UstKategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [ustKategoriler, initialData]);
  
  const [formData, setFormData] = React.useState<KategoriFormData>(
    initialData || { 
      Kategori_Adi: '', 
      Ust_Kategori_ID: activeUstKategoriler.length > 0 ? activeUstKategoriler[0].UstKategori_ID : 0, 
      Tip: 'Gider', 
      Aktif_Pasif: true, 
      Gizli: false 
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "Ust_Kategori_ID") {
        setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : 0 }));
    }
     else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!formData.Kategori_Adi.trim()) {
        alert("Kategori Adı boş olamaz.");
        return;
    }
    if (!formData.Ust_Kategori_ID || formData.Ust_Kategori_ID === 0) {
        alert("Üst Kategori seçimi zorunludur.");
        return;
    }
    if (!formData.Tip) {
        alert("Tip seçimi zorunludur.");
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Kategori Adı" name="Kategori_Adi" value={formData.Kategori_Adi} onChange={handleChange} required />
      <Select 
        label="Üst Kategori" 
        name="Ust_Kategori_ID" 
        value={formData.Ust_Kategori_ID?.toString() || "0"} 
        onChange={handleChange}
        required
      >
        {activeUstKategoriler.length === 0 && <option value="0" disabled>Aktif Üst Kategori Yok</option>}
        {activeUstKategoriler.map(uk => (
          <option key={uk.UstKategori_ID} value={uk.UstKategori_ID}>{uk.UstKategori_Adi}</option>
        ))}
      </Select>
      <Select label="Tip" name="Tip" value={formData.Tip} onChange={handleChange} required>
        <option value="Gelir">Gelir</option>
        <option value="Gider">Gider</option>
        <option value="Bilgi">Bilgi</option>
        <option value="Ödeme">Ödeme</option>
        <option value="Giden Fatura">Giden Fatura</option>
      </Select>
      <div className="flex space-x-6">
        <label className="flex items-center space-x-2">
            <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
            <span className="text-gray-700">Aktif</span>
        </label>
        <label className="flex items-center space-x-2">
            <input type="checkbox" name="Gizli" checked={formData.Gizli} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
            <span className="text-gray-700">Gizli</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};


interface DigerHarcamaFormProps {
  initialData?: DigerHarcamaFormData | null;
  kategoriler: Kategori[];
  onSubmit: (data: DigerHarcamaFormData) => void;
  onCancel: () => void;
  canEditDonem?: boolean;
}
export const DigerHarcamaForm: React.FC<DigerHarcamaFormProps> = ({ initialData, kategoriler, onSubmit, onCancel, canEditDonem }) => {
  const { currentPeriod } = useAppContext();

  const [formData, setFormData] = useState<DigerHarcamaFormData>(
    initialData || {
      Alici_Adi: '',
      Belge_Numarasi: '',
      Belge_Tarihi: new Date().toISOString().split('T')[0],
      Tutar: 0,
      Kategori_ID: null,
      Harcama_Tipi: 'Nakit',
      Gunluk_Harcama: false,
      Açıklama: '', 
      Imaj: null,
      Imaj_Adi: null,
      Donem: currentPeriod,
    }
  );

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aciklamaError, setAciklamaError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialData) {
        setFormData({
            ...initialData,
            Donem: initialData.Donem || calculatePeriod(initialData.Belge_Tarihi)
        });
        if (initialData.Imaj && typeof initialData.Imaj === 'string') {
            setImagePreview(`data:image/jpeg;base64,${initialData.Imaj}`);
        } else {
            setImagePreview(null);
        }
        // Set initial error state for Açıklama if it exceeds limit
        if (initialData.Açıklama && initialData.Açıklama.length > 45) {
            setAciklamaError("Açıklama alanı 45 karakteri geçemez.");
        } else {
            setAciklamaError(undefined);
        }
    } else {
        setFormData({
            Alici_Adi: '',
            Belge_Numarasi: '',
            Belge_Tarihi: new Date().toISOString().split('T')[0],
            Tutar: 0,
            Kategori_ID: null,
            Harcama_Tipi: 'Nakit',
            Gunluk_Harcama: false,
            Açıklama: '',
            Imaj: null,
            Imaj_Adi: null,
            Donem: currentPeriod,
        });
        setImagePreview(null);
        setAciklamaError(undefined);
    }
  }, [initialData, currentPeriod]);

  const availablePeriods = useMemo(() => {
    const periods = new Set<string>();
    periods.add(currentPeriod);
    let tempPeriod = currentPeriod;
    for (let i = 0; i < 2; i++) {
        tempPeriod = getPreviousPeriod(tempPeriod);
        periods.add(tempPeriod);
    }
    return Array.from(periods).sort((a,b) => b.localeCompare(a));
  }, [currentPeriod]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value, type } = e.target;
    if (name === 'Açıklama') {
        if (value.length > 45) {
            setAciklamaError("Açıklama alanı 45 karakteri geçemez.");
            // Do not update formData for Açıklama if it exceeds the limit
            return; 
        } else {
            setAciklamaError(undefined);
        }
    }

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'Kategori_ID') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormData(prev => ({ ...prev, Imaj: file, Imaj_Adi: file.name }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({ ...prev, Imaj: null, Imaj_Adi: null }));
        setImagePreview(null);
      }
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, Imaj: null, Imaj_Adi: "" })); // Set Imaj_Adi to empty string to signal removal
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aciklamaError) {
        alert(aciklamaError);
        return;
    }
    if (!formData.Alici_Adi.trim()) {
      alert("Alıcı Adı boş olamaz.");
      return;
    }
    if (formData.Tutar <= 0) {
      alert("Tutar pozitif bir değer olmalıdır.");
      return;
    }
    if (!formData.Kategori_ID) {
      alert("Kategori seçimi zorunludur.");
      return;
    }
    onSubmit(formData);
  };
  
  const activeKategoriler = useMemo(() => {
    return kategoriler
      .filter(k => k.Aktif_Pasif && k.Tip === 'Gider')
      .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriler]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Alıcı Adı" name="Alici_Adi" value={formData.Alici_Adi} onChange={handleChange} required />
      <Input label="Belge Numarası" name="Belge_Numarasi" value={formData.Belge_Numarasi || ''} onChange={handleChange} />
      <Input label="Belge Tarihi" name="Belge_Tarihi" type="date" value={formData.Belge_Tarihi} onChange={handleChange} required />
      {canEditDonem && (
        <Select label="Dönem" name="Donem" value={formData.Donem} onChange={handleChange} required>
            {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
      )}
      <Input label="Tutar" name="Tutar" type="number" step="0.01" value={formData.Tutar.toString()} onChange={handleChange} required />
      <Select label="Kategori (Gider)" name="Kategori_ID" value={formData.Kategori_ID?.toString() || ""} onChange={handleChange} required>
        <option value="">Kategori Seçin...</option>
        {activeKategoriler.map(k => (
          <option key={k.Kategori_ID} value={k.Kategori_ID}>{k.Kategori_Adi}</option>
        ))}
      </Select>
      <Select label="Harcama Tipi" name="Harcama_Tipi" value={formData.Harcama_Tipi} onChange={handleChange} required>
        {HarcamaTipiOptions.map(tip => (
          <option key={tip} value={tip}>{tip}</option>
        ))}
      </Select>
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Gunluk_Harcama" checked={formData.Gunluk_Harcama} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Günlük Harcama</span>
        </label>
      </div>
      <Textarea 
        label="Açıklama" 
        name="Açıklama" 
        value={formData.Açıklama || ''} 
        onChange={handleChange} 
        rows={2} 
        maxLength={45} 
        error={aciklamaError} 
      />
      
      {/* Image Upload Fields */}
      <div>
        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Resim Yükle (Opsiyonel)</label>
        <Input 
          id="image-upload" 
          name="Imaj" 
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          className="mb-2"
        />
        {imagePreview && (
          <div className="flex items-center space-x-2 mt-2">
            <img src={imagePreview} alt="Resim Önizleme" className="w-24 h-24 object-cover rounded-md border border-gray-300" />
            <p className="text-sm text-gray-500">{formData.Imaj_Adi}</p>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage} title="Resmi Kaldır">
              <Icons.Delete className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};


// Stok (Stock) Components
interface StokFormProps {
  initialData?: StokFormData | null;
  onSubmit: (data: StokFormData) => void;
  onCancel: () => void;
}
export const StokForm: React.FC<StokFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<StokFormData>(
    initialData || { 
      Urun_Grubu: '', 
      Malzeme_Kodu: '', 
      Malzeme_Aciklamasi: '', 
      Birimi: '', 
      Sinif: '', 
      Aktif_Pasif: true 
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Urun_Grubu.trim()) {
        alert("Ürün Grubu boş olamaz.");
        return;
    }
    if (!formData.Malzeme_Kodu.trim()) {
        alert("Malzeme Kodu boş olamaz.");
        return;
    }
    if (!formData.Malzeme_Aciklamasi.trim()) {
        alert("Malzeme Açıklaması boş olamaz.");
        return;
    }
    if (!formData.Birimi.trim()) {
        alert("Birimi boş olamaz.");
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Ürün Grubu" name="Urun_Grubu" value={formData.Urun_Grubu} onChange={handleChange} required />
      <Input label="Malzeme Kodu" name="Malzeme_Kodu" value={formData.Malzeme_Kodu} onChange={handleChange} required />
      <Textarea label="Malzeme Açıklaması" name="Malzeme_Aciklamasi" value={formData.Malzeme_Aciklamasi} onChange={handleChange} rows={3} required />
      <Input label="Birimi" name="Birimi" value={formData.Birimi} onChange={handleChange} required />
      <Input label="Sınıf" name="Sinif" value={formData.Sinif || ''} onChange={handleChange} />
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

// StokFiyat (Stock Price) Components
interface StokFiyatFormProps {
  initialData?: StokFiyatFormData | null;
  stokList: Stok[]; // To populate Malzeme_Kodu dropdown
  onSubmit: (data: StokFiyatFormData) => void;
  onCancel: () => void;
}
export const StokFiyatForm: React.FC<StokFiyatFormProps> = ({ initialData, stokList, onSubmit, onCancel }) => {
  const activeStokList = stokList.filter(s => s.Aktif_Pasif || (initialData && s.Malzeme_Kodu === initialData.Malzeme_Kodu));
  
  const [formData, setFormData] = React.useState<StokFiyatFormData>(
    initialData || {
      Malzeme_Kodu: activeStokList.length > 0 ? activeStokList[0].Malzeme_Kodu : '',
      Gecerlilik_Baslangic_Tarih: new Date().toISOString().split('T')[0],
      Fiyat: 0,
      Aktif_Pasif: true, // Added Aktif_Pasif
      Sube_ID: 0, // Placeholder, will be set by parent component
    }
  );

  useEffect(() => {
    if (initialData && !activeStokList.find(s => s.Malzeme_Kodu === initialData.Malzeme_Kodu)) {
      // This case can happen if the stock item for initialData was deactivated and it's not the first in the general stokList
      // No special action needed here as the select already handles showing pasif items if it's initialData.
    } else if (!initialData && activeStokList.length > 0 && formData.Malzeme_Kodu === '') {
        setFormData(prev => ({...prev, Malzeme_Kodu: activeStokList[0].Malzeme_Kodu}));
    }
  }, [initialData, activeStokList, formData.Malzeme_Kodu]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Malzeme_Kodu) {
      alert("Malzeme Kodu seçimi zorunludur.");
      return;
    }
    if (formData.Fiyat < 0) {
      alert("Fiyat negatif olamaz.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Malzeme Kodu"
        name="Malzeme_Kodu"
        value={formData.Malzeme_Kodu}
        onChange={handleChange}
        required
      >
        <option value="" disabled={activeStokList.length > 0}>Malzeme Seçin...</option>
        {activeStokList.map(stok => (
          <option key={stok.Malzeme_Kodu} value={stok.Malzeme_Kodu}>
            {stok.Malzeme_Kodu} - {stok.Malzeme_Aciklamasi}
          </option>
        ))}
        {initialData && 
         !activeStokList.some(s => s.Malzeme_Kodu === initialData.Malzeme_Kodu) && 
         stokList.find(s => s.Malzeme_Kodu === initialData.Malzeme_Kodu) &&
          (
            <option key={initialData.Malzeme_Kodu} value={initialData.Malzeme_Kodu}>
                {initialData.Malzeme_Kodu} - {stokList.find(s=> s.Malzeme_Kodu === initialData.Malzeme_Kodu)?.Malzeme_Aciklamasi} (Pasif)
            </option>
        )}
      </Select>
      <Input
        label="Geçerlilik Başlangıç Tarihi"
        name="Gecerlilik_Baslangic_Tarih"
        type="date"
        value={formData.Gecerlilik_Baslangic_Tarih}
        onChange={handleChange}
        required
      />
      <Input
        label="Fiyat"
        name="Fiyat"
        type="number"
        step="0.01"
        value={formData.Fiyat.toString()}
        onChange={handleChange}
        required
      />
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

// Calisan (Employee) Form
interface CalisanFormProps {
  initialData?: CalisanFormData & { TC_No?: string } | null; // TC_No is optional for new, present for edit
  onSubmit: (data: CalisanFormData, tcNo: string) => void; // Pass tcNo separately for clarity
  onCancel: () => void;
  isEditMode: boolean;
}
export const CalisanForm: React.FC<CalisanFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [formData, setFormData] = React.useState<CalisanFormData & { TC_No?: string }>(
    initialData || {
      TC_No: '',
      Adi: '',
      Soyadi: '',
      Hesap_No: '',
      IBAN: '',
      Net_Maas: 0,
      Sigorta_Giris: '',
      Sigorta_Cikis: '',
      Aktif_Pasif: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
    } 
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { TC_No, ...restData } = formData;

    if (!TC_No || TC_No.trim().length !== 11 || !/^\d+$/.test(TC_No.trim())) {
      alert("TC Kimlik Numarası 11 haneli ve sayılardan oluşmalıdır.");
      return;
    }
    if (!restData.Adi?.trim()) {
      alert("Adı boş olamaz.");
      return;
    }
    if (!restData.Soyadi?.trim()) {
      alert("Soyadı boş olamaz.");
      return;
    }
    if (restData.IBAN && restData.IBAN.trim().length !== 26) {
        alert("IBAN 26 karakter olmalıdır.");
        return;
    }
    if (restData.Net_Maas && restData.Net_Maas < 0) {
        alert("Net Maaş negatif olamaz.");
        return;
    }
    if (restData.Sigorta_Giris && restData.Sigorta_Cikis && new Date(restData.Sigorta_Cikis) < new Date(restData.Sigorta_Giris)) {
        alert("Sigorta Çıkış Tarihi, Giriş Tarihinden önce olamaz.");
        return;
    }
    
    onSubmit(restData, TC_No.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="TC Kimlik Numarası"
        name="TC_No"
        value={formData.TC_No || ''}
        onChange={handleChange}
        maxLength={11}
        required
        disabled={isEditMode}
        className={isEditMode ? "bg-gray-100" : ""}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Adı" name="Adi" value={formData.Adi} onChange={handleChange} required />
        <Input label="Soyadı" name="Soyadi" value={formData.Soyadi} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Net Maaş" name="Net_Maas" type="number" step="0.01" value={formData.Net_Maas?.toString() || ''} onChange={handleChange} />
        <Input label="Hesap Numarası" name="Hesap_No" value={formData.Hesap_No || ''} onChange={handleChange} />
      </div>
      <Input label="IBAN (TR ile başlayan 26 karakter)" name="IBAN" value={formData.IBAN || ''} onChange={handleChange} maxLength={26} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Sigorta Giriş Tarihi" name="Sigorta_Giris" type="date" value={formData.Sigorta_Giris || ''} onChange={handleChange} />
        <Input label="Sigorta Çıkış Tarihi" name="Sigorta_Cikis" type="date" value={formData.Sigorta_Cikis || ''} onChange={handleChange} />
      </div>
      <div>
        <label className="flex items-center space-x-2 mt-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">{isEditMode ? "Güncelle" : "Kaydet"}</Button>
      </div>
    </form>
  );
};

// PuantajSecimiForm
interface PuantajSecimiFormProps {
  initialData?: PuantajSecimiFormData | null;
  onSubmit: (data: PuantajSecimiFormData) => void;
  onCancel: () => void;
}
export const PuantajSecimiForm: React.FC<PuantajSecimiFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<PuantajSecimiFormData>(
    initialData || {
      Secim: '',
      Degeri: 1.0,
      Renk_Kodu: '#000000',
      Aktif_Pasif: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Secim.trim()) {
      alert("Seçim adı boş olamaz.");
      return;
    }
    if (formData.Degeri === undefined || isNaN(formData.Degeri)) {
        alert("Değeri geçerli bir sayı olmalıdır.");
        return;
    }
    // Basic hex color validation (optional, as type="color" handles it)
    if (!/^#[0-9A-F]{6}$/i.test(formData.Renk_Kodu) && !/^[a-zA-Z]+$/i.test(formData.Renk_Kodu)) {
        // Allow named colors too, or restrict to hex. For now, simple check.
        // For more robust, could use a library.
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Seçim Adı" name="Secim" value={formData.Secim} onChange={handleChange} required />
      <Input 
        label="Değeri (örn: 1.0, 0.5)" 
        name="Degeri" 
        type="number" 
        step="0.1" 
        value={formData.Degeri.toString()} 
        onChange={handleChange} 
        required 
      />
      <div className="flex items-center space-x-3">
        <Input 
            label="Renk Kodu" 
            name="Renk_Kodu" 
            type="color" 
            value={formData.Renk_Kodu} 
            onChange={handleChange} 
            className="p-1 h-10 w-16 border-gray-300" // Adjusted for color type
            required 
        />
        <Input
            type="text"
            value={formData.Renk_Kodu}
            onChange={handleChange}
            name="Renk_Kodu" // Ensure name is here if you want text input to also update
            className="mt-6" // Align with color picker label
            placeholder="örn: #FF0000"
        />
        <div 
            className="w-8 h-8 rounded border border-gray-300 mt-6" 
            style={{ backgroundColor: formData.Renk_Kodu }}
            title={`Seçili Renk: ${formData.Renk_Kodu}`}
        ></div>
      </div>
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};


interface EFaturaReferansFormProps {
  initialData?: EFaturaReferansFormData | null;
  kategoriler: Kategori[];
  onSubmit: (data: EFaturaReferansFormData) => void;
  onCancel: () => void;
}

export const EFaturaReferansForm: React.FC<EFaturaReferansFormProps> = ({ initialData, kategoriler, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<EFaturaReferansFormData>(
    initialData || { Alici_Unvani: '', Referans_Kodu: '', Kategori_ID: 0, Aciklama: '', Aktif_Pasif: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'Kategori_ID' ? (value ? parseInt(value) : null) : value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Alici_Unvani.trim()) {
      alert("Alıcı Ünvanı boş olamaz.");
      return;
    }
    if (!formData.Referans_Kodu.trim()) {
      alert("Referans Kodu boş olamaz.");
      return;
    }
    if (!formData.Kategori_ID) {
      alert("Kategori seçimi zorunludur.");
      return;
    }
    onSubmit(formData);
  };

  const activeKategoriler = useMemo(() => {
    return kategoriler
      .filter(k => k.Aktif_Pasif)
      .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriler]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Alıcı Ünvanı" name="Alici_Unvani" value={formData.Alici_Unvani} onChange={handleChange} required />
      <Input label="Referans Kodu" name="Referans_Kodu" value={formData.Referans_Kodu} onChange={handleChange} required />
      <Select label="Kategori" name="Kategori_ID" value={formData.Kategori_ID || ''} onChange={handleChange} required>
        <option value="">Kategori Seçin...</option>
        {activeKategoriler.map(k => (
          <option key={k.Kategori_ID} value={k.Kategori_ID}>{k.Kategori_Adi}</option>
        ))}
      </Select>
      <Textarea label="Açıklama" name="Aciklama" value={formData.Aciklama || ''} onChange={handleChange} rows={3} />
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="Aktif_Pasif" checked={formData.Aktif_Pasif} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

interface OdemeReferansFormProps {
  initialData?: OdemeReferansFormData | null;
  kategoriler: Kategori[];
  onSubmit: (data: OdemeReferansFormData) => void;
  onCancel: () => void;
}

export const OdemeReferansForm: React.FC<OdemeReferansFormProps> = ({ initialData, kategoriler, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<OdemeReferansFormData>(
    initialData || { Referans_Metin: '', Kategori_ID: 0, Aktif_Pasif: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'Kategori_ID' ? (value ? parseInt(value) : 0) : value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Referans_Metin.trim()) {
      alert("Referans Metni boş olamaz.");
      return;
    }
    if (!formData.Kategori_ID) {
      alert("Kategori seçimi zorunludur.");
      return;
    }
    onSubmit(formData);
  };

  const activeKategoriler = useMemo(() => {
    return kategoriler
      .filter(k => k.Aktif_Pasif)
      .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriler]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input 
        label="Referans Metni" 
        name="Referans_Metin" 
        value={formData.Referans_Metin} 
        onChange={handleChange} 
        maxLength={50}
        required 
      />
      <Select label="Kategori" name="Kategori_ID" value={formData.Kategori_ID || ''} onChange={handleChange} required>
        <option value="">Kategori Seçin...</option>
        {activeKategoriler.map(k => (
          <option key={k.Kategori_ID} value={k.Kategori_ID}>{k.Kategori_Adi}</option>
        ))}
      </Select>
      <div>
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            name="Aktif_Pasif" 
            checked={formData.Aktif_Pasif} 
            onChange={handleChange} 
            className="form-checkbox h-5 w-5 text-blue-600" 
          />
          <span className="text-gray-700">Aktif</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

interface TableProps {
  headers: string[];
  children: ReactNode;
  compact?: boolean;
}

export const TableLayout: React.FC<TableProps> = ({ headers, children, compact = false }) => {
  const headerPadding = compact ? 'px-4 py-2' : 'px-6 py-3'; // Updated compact padding
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className={`${headerPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};

interface NakitFormProps {
  initialData?: NakitFormData | null;
  onSubmit: (data: NakitFormData) => void;
  onCancel: () => void;
}

export const NakitForm: React.FC<NakitFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<NakitFormData>(
    initialData || {
      Tarih: new Date().toISOString().split('T')[0],
      Tutar: "",
      Tip: "Bankaya Yatan",
      Donem: parseInt(new Date().toISOString().slice(2, 4) + (new Date().getMonth() + 1).toString().padStart(2, '0')),
      Imaj_Adı: null,
      Imaj: null,
    }
  );

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.Imaj && typeof initialData.Imaj === 'string') {
      setImagePreview(`data:image/jpeg;base64,${initialData.Imaj}`);
    } else {
      setImagePreview(null);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormData(prev => ({ ...prev, Imaj: file, Imaj_Adı: file.name }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({ ...prev, Imaj: null, Imaj_Adı: null }));
        setImagePreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, Imaj: null, Imaj_Adı: "" }));
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Tarih) {
      alert("Tarih boş olamaz.");
      return;
    }
    if (!formData.Tutar || parseFloat(formData.Tutar.toString()) <= 0) {
      alert("Tutar pozitif bir değer olmalıdır.");
      return;
    }
    if (!formData.Donem) {
      alert("Dönem boş olamaz.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Tarih" name="Tarih" type="date" value={formData.Tarih} onChange={handleChange} required />
      <Input label="Tutar" name="Tutar" type="number" step="0.01" value={formData.Tutar.toString()} onChange={handleChange} required />
      <Select label="Tip" name="Tip" value={formData.Tip} onChange={handleChange} required>
        <option value="Bankaya Yatan">Bankaya Yatan</option>
        <option value="Elden">Elden</option>
        <option value="Banka Transferi">Banka Transferi</option>
      </Select>
      <Select label="Dönem" name="Donem" value={formData.Donem} onChange={handleChange} required>
        {(() => {
          const today = new Date();
          const currentPeriod = parseInt(today.toISOString().slice(2, 4) + (today.getMonth() + 1).toString().padStart(2, '0'));
          const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const previousPeriod = parseInt(previousMonth.toISOString().slice(2, 4) + (previousMonth.getMonth() + 1).toString().padStart(2, '0'));
          
          const periods = [currentPeriod, previousPeriod].sort((a, b) => b - a);

          return periods.map(p => <option key={p} value={p}>{p}</option>);
        })()}
      </Select>
      
      <div>
        <label htmlFor="nakit-image-upload" className="block text-sm font-medium text-gray-700 mb-1">Resim Yükle (Opsiyonel)</label>
        <Input 
          id="nakit-image-upload" 
          name="Imaj" 
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          className="mb-2"
        />
        {imagePreview && (
          <div className="flex items-center space-x-2 mt-2">
            <img src={imagePreview} alt="Resim Önizleme" className="w-24 h-24 object-cover rounded-md border border-gray-300" />
            <p className="text-sm text-gray-500">{formData.Imaj_Adı}</p>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage} title="Resmi Kaldır">
              <Icons.Delete className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};

interface AvansIstekFormProps {
  initialData?: AvansIstekFormData | null;
  calisanList: Calisan[];
  onSubmit: (data: AvansIstekFormData) => void;
  onCancel: () => void;
}
export const AvansIstekForm: React.FC<AvansIstekFormProps> = ({ initialData, calisanList, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<AvansIstekFormData>(
    initialData || {
      TC_No: '',
      Tutar: '',
      Aciklama: '',
      Onay_Durumu: 'Beklemede',
      Talep_Tarihi: new Date().toISOString().split('T')[0],
      Onay_Tarihi: null,
      Red_Nedeni: null,
      Avans_ID: undefined, // For new entries
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Tutar' ? value.replace(/[^0-9,]/g, '') : value, // Allow only numbers and comma for Tutar
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.TC_No) {
      alert("Çalışan seçimi zorunludur.");
      return;
    }
    if (!formData.Tutar || parseFloat(formData.Tutar.replace(',', '.')) <= 0) {
      alert("Tutar pozitif bir değer olmalıdır.");
      return;
    }
    onSubmit(formData);
  };

  const activeCalisanlar = calisanList.filter(c => c.Aktif_Pasif);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Çalışan" name="TC_No" value={formData.TC_No} onChange={handleChange} required>
        <option value="">Çalışan Seçin...</option>
        {activeCalisanlar.map(calisan => (
          <option key={calisan.TC_No} value={calisan.TC_No}>{calisan.Adi} {calisan.Soyadi}</option>
        ))}
      </Select>
      <Input label="Tutar" name="Tutar" value={formData.Tutar} onChange={handleChange} required />
      <Textarea label="Açıklama" name="Aciklama" value={formData.Aciklama || ''} onChange={handleChange} rows={3} />
      
      

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
        <Button type="submit" variant="primary">Kaydet</Button>
      </div>
    </form>
  );
};