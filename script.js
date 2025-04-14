document.addEventListener('DOMContentLoaded', () => {
    const createItemForm = document.getElementById('createItemForm');
    const searchForm = document.getElementById('searchForm');
    const itemList = document.getElementById('itemList');
  
    // Handle item creation
    createItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const description = document.getElementById('description').value;
  
      try {
        const response = await fetch('/create-item', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, description })
        });
  
        const result = await response.json();
  
        if (result.success) {
          // Clear form
          createItemForm.reset();
          
          // Show success message
          alert(result.message);
          
          // Optionally refresh the item list
          document.getElementById('searchQuery').value = '';
          await searchItems();
        } else {
          // Handle error
          alert(result.error || 'Failed to create item');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating the item');
      }
    });
  
    // Search function to be used by both form submit and initial load
    async function searchItems(query = '') {
      try {
        const response = await fetch(`/search-items?query=${encodeURIComponent(query)}`);
        const result = await response.json();
  
        // Clear previous results
        itemList.innerHTML = '';
  
        // Display results
        if (!result.success) {
          itemList.innerHTML = `<p>Error: ${result.error}</p>`;
          return;
        }
  
        if (result.items.length === 0) {
          itemList.innerHTML = '<p>No items found.</p>';
          return;
        }
  
        result.items.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.classList.add('item');
          itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description || 'No description'}</p>
            <small>Created: ${new Date(item.createdAt).toLocaleString()}</small>
          `;
          itemList.appendChild(itemElement);
        });
      } catch (error) {
        console.error('Error:', error);
        itemList.innerHTML = '<p>An error occurred while searching.</p>';
      }
    }
  
    // Handle item search
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const query = document.getElementById('searchQuery').value;
      await searchItems(query);
    });
  
    // Initial load of items
    searchItems();
  });