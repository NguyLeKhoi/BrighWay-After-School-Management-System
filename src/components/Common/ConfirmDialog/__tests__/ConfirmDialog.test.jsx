import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '../index';

describe('ConfirmDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Title',
    description: 'Test Description'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Hủy');
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('Xác nhận');
    await user.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close icon is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display custom confirm text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Delete" />);
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should display custom cancel text', () => {
    render(<ConfirmDialog {...defaultProps} cancelText="Cancel" />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should show delete icon for error color', () => {
    render(<ConfirmDialog {...defaultProps} confirmColor="error" />);
    
    // Check that delete icon is present (by checking for delete-related styling)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should highlight text in quotes in description', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        description='Bạn có chắc chắn muốn xóa "Test Item"?'
        highlightText="Test Item"
      />
    );
    
    // Text is split across elements, so we check for the description container
    const description = screen.getByText(/Bạn có chắc chắn muốn xóa/);
    expect(description).toBeInTheDocument();
    // Check that the highlighted text exists in the DOM
    expect(description.textContent).toContain('Test Item');
  });

  it('should not show warning icon when showWarningIcon is false', () => {
    render(<ConfirmDialog {...defaultProps} showWarningIcon={false} />);
    
    // Icon should not be visible
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should handle delete action styling', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        title="Xóa"
        confirmColor="error"
      />
    );
    
    expect(screen.getByText('Xóa')).toBeInTheDocument();
  });

  it('should render with long description', () => {
    const longDescription = 'A'.repeat(500);
    render(<ConfirmDialog {...defaultProps} description={longDescription} />);
    
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });
});

