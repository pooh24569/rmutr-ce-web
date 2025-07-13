import axios from "axios";

const API_URL = "http://localhost:3001";

// Login User
export const login = async (username, password) => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      params: { username, password },
    });
    return response.data[0] || null;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};

// Fetch Products
export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.log("Failed to fetch products:", error);
    return null;
  }
};

// Delete Product
export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${API_URL}/products/${id}`);
  } catch (error) {
    console.log("Failed to delete product:", error);
  }
};
