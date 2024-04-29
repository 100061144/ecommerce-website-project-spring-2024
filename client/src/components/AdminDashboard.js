import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Ensure this path matches your CSS file's location
import SearchBar from './SearchBar'; // Adjust the path as necessary
import { useDropzone } from 'react-dropzone'; // Import useDropzone hook from react-dropzone

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [displaySection, setDisplaySection] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [file, setFile] = useState(null); // State to hold the uploaded file
  const [preview, setPreview] = useState(''); // State to hold the preview URL
  const [analytics, setAnalytics] = useState(null);
  const [analyticsType, setAnalyticsType] = useState(''); // State to manage the type of analytics displayed


  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:3000/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        alert('Failed to fetch analytics: ' + data.message);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      alert('Failed to fetch analytics: ' + error.message);
    }
  };


  // Dropzone hook
  const {
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragReject
  } = useDropzone({
      accept: {
          'image/jpeg': ['.jpeg', '.jpg'],
          'image/png': ['.png'],
          'image/gif': ['.gif'],
          'image/bmp': ['.bmp'],
          'image/tiff': ['.tiff', '.tif'],
          'image/webp': ['.webp']
      },
      onDrop: (acceptedFiles, fileRejections) => {
          console.log('Accepted files:', acceptedFiles.map(file => file.type));
          console.log('Rejected files:', fileRejections.map(({ file }) => file.type));

          // Additional check for file extension
          const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'];
          const allFilesValid = acceptedFiles.every(file => {
              const extension = file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp)$/);
              return extension && validExtensions.includes(extension[0]);
          });

          if (fileRejections.length > 0 || !allFilesValid) {
              alert('Only specific image files (JPEG, PNG, GIF, BMP, TIFF, WebP) are accepted.');
          } else if (acceptedFiles.length > 0 && allFilesValid) {
              const file = acceptedFiles[0];
              setFile(file);
              setPreview(URL.createObjectURL(file));
          }
      }
  });

   // Function to remove the image preview
  const removeImage = (event) => {
    event.stopPropagation(); // Prevent click event from reaching the dropzone input
    setPreview('');
  };

  // Function to fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        alert('Failed to fetch users: ' + data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert('Failed to fetch users: ' + error.message);
    }
  };

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        alert('Failed to fetch orders: ' + data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert('Failed to fetch orders: ' + error.message);
    }
  };

  // Function to fetch products from the backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        alert('Failed to fetch products: ' + data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert('Failed to fetch products: ' + error.message);
    }
  };

  // Function to update order status
  const updateOrderStatus = async (orderID, newStatus) => {
    try {
      const response = await fetch('http://localhost:3000/updateOrderStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderID, newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Order status updated successfully');
        fetchOrders(); // Refresh orders list
      } else {
        alert('Failed to update order status: ' + data.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert('Failed to update order status: ' + error.message);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please add an image for the product.');
      return; // Stop the function if no file is selected
    }
    const newProduct = {
      id: e.target.id.value,
      name: e.target.name.value,
      price: e.target.price.value,
      quantity: e.target.quantity.value,
      description: e.target.description.value,
    };

    const formData = new FormData();
    formData.append('product', JSON.stringify(newProduct));
    formData.append('image', file); // Append the file to FormData

    try {
      const response = await fetch('http://localhost:3000/addProduct', {
        method: 'POST',
        body: formData, // Send formData without setting Content-Type header
      });
      const data = await response.json();
      if (data.success) {
        alert('Product added successfully');
        setShowAddProductForm(false); // Hide the form
        fetchProducts(); // Refresh the products list
      } else {
        alert('Failed to add product: ' + data.message);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert('Failed to add product: ' + error.message);
    }
  };

  useEffect(() => {
    if (displaySection === 'users') {
      fetchUsers();
    } else if (displaySection === 'orders') {
      fetchOrders();
    }
  }, [displaySection]);

  const handleSelectUser = (user) => {
    setSelectedUser(user); // Set the selected user to display details
  };

  // Function to delete a user
  const handleDeleteUser = async (username) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the user ${username}? This action cannot be undone.`);
    if (!isConfirmed) {
      return; // Stop the function if the user cancels
    }

    try {
      const response = await fetch('http://localhost:3000/deleteUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedUsers = users.filter(user => user.username !== username);
        setUsers(updatedUsers);
        setSelectedUser(null); // Optionally, reset selectedUser if the deleted user was being viewed
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user: ' + data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  // Function to delete a product
  const handleDeleteProduct = async (productId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/deleteProduct', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Product deleted successfully');
        fetchProducts(); // Refresh the products list
      } else {
        alert('Failed to delete product: ' + data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert('Failed to delete product: ' + error.message);
    }
  };

  // Function to handle the edit form submission
  const handleEditProduct = async (e) => {
    e.preventDefault();
    const updatedProduct = {
      id: selectedProduct.id,
      name: e.target.name.value,
      price: e.target.price.value,
      quantity: e.target.quantity.value,
      description: e.target.description.value,
    };

    try {
      const response = await fetch('http://localhost:3000/editProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });
      const data = await response.json();
      if (data.success) {
        alert('Product updated successfully');
        setSelectedProduct(updatedProduct);
        fetchProducts(); // Refresh the products list
        setIsEditing(false); // Close the edit form
      } else {
        alert('Failed to update product: ' + data.message);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert('Failed to update product: ' + error.message);
    }
  };

  // Function to sign out
  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Function to handle search query changes
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleDisplaySection = (section) => {
    setDisplaySection(section);
    setSelectedUser(null); // Reset selected user when changing sections
    setAnalyticsType('');
  };

  // Filtered lists based on search query
  const filteredOrders = orders.filter(order => 
    order.orderID.includes(searchQuery) || order.username.includes(searchQuery)
  );

  const filteredProducts = products.filter(product =>
    product.id.includes(searchQuery) ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  useEffect(() => {
    if (displaySection === 'users') {
      fetchUsers();
    } else if (displaySection === 'orders') {
      fetchOrders();
    } else if (displaySection === 'products') {
      fetchProducts();
    } else if (displaySection === 'analytics') {
      fetchAnalytics();
    }
  }, [displaySection]);

  return (
    <div className="admin-dashboard">
      <img src={`/images/UAE_Traditional_Mart.png`} alt="Banner" className="home-banner" />
      <h1>Admin Dashboard</h1>
      <div className="admin-buttons">
        <button onClick={() => handleDisplaySection('products')} className="admin-button">Manage Products</button>
        <button onClick={() => handleDisplaySection('users')} className="admin-button">Manage Users</button>
        <button onClick={() => handleDisplaySection('orders')} className="admin-button">Manage Orders</button>
        <button onClick={() => handleDisplaySection('analytics')} className="admin-button">View Analytics</button>
        <button onClick={handleSignOut} className="admin-sign-out-button">Sign Out</button>
      </div>
      {displaySection === 'users' && (
        <div className="admin-users-content">
          <div className="user-list">
            {users.map((user, index) => (
              <div key={index} className="user-item">
                {user.username}
                <button onClick={() => handleSelectUser(user)} className="details-button">Details</button>
              </div>
            ))}
          </div>
          {selectedUser && (
            <div className="user-details">
              <p className="detail-heading">Username:</p>
              <p>{selectedUser.username}</p>
              <p className="detail-heading">Email:</p>
              <p>{selectedUser.email}</p>
              <p className="detail-heading">Phone Number:</p>
              <p>{selectedUser.phoneNumber}</p>
              <p className="detail-heading">First Name:</p>
              <p>{selectedUser.firstName}</p>
              <p className="detail-heading">Last Name:</p>
              <p>{selectedUser.lastName}</p>
              {selectedUser.username !== "admin" && (
                <button onClick={() => handleDeleteUser(selectedUser.username)} className="delete-user-button">Delete User</button>
              )}
            </div>
          )}
        </div>
      )}
      {displaySection === 'orders' && (
        <>
          <div className="search-bar-container">
            <SearchBar onSearch={handleSearch} placeholder="Search for OrderID..." />
          </div>
          <div className="orders-list">
            {filteredOrders.map((order, index) => (
              <div key={index} className="order-item">
                <p>Order ID: {order.orderID}</p>
                <p>Username: {order.username}</p>
                <p>Date: {order.orderDate}</p>
                <p>Total Price: {order.totalPrice} AED</p>
                <p>Status: {order.status}</p>
                <p>Address: {order.address}</p>
                <div>Products:</div>
                <ul>
                  {order.products.map((product, productIndex) => (
                    <li key={productIndex}>
                      {product.name} - {product.id} (Quantity: {product.quantity})
                    </li>
                  ))}
                </ul>
                <select value={order.status} onChange={(e) => updateOrderStatus(order.orderID, e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            ))}
          </div>
        </>
      )}
      {displaySection === 'analytics' && analytics && (
        <div className="analytics-container">
            <h2>Analytics</h2>
            <div className="analytics-buttons">
                <button onClick={() => setAnalyticsType('basic')} className="analytics-button">Basic Analytics</button>
                <button onClick={() => setAnalyticsType('category')} className="analytics-button">Category Analytics</button>
                <button onClick={() => setAnalyticsType('ratings')} className="analytics-button">Rating Analytics</button>
            </div>
            {analyticsType === 'basic' && (
                <>
                    <h2>Basic Analytics</h2>
                    <p><strong>Most Ordered Product:</strong> {analytics.mostOrderedProduct.name} (Orders: {analytics.mostOrderedProduct.orderCount})</p>
                    <p><strong>Least Ordered Product:</strong> {analytics.leastOrderedProduct.name} (Orders: {analytics.leastOrderedProduct.orderCount})</p>
                    <p><strong>Product with Most Quantity Ordered:</strong> {analytics.mostQuantityOrderedProduct.name} (Quantity: {analytics.mostQuantityOrderedProduct.totalOrdered})</p>
                    <p><strong>Product with Least Quantity Ordered:</strong> {analytics.leastQuantityOrderedProduct.name} (Quantity: {analytics.leastQuantityOrderedProduct.totalOrdered})</p>
                    <p><strong>Order with the Highest Total Price:</strong> {analytics.highestTotalPriceOrder.orderID} (Total Price: {analytics.highestTotalPriceOrder.totalPrice} AED)</p>
                    <p><strong>Order with the Lowest Total Price:</strong> {analytics.lowestTotalPriceOrder.orderID} (Total Price: {analytics.lowestTotalPriceOrder.totalPrice} AED)</p>
                    <p><strong>Average Order Value (AOV):</strong> {analytics.aov} AED</p>
                </>
            )}
            {analyticsType === 'category' && (
                <>
                    <h2>Sales by Product Category:</h2>
                    <ul>
                        {Object.entries(analytics.salesByCategory).map(([category, data]) => {
                            // Define the category names based on category IDs
                            const categoryNames = {
                                '101': 'Men',
                                '102': 'Women',
                                '103': 'Kids'
                            };

                            // Get the category name from the mapping, default to 'Unknown' if not found
                            const categoryName = categoryNames[category] || 'Unknown';

                            return (
                                <li key={category}>
                                    <strong>Category {category} ({categoryName}):</strong> {data.totalQuantity} items sold, Total Sales: {data.totalSales} AED
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            {analyticsType === 'ratings' && (
                <>
                    <h2>Rating Analytics</h2>
                    {analytics.bestRatedProduct && (
                        <p>
                            <strong>Best Rated Product:</strong> {analytics.bestRatedProduct.productName} ({analytics.bestRatedProduct.productId}) - Average Rating: {analytics.bestRatedProduct.averageRating}
                        </p>
                    )}
                    {analytics.worstRatedProduct && (
                        <p>
                            <strong>Worst Rated Product:</strong> {analytics.worstRatedProduct.productName} ({analytics.worstRatedProduct.productId}) - Average Rating: {analytics.worstRatedProduct.averageRating}
                        </p>
                    )}
                </>
            )}
        </div>
      )}
      {displaySection === 'products' && (
        <>
          {!showAddProductForm && !selectedProduct ? (
            <>
              <div className="search-bar-centering-container">
                <SearchBar onSearch={handleSearch} placeholder="Search for products..." />
                <button onClick={() => setShowAddProductForm(true)} className="add-product-button">Add Product</button>
              </div>
              <div className="products-list">
                {filteredProducts.map((product, index) => (
                  <div key={index} className="product-item">
                    <img src={`/images/${product.id}.jpg`} alt={product.name} style={{ width: '100%', height: 'auto' }} />
                    <p>{product.name}</p>
                    <p>Price: {product.price} AED</p>
                    <button onClick={() => handleSelectProduct(product)} className="details-button">View Details</button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="delete-user-button">Delete</button>
                  </div>
                ))}
              </div>
            </>
          ) : showAddProductForm ? (
            <form onSubmit={handleAddProduct} className="add-product-form">
              <input type="text" name="id" placeholder="ID" required />
              <input type="text" name="name" placeholder="Name" required />
              <input type="number" name="price" placeholder="Price" required />
              <input type="number" name="quantity" placeholder="Quantity" required />
              <textarea name="description" placeholder="Description" required></textarea>
              <div {...getRootProps({ 
                  className: `dropzone ${isDragAccept ? 'dropzone--is-drag-accept' : ''} ${isDragReject ? 'dropzone--is-drag-reject' : ''}`
                })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
                {preview && (
                <div className="image-preview-container">
                  <img src={preview} alt="Preview" style={{ width: '100px', height: '100px' }} />
                  <button onClick={removeImage} className="remove-image-button">X</button>
                </div>
              )}
              </div>
              <button type="submit" className="save-changes-button">Submit</button>
              <button type="button" onClick={() => setShowAddProductForm(false)} className="back-button">Back to Products</button>
            </form>
          ) : selectedProduct && (
            <div className="product-details">
              <img src={`/images/${selectedProduct.id}.jpg`} alt={selectedProduct.name} className="product-detail-image" />
              <div className="product-details-text">
                <h2>{selectedProduct.name}</h2>
                <p>ID: {selectedProduct.id}</p>
                <p>Price: {selectedProduct.price}</p>
                <p>Quantity: {selectedProduct.quantity}</p>
                <p>Description: {selectedProduct.description}</p>
                <button onClick={() => setSelectedProduct(null)} className="back-button">Back to Products</button>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="edit-product-button">Edit</button>
                )}
                {isEditing && (
                  <form onSubmit={handleEditProduct}>
                    <input type="text" name="name" defaultValue={selectedProduct.name} />
                    <input type="number" name="price" defaultValue={selectedProduct.price} />
                    <input type="number" name="quantity" defaultValue={selectedProduct.quantity} />
                    <textarea name="description" defaultValue={selectedProduct.description}></textarea>
                    <button type="submit" className="save-changes-button">Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
                </form>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
