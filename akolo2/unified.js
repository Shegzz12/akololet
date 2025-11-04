// API endpoint
const API = 'https://let-commerce.onrender.com/api/products/all';
// Get the grid container element. 
// NOTE: This assumes you have an element with the class 'product-grid' in your HTML.
const PG = document.querySelector('.product-grid');

/**
* Creates the HTML string for a single product card (.boxes).
* @param {object} product - An object containing product data from the API.
* @returns {string} The fully constructed HTML string.
*/
function createProductCardHTML(product) {
    // Safely retrieve and format the price, handling potential missing data
    const priceValue = product.price || 0;
    
    // Format price to display with two decimal places
    const formattedPrice = priceValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    
    // NOTE: This HTML structure requires the CSS defined in the original file to display correctly.
    return `
        <div class="boxes">
            <p class="par1">EXCLUSIVE DISCOUNT</p>
            <img src="${product.image_urls || 'No image for this product'} alt="${product.category || 'Not alternative text for this product'}" class="imgsrc">
            <h1>${product.name || 'Product Not Named'}</h1>
            <h2>${product.description}</h2>
            <p class="par2">LAST CALL -- <span class="discount">${product.discount || 0}</span> % OFF &  <span class="discount"> ${product.stock}</span>  IN STOCK</p><br>
            <p class="par3"> $ <span class="price">${formattedPrice}</span></p>
            <a href="${product.url || '#'}" target="_blank" class="sub">SHOP NOW</a>
        </div>
    `;
}

/**
* Fetches product data from the live API, logs it to the console, and renders it in the grid.
*/
async function loadProducts() {
    // Define CSS variables used in the error/loading states (copied from original CSS)
    const PRIMARY_COLOR = '#6b4b9f';
    const ACCENT_COLOR = '#f7d34d';

    // 1. Display the modern loading spinner (inline CSS provided)
    PG.innerHTML = `
        <style>
            /* CSS for the custom spinner animation */
            .loader {
                border: 4px solid rgba(255, 255, 255, 0.4);
                border-top: 4px solid ${ACCENT_COLOR}; 
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 150px; text-align: center; color: white;">
            <div class="loader"></div>
            <p style="font-size: 1.2em; margin-top: 15px;">PLEASE WAIT; PRODUCTS ARE BEING LOADED FROM THE SERVER</p>
        </div>
    `;

    try {
        // 2. Perform the GET request to the live API
        const response = await fetch(API);
        
        // 3. Check for HTTP errors (e.g., 404, 500)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // 4. Parse the JSON response body
        const products = await response.json();

        // --- CORE LOGGING REQUESTED BY THE USER ---
        console.log('--- Fetched Products Array ---');
        console.log(products);
        console.log('------------------------------');
        
        // 5. Data validation and empty check
        if (!Array.isArray(products) || products.length === 0) {
            PG.innerHTML = '<p style="color: white; text-align: center; font-size: 1.5rem; padding: 50px;">SORRY, NO PRODUCTS AVAILABLE NOW.</p>';
            return;
        }

        // 6. Render the products to the HTML
        const allCardsHTML = products.map(createProductCardHTML).join('');
        PG.innerHTML = allCardsHTML;

    } catch (error) {
        console.error('Failed to load products from API:', error);
        
        // 7. Display error message with Retry button
        PG.innerHTML = `
            <div style="
                border: 2px solid white; 
                text-align: center; 
                padding: 30px; 
                color: white; 
                background-color: ${PRIMARY_COLOR}; 
                border-radius: 10px; 
                margin: 20px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            ">
                <p style="font-weight: bold; font-size: 1.5em; margin-bottom: 10px;">
                    FAILED OR UNSTABLE CONNECTION
                </p>
                <p style="margin-bottom: 20px;">
                    PRODUCTS COULD NOT BE FETCHED. CHECK NETWORK OR SERVER STATUS.
                </p>
                
                <!-- Retry button -->
                <button 
                    onclick="loadProducts()"
                    style="
                        background-color: ${ACCENT_COLOR}; 
                        color: ${PRIMARY_COLOR}; 
                        border: 2px solid ${ACCENT_COLOR}; 
                        padding: 10px 20px; 
                        font-weight: bold; 
                        border-radius: 8px;
                        cursor: pointer;
                        transition: background-color 0.2s, transform 0.2s;
                    "
                >
                    RETRY CONNECTION
                </button>
                <p style="font-size: 0.8em; color: rgba(255, 255, 255, 0.7); margin-top: 15px;">Detail: ${error.message}</p>
            </div>
        `;
    }
}

// Script to handle the splash screen and initial product load.
// This assumes there is an element with id 'splash-screen'.
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    setTimeout(() => {
        if (splash) {
            splash.classList.add('fade-out');
            splash.addEventListener('transitionend', () => {
                splash.style.display = 'none';
                // loadProducts is called here after the splash screen hides
                loadProducts(); 
            }, 
            { once: true });
        }
        else {
            // Fallback: If splash screen element is missing, load products immediately
            loadProducts();
        }
    }, 2000); // Display time for splash screen
});
