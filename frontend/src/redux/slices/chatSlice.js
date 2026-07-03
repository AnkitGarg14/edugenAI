import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, thunkAPI) => {
  try {
    const response = await api.get('/ai/chats');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId, thunkAPI) => {
  try {
    const response = await api.get(`/ai/chats/${chatId}/messages`);
    return { chatId, messages: response.data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ chatId, question, documentIds }, thunkAPI) => {
  try {
    const response = await api.post('/ai/chat', { chatId, question, documentIds });
    // Returns { message: aiMessage, chatId: updatedChatId }
    // Note: We need to optimistically add the user message before this returns, 
    // but the actual user message isn't returned by the backend currently, only the AI message.
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const processDocumentTrigger = createAsyncThunk('chat/processDocument', async (documentId, thunkAPI) => {
  try {
    await api.post(`/ai/process/${documentId}`);
    return documentId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = {
  chats: [],
  currentChatId: null,
  messages: [],
  activeDocumentIds: [],
  loading: false,
  messageLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChatId = action.payload;
    },
    setActiveDocuments: (state, action) => {
      state.activeDocumentIds = action.payload;
    },
    optimisticUserMessage: (state, action) => {
      state.messages.push({
        _id: Date.now().toString(),
        role: 'user',
        content: action.payload,
        createdAt: new Date().toISOString()
      });
      state.messageLoading = true;
    },
    createNewChat: (state) => {
      state.currentChatId = null;
      state.messages = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentChatId === action.payload.chatId) {
          state.messages = action.payload.messages;
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messageLoading = false;
        
        // Add AI message
        state.messages.push(action.payload.message);
        
        // If it was a new chat, update ID and list
        if (!state.currentChatId && action.payload.chatId) {
          state.currentChatId = action.payload.chatId;
          // Ideally fetch chats again or push to list
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.messageLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentChat, setActiveDocuments, optimisticUserMessage, createNewChat } = chatSlice.actions;
export default chatSlice.reducer;
