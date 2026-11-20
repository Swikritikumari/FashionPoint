import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: []
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartItems: (state, action) => {
            state.items = action.payload;
        },

        removeCartItem: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload)
        },

        updateCartItemQuantity: (state, action) => {

            const { cartItemId, newQuantity } = action.payload;
            const itemToUpdate = state.items.find(item => item._id === cartItemId);

            if (itemToUpdate) {
              itemToUpdate.quantity = newQuantity;
            }
        },

        updateCartItemSize: (state, action) => {
            const { cartItemId, size } = action.payload;
            const itemToUpdate = state.items.find(item => item._id === cartItemId);
            if (itemToUpdate) itemToUpdate.size = size;
        },

    }
});

export const { setCartItems, removeCartItem, updateCartItemQuantity, updateCartItemSize } = cartSlice.actions;

export default cartSlice.reducer;
