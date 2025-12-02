import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { AppProvider } from '../../contexts/AppContext';
import useBaseCRUD from '../useBaseCRUD';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockShowLoading = vi.fn();
const mockHideLoading = vi.fn();

vi.mock('../useContentLoading', () => ({
  default: () => ({
    isLoading: false,
    loadingText: 'Đang tải...',
    showLoading: mockShowLoading,
    hideLoading: mockHideLoading
  })
}));

describe('useBaseCRUD', () => {
  const mockLoadFunction = vi.fn();
  const mockCreateFunction = vi.fn();
  const mockUpdateFunction = vi.fn();
  const mockDeleteFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction
        }),
        { wrapper: AppProvider }
      );

      expect(result.current.data).toEqual([]);
      expect(result.current.totalCount).toBe(0);
      expect(result.current.page).toBe(0);
      expect(result.current.rowsPerPage).toBe(10);
      expect(result.current.keyword).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.openDialog).toBe(false);
      expect(result.current.dialogMode).toBe('create');
    });

    it('should not load data if loadOnMount is false', () => {
      renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      expect(mockLoadFunction).not.toHaveBeenCalled();
    });
  });

  describe('loadData', () => {
    it('should load data successfully', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Test' }],
        totalCount: 1
      };
      mockLoadFunction.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      await act(async () => {
        await result.current.loadData();
      });

      expect(mockLoadFunction).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse.items);
      expect(result.current.totalCount).toBe(1);
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = { items: [], totalCount: 0 };
      mockLoadFunction.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.setPage(1);
        result.current.setRowsPerPage(20);
      });

      await act(async () => {
        await result.current.loadData();
      });

      expect(mockLoadFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: 2, // page + 1
          pageSize: 20
        })
      );
    });

    it('should include search keyword in params', async () => {
      const mockResponse = { items: [], totalCount: 0 };
      mockLoadFunction.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.handleKeywordChange({ target: { value: 'test' } });
      });

      await act(async () => {
        await result.current.loadData();
      });

      expect(mockLoadFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'test',
          Keyword: 'test'
        })
      );
    });

    it('should handle error when loading fails', async () => {
      const mockError = new Error('Load failed');
      mockLoadFunction.mockRejectedValue(mockError);

      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      await act(async () => {
        await result.current.loadData();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toEqual([]);
    });
  });

  describe('create', () => {
    it('should open dialog in create mode', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          createFunction: mockCreateFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.handleCreate();
      });

      expect(result.current.openDialog).toBe(true);
      expect(result.current.dialogMode).toBe('create');
      expect(result.current.selectedItem).toBeNull();
    });

    it('should create item successfully', async () => {
      const mockResponse = { id: 1, name: 'New Item' };
      mockCreateFunction.mockResolvedValue(mockResponse);
      mockLoadFunction.mockResolvedValue({ items: [], totalCount: 0 });

      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          createFunction: mockCreateFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.handleCreate();
      });

      const formData = { name: 'New Item' };
      await act(async () => {
        await result.current.handleFormSubmit(formData);
      });

      expect(mockCreateFunction).toHaveBeenCalledWith(formData);
      expect(toast.success).toHaveBeenCalledWith('Tạo thành công!', expect.any(Object));
      expect(result.current.openDialog).toBe(false);
    });
  });

  describe('update', () => {
    it('should open dialog in edit mode with selected item', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          updateFunction: mockUpdateFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      const item = { id: 1, name: 'Item' };
      act(() => {
        result.current.handleEdit(item);
      });

      expect(result.current.openDialog).toBe(true);
      expect(result.current.dialogMode).toBe('edit');
      expect(result.current.selectedItem).toEqual(item);
    });

    it('should update item successfully', async () => {
      const mockResponse = { id: 1, name: 'Updated Item' };
      mockUpdateFunction.mockResolvedValue(mockResponse);
      mockLoadFunction.mockResolvedValue({ items: [], totalCount: 0 });

      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          updateFunction: mockUpdateFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      const item = { id: 1, name: 'Item' };
      act(() => {
        result.current.handleEdit(item);
      });

      const formData = { name: 'Updated Item' };
      await act(async () => {
        await result.current.handleFormSubmit(formData);
      });

      expect(mockUpdateFunction).toHaveBeenCalledWith(1, formData);
      expect(toast.success).toHaveBeenCalledWith('Cập nhật thành công!', expect.any(Object));
      expect(result.current.openDialog).toBe(false);
    });
  });

  describe('delete', () => {
    it('should open confirm dialog when deleting', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          deleteFunction: mockDeleteFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      const item = { id: 1, name: 'Item to Delete' };
      act(() => {
        result.current.handleDelete(item);
      });

      expect(result.current.confirmDialog.open).toBe(true);
      expect(result.current.confirmDialog.title).toBe('Xác nhận xóa');
      expect(result.current.confirmDialog.description).toContain('Item to Delete');
    });

    it('should delete item successfully', async () => {
      mockDeleteFunction.mockResolvedValue({});
      mockLoadFunction.mockResolvedValue({ items: [], totalCount: 0 });

      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          deleteFunction: mockDeleteFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      const item = { id: 1, name: 'Item' };
      act(() => {
        result.current.handleDelete(item);
      });

      await act(async () => {
        await result.current.confirmDialog.onConfirm();
      });

      expect(mockDeleteFunction).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Xóa thành công!', expect.any(Object));
      expect(result.current.confirmDialog.open).toBe(false);
    });

    it('should handle delete error', async () => {
      const mockError = { response: { data: { message: 'Delete failed' } } };
      mockDeleteFunction.mockRejectedValue(mockError);
      mockLoadFunction.mockResolvedValue({ items: [], totalCount: 0 });

      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          deleteFunction: mockDeleteFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      const item = { id: 1, name: 'Item' };
      act(() => {
        result.current.handleDelete(item);
      });

      await act(async () => {
        await result.current.confirmDialog.onConfirm();
      });

      expect(toast.error).toHaveBeenCalled();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('search', () => {
    it('should update keyword', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.handleKeywordChange({ target: { value: 'search term' } });
      });

      expect(result.current.keyword).toBe('search term');
      expect(result.current.page).toBe(0); // Reset to first page
    });

    it('should clear search', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          defaultFilters: { status: 'active' },
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.handleKeywordChange({ target: { value: 'search' } });
        result.current.setFilters({ status: 'inactive' });
      });

      act(() => {
        result.current.handleClearSearch();
      });

      expect(result.current.keyword).toBe('');
      expect(result.current.filters).toEqual({ status: 'active' });
      expect(result.current.page).toBe(0);
    });
  });

  describe('pagination', () => {
    it('should change page', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.handlePageChange(null, 2);
      });

      expect(result.current.page).toBe(2);
    });

    it('should change rows per page', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.handleRowsPerPageChange({ target: { value: '25' } });
      });

      expect(result.current.rowsPerPage).toBe(25);
      expect(result.current.page).toBe(0); // Reset to first page
    });
  });

  describe('filters', () => {
    it('should update filter', () => {
      const { result } = renderHook(
        () => useBaseCRUD({
          loadFunction: mockLoadFunction,
          loadOnMount: false
        }),
        { wrapper: AppProvider }
      );

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      expect(result.current.filters.status).toBe('active');
      expect(result.current.page).toBe(0); // Reset to first page
    });
  });
});

