import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.244.130:8000';

function App() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendHealth();
    fetchItems();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      if (response.data.status === 'healthy') {
        setBackendStatus('connected');
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('disconnected');
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/items`);
      setItems(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/items`, {
        name: newItemName,
        description: description
      });
      setItems([...items, response.data]);
      setNewItemName('');
      setDescription('');
      setError(null);
    } catch (error) {
      console.error('Error creating item:', error);
      setError('Failed to create item');
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/items/${id}`);
      setItems(items.filter(item => item.id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fullstack Application</h1>
        <div className={`status backend-status ${backendStatus}`}>
          Backend Status: {backendStatus}
        </div>
      </header>

      <div className="container">
        <div className="add-item-form">
          <h2>Add New Item</h2>
          <form onSubmit={createItem}>
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">Add Item</button>
          </form>
        </div>

        <div className="items-list">
          <h2>Items ({items.length})</h2>
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && items.length === 0 && (
            <div className="no-items">No items yet. Add one above!</div>
          )}
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <div className="item-info">
                  <strong>{item.name}</strong>
                  {item.description && <p>{item.description}</p>}
                  <small>Created: {new Date(item.created_at).toLocaleString()}</small>
                </div>
                <button onClick={() => deleteItem(item.id)} className="delete-btn">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
