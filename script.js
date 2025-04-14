document.addEventListener('DOMContentLoaded', () => {
    const createItemForm = document.getElementById('createItemForm');
    const searchForm = document.getElementById('searchForm');
    const itemList = document.getElementById('itemList');
  
    // create stuff
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
          // Clear
          createItemForm.reset();
          
          alert(result.message);
          
          document.getElementById('searchQuery').value = '';
          await searchItems();
        } else {
          alert(result.error || 'Failed to create item');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating the item');
      }
    });
  
    // Search function 
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
  
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const query = document.getElementById('searchQuery').value;
      await searchItems(query);
    });
  
    searchItems();
  });