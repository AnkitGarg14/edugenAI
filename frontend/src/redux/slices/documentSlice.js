import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const uploadDocument = createAsyncThunk('documents/upload', async (formData, thunkAPI) => {
  try {
    // Axios will automatically set the correct Content-Type with boundary when passing a FormData instance
    const response = await api.post('/documents/upload', formData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const fetchDocuments = createAsyncThunk('documents/fetchAll', async (search = '', thunkAPI) => {
  try {
    const response = await api.get(`/documents${search ? `?search=${search}` : ''}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const fetchRecentDocuments = createAsyncThunk('documents/fetchRecent', async (_, thunkAPI) => {
  try {
    const response = await api.get('/documents/recent');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const fetchDocumentById = createAsyncThunk('documents/fetchById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const deleteDocument = createAsyncThunk('documents/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/documents/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const renameDocument = createAsyncThunk('documents/rename', async ({ id, title }, thunkAPI) => {
  try {
    const response = await api.put(`/documents/${id}/rename`, { title });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

const initialState = {
  documents: [],
  recentDocuments: [],
  currentDocument: null,
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchDocuments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Recent
      .addCase(fetchRecentDocuments.fulfilled, (state, action) => {
        state.recentDocuments = action.payload;
      })
      // Fetch By Id
      .addCase(fetchDocumentById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload
      .addCase(uploadDocument.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload);
        state.recentDocuments.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc._id !== action.payload);
        state.recentDocuments = state.recentDocuments.filter(doc => doc._id !== action.payload);
        if (state.currentDocument && state.currentDocument._id === action.payload) {
          state.currentDocument = null;
        }
      })
      // Rename
      .addCase(renameDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(doc => doc._id === action.payload._id);
        if (index !== -1) state.documents[index] = action.payload;
        
        const recentIndex = state.recentDocuments.findIndex(doc => doc._id === action.payload._id);
        if (recentIndex !== -1) state.recentDocuments[recentIndex] = action.payload;
        
        if (state.currentDocument && state.currentDocument._id === action.payload._id) {
          state.currentDocument = action.payload;
        }
      });
  }
});

export const { clearError, clearCurrentDocument } = documentSlice.actions;
export default documentSlice.reducer;
