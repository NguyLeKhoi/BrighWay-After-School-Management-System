import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from '../index';

// Mock FileReader properly
const mockFileReader = {
  result: null,
  onloadend: null,
  readAsDataURL: vi.fn(function(file) {
    this.result = `data:image/png;base64,${file.name}`;
    if (this.onloadend) {
      this.onloadend();
    }
  })
};

global.FileReader = vi.fn(() => mockFileReader);

// Mock FileReader
global.FileReader = class FileReader {
  constructor() {
    this.result = null;
    this.onloadend = null;
  }
  
  readAsDataURL(file) {
    this.result = `data:image/png;base64,${file.name}`;
    if (this.onloadend) {
      this.onloadend();
    }
  }
};

describe('ImageUpload', () => {
  const mockOnChange = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<ImageUpload onChange={mockOnChange} />);
    
    expect(screen.getByText('Ảnh đại diện')).toBeInTheDocument();
    expect(screen.getByText(/Kéo thả ảnh hoặc nhấn để chọn/)).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(<ImageUpload onChange={mockOnChange} label="Custom Label" />);
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('should show required indicator when required', () => {
    render(<ImageUpload onChange={mockOnChange} required />);
    
    const label = screen.getByText('Ảnh đại diện');
    expect(label).toBeInTheDocument();
    // Check for required asterisk (red star)
    const asterisk = label.parentElement?.querySelector('span[style*="color: red"]');
    expect(asterisk).toBeTruthy();
  });

  it('should handle file selection via input', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const { container } = render(<ImageUpload onChange={mockOnChange} />);
    
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(file);
    });
  });

  it('should reject non-image files', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(<ImageUpload onChange={mockOnChange} />);
    
    const input = container.querySelector('input[type="file"]');
    
    // Simulate file input change
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    // The component checks file type in handleFileSelect
    // Since it's not an image, alert should be called
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Vui lòng chọn file ảnh');
    });
    
    expect(mockOnChange).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('should reject files exceeding max size', async () => {
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(<ImageUpload onChange={mockOnChange} maxSize={10 * 1024 * 1024} />);
    
    const input = container.querySelector('input[type="file"]');
    await user.upload(input, largeFile);
    
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Kích thước file không được vượt quá'));
    expect(mockOnChange).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('should display preview when File is provided', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    render(<ImageUpload onChange={mockOnChange} value={file} />);
    
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  it('should display preview when URL string is provided', () => {
    const imageUrl = 'https://example.com/image.png';
    render(<ImageUpload onChange={mockOnChange} value={imageUrl} />);
    
    const img = screen.getByAltText('Preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', imageUrl);
  });

  it('should show change image button when preview exists', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    render(<ImageUpload onChange={mockOnChange} value={file} />);
    
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
    
    // Should show "Chọn ảnh khác" button
    expect(screen.getByText('Chọn ảnh khác')).toBeInTheDocument();
  });

  it('should handle change image button', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const { container } = render(<ImageUpload onChange={mockOnChange} value={file} />);
    
    await waitFor(() => {
      expect(screen.getByText('Chọn ảnh khác')).toBeInTheDocument();
    });
    
    const changeButton = screen.getByText('Chọn ảnh khác');
    await user.click(changeButton);
    
    // File input should be triggered
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ImageUpload onChange={mockOnChange} disabled />);
    
    const uploadButton = screen.getByText('Chọn ảnh');
    expect(uploadButton).toBeDisabled();
  });

  it('should show error state', () => {
    const { container } = render(<ImageUpload onChange={mockOnChange} error />);
    
    const paper = container.querySelector('div[class*="Paper"]');
    expect(paper).toBeTruthy();
  });

  it('should handle drag and drop', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const { container } = render(<ImageUpload onChange={mockOnChange} />);
    
    const dropZone = container.querySelector('div[class*="Paper"]');
    
    fireEvent.dragEnter(dropZone);
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
      }
    });
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(file);
    });
  });

  it('should accept custom accept prop', () => {
    const { container } = render(<ImageUpload onChange={mockOnChange} accept="image/jpeg,image/png" />);
    
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png');
  });
});

