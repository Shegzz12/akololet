const cachedProducts = [];
const BASE_URL = "https://letstore-backend-main-x0dezv.laravel.cloud";
const API = `${BASE_URL}/api/products/all`;
const PRIMARY_COLOR = "#6b4b9f";
const MOBILE_STORE_URL = "https://letinnovations.store";
const AUTH_TOKEN = "50|IOrMHx8J7IGbhjvgX2pgx9TFu830KDXagzunoidI812c2540";

// Global state to track if we should cleanup
let shouldCleanup = false;
let cleanupCallbacks = [];
let activeTimeouts = [];
let activeIntervals = [];

// DOM Elements
const modalDetails = document.getElementById('product-modal');
const overall = document.getElementById('biggestbox');
const product_description = document.getElementById('product-description');
const product_review = document.getElementById('product-review');
const oldpage = document.getElementById('oldpage');
const newpage = document.getElementById('newpage');

function formatCurrency(price) {
    if (typeof price !== 'number') return 'N 0.00';
    return price.toLocaleString("en-US", {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).replace('NGN', 'N');
}

function generateStarRating(rating) {
    const safeRating = Math.max(0, Math.min(5, Math.floor(rating)));
    const filledStars = '★'.repeat(safeRating);
    const emptyStars = '☆'.repeat(5 - safeRating);
    return `<span class="ratingspan" >${filledStars}${emptyStars}</span>`;
}

function getAuthHeaders(contentType = 'application/json') {
    if (!AUTH_TOKEN) {
        console.warn("Authentication required. Bearer Token missing.");
        alert("Please sign in to proceed.");
        return null;
    }
    return {
        'Content-Type': contentType,
        'Authorization': `Bearer ${AUTH_TOKEN}`
    };
}

function getProductDataById(productId) {
    return cachedProducts.find(p => String(p.id) === String(productId));
}

function createProductCardHTML(product) {
    const priceValue = product.price || 0;
    const formattedPrice = priceValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const uniqueId = product.id.toString();
    return `
        <div role="button" class="boxes product-card" data-action="box" data-product-id="${uniqueId}"  tabindex="0" aria-label="View product details for ${product.name}">
            <p class="par1">EXCLUSIVE DISCOUNT</p>
            <img src="${product.image_urls}" alt="${product.category || "Product"}" class="imgsrc">
            
            <h1 class="mrname">${product.name || "Product Not Named"}</h1>
            <h2>${product.category || "No description available"}</h2>
            <p class="par2"> <span class="discount">${product.discount || 0}%</span> OFF & <span class="discount">${product.stock}</span>IN STOCK</p>
            <p class="par3">N <span class="price">${formattedPrice}</span></p>
            
            <button class = "sub" data-action="shop-now" data-product-id="${uniqueId}">PRODUCT DETAILS</button>
        </div>
    `;
}

function closeProductDetails() {
    if (overall) {
        overall.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closeReviewPage() {
    if (oldpage) {
        console.log("its closing")
        oldpage.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function loadProductData(HELD) {
    // Only proceed if we haven't been asked to cleanup
    if (shouldCleanup) return;
    
    modalDetails.innerHTML = 
    `
    <div class="col1">
        <img src="${HELD.image_urls}" alt="${HELD.name}" class="product-image-area">
    </div>

    <div class="col2" data-product-id="${HELD.id}">
                
        <h1 class="product-name">${HELD.name}</h1>
                
        <p class="product-status">${HELD.stock} In Stock</p> 
        <span class="priceh">
            <span class = "discount"> ${HELD.discount}% </span> OFF 
            <span class="costprice">
                <span class="naira">N</span>${Math.round((100 * HELD.price)/(100 - HELD.discount),2)}
            </span> =
            <span class="sellingprice">
                <span class="naira1">N</span> ${HELD.price}
            </span>
        </span><br>
        <div class="hellobuttons">  
            <button id="add-to-cart-btn" 
                class="btn" data-action="redirect-cart" data-product-id="${HELD.id}">SHOP NOW
            </button>
            <button class="button-reviewer" data-action="oldpage" data-product-id="${HELD.id}">PRODUCT REVIEW</button>
        </div>       
    </div>
    <div class="col3">
        <button class="modal-close-btn" onclick="closeProductDetails()" aria-label="Close product details modal">&times;</button>
    </div>
    `;
    
    if (modalDetails) {
        setupProductActionDelegation(modalDetails);
    }
}

let reviewsArray;
async function welcomehome(HELD) {
    // Only proceed if we haven't been asked to cleanup
    if (shouldCleanup) return;
    
    const reviewUrl = `${BASE_URL}/api/products/${HELD.id}/reviews`;
    let reviewData;
    try {
        console.log(`Attempting to fetch reviews from: ${reviewUrl}`);
        const response = await fetch(reviewUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Assign the fetched data to reviewData
        reviewData = await response.json(); 
        console.log('✅ Product Review Data Received:', reviewData);
        
    } catch (error) {
        console.log("error fetching products and product review", error);
        return;
    }

    reviewsArray = reviewData?.reviews ?? [];
    renderReviews(reviewsArray);
}

function reviewPart(WELCOME) {  
    const star = generateStarRating(WELCOME.rating);
    if (oldpage) {
        setupProductActionDelegation(oldpage);
    }
    return `
        <div class="column111">
            <div>
                <h4 id="firstname">${WELCOME.user.firstname}</h4>
                <p id="firstcity">${WELCOME.user.city}</p>
                <div id="starrating">${star}</div>
            </div>
            <div class="whatsyourname">
                <p id="review-comment">${WELCOME.comment}</p>
            </div>
        </div>
    `
}

function renderReviews(reviewsArray) {
    // Only proceed if we haven't been asked to cleanup
    if (shouldCleanup) return;
    
    product_review.innerHTML = '';

    const allReviewsHTML = reviewsArray.map(HELP => {
        return reviewPart(HELP);
    }).join(''); 
    product_review.innerHTML = allReviewsHTML;
    akolo(product_review);  
}

function akolo(nehemiah){
    // Only proceed if we haven't been asked to cleanup
    if (shouldCleanup) return;
    
    newpage.innerHTML = nehemiah.innerHTML;
}

function oldPage() {
    // Only proceed if we haven't been asked to cleanup
    if (shouldCleanup) return;
    
    if (oldpage) {
        oldpage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function openProductDetails(HELLO) {
    // Only proceed if we haven't been asked to cleanup
    if (shouldCleanup) return;
    
    welcomehome(HELLO);
    loadProductData(HELLO);
    product_description.innerHTML = HELLO.description;
    if (overall) {
        overall.style.display = 'block'; 
        document.body.style.overflow = 'hidden';
    }
}

function setupProductActionDelegation(PG) {
    if (!PG || PG.__listener_set) {
        if (!PG.__listener_set || PG.id !== 'biggestbox') return;
    }
    
    const clickHandler = (e) => {
        // Don't process clicks if we're cleaning up
        if (shouldCleanup) return;
        
        const clickable = e.target.closest('[data-action][data-product-id]');
        if (!clickable) return;

        const action = clickable.getAttribute("data-action");
        const productId = clickable.getAttribute("data-product-id");
        if (!productId) {
            console.error("Product ID not found on clickable element.", clickable);
            return;
        }

        const productData = getProductDataById(productId);
        if (!productData) {
            console.warn(`Product Id ${productId} not found in cache.`);
            alert("Product data not available. Please try again.");
            return;
        }
       
        if (action === 'box') {
            e.preventDefault(); 
            openProductDetails(productData);

        } else if (action === 'shop-now') {
            e.preventDefault();
            openProductDetails(productData);

        } else if (action === 'redirect-cart') {
            e.preventDefault();
            const messageDiv = document.getElementById('redirect-message');
            messageDiv.classList.add('message-visible');
            const redirectTimeout = setTimeout(() => {
                messageDiv.classList.remove('message-visible');
                window.location.href = MOBILE_STORE_URL;
            }, 2000);
            activeTimeouts.push(redirectTimeout);
        } else if (action === 'oldpage') {
            e.preventDefault();
            oldPage();
        }
    };
    
    PG.addEventListener('click', clickHandler);
    PG.__listener_set = true;
    
    // Store cleanup callback
    cleanupCallbacks.push(() => {
        PG.removeEventListener('click', clickHandler);
        PG.__listener_set = false;
    });
}

async function loadProducts(PG) {
    // Only proceed if we haven't been asked to cleanup
    if (shouldCleanup) return;
    
    PG.innerHTML = `
        <div style="grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
            <div class="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid ${PRIMARY_COLOR}; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;"></div>
            <p style="font-size: 1.1em; margin-top: 15px; font-weight: 600; color:${PRIMARY_COLOR};">LOADING PRODUCTS FROM SERVER...</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;

    try {
        const response = await fetch(API, { headers: { Accept: "application/json" } });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} (Check API endpoint)`);
        }
        
        const fullResponse = await response.json();
        const products = fullResponse.data || [];
        
        // Only update if we haven't been asked to cleanup
        if (shouldCleanup) return;
        
        cachedProducts.length = 0;
        cachedProducts.push(...products);

        if (!Array.isArray(products) || products.length === 0) {
            if (!shouldCleanup) {
                PG.innerHTML = '<p style="color: black; text-align: center; font-size: 1.2rem; padding: 40px; grid-column: 1/-1;">No products available at the moment.</p>';
            }
            return;
        }
        
        if (!shouldCleanup) {
            PG.innerHTML = products.map(createProductCardHTML).join("");
            setupProductActionDelegation(PG); 
        }
        
        console.log("Products loaded:", products);
    } catch (error) {
        console.error("Error loading products:", error);
        if (!shouldCleanup) {
            PG.innerHTML = `<p style="text-align: center; color: red; padding: 40px; grid-column: 1/-1;">Error loading products. ${error.message}</p>`;
        }
    }
}

// Initialize the landing page
function initLandingPage() {
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const searchForm = document.querySelector(".search-form");
    const PG = document.querySelector(".product-grid"); 
    
    // Track event listeners for cleanup
    const eventListeners = [];
    
    // Function to add event listener with cleanup tracking
    function addTrackedEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        eventListeners.push({ element, event, handler, options });
    }
    
    // Mobile menu toggle
    if (menuToggle && navLinks) {
        const menuToggleHandler = () => {
            navLinks.classList.toggle("active");
        };
        
        menuToggle.addEventListener("click", menuToggleHandler);
        eventListeners.push({ element: menuToggle, event: 'click', handler: menuToggleHandler });
        
        // Close menu when clicking nav links
        document.querySelectorAll(".nav-links a").forEach((link) => {
            const linkHandler = () => {
                navLinks.classList.remove("active");
            };
            link.addEventListener("click", linkHandler);
            eventListeners.push({ element: link, event: 'click', handler: linkHandler });
        });
    }

    // Touch swipe handlers
    let touchStartY = 0;
    let touchEndY = 0;
    const swipeThreshold = 50;

    function handleSwipe() {
        const swipeDistance = touchStartY - touchEndY;
        if (swipeDistance < -swipeThreshold) {
            searchForm.classList.remove("search-hidden");
        }
    }
    
    const touchStartHandler = (e) => {
        touchStartY = e.changedTouches[0].screenY;
    };
    
    const touchEndHandler = (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    };
    
    document.addEventListener("touchstart", touchStartHandler, { passive: true });
    document.addEventListener("touchend", touchEndHandler, { passive: true });
    
    eventListeners.push({ element: document, event: 'touchstart', handler: touchStartHandler });
    eventListeners.push({ element: document, event: 'touchend', handler: touchEndHandler });

    // Scroll handler for search visibility
    let lastScrollY = 0;
    let scrollDirection = "up";
    let ticking = false;
    
    function updateSearchVisibility() {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY;
        if (isScrollingDown && scrollDirection !== "down") {
            scrollDirection = "down";
            searchForm.classList.add("search-hidden");
        } else if (!isScrollingDown && scrollDirection !== "up") {
            scrollDirection = "up";
            searchForm.classList.remove("search-hidden");
        }
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    const scrollHandler = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateSearchVisibility);
            ticking = true;
        }
    };
    
    window.addEventListener("scroll", scrollHandler, { passive: true });
    eventListeners.push({ element: window, event: 'scroll', handler: scrollHandler });

    // File drop zone
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");

    if (dropZone && fileInput) { 
        const dropZoneClickHandler = () => fileInput.click();
        const dragoverHandler = (e) => {
            e.preventDefault();
            dropZone.classList.add("drag-over");
        };
        const dragleaveHandler = () => {
            dropZone.classList.remove("drag-over");
        };
        const dropHandler = (e) => {
            e.preventDefault();
            dropZone.classList.remove("drag-over");
            fileInput.files = e.dataTransfer.files; 
        };
        
        dropZone.addEventListener("click", dropZoneClickHandler);
        dropZone.addEventListener("dragover", dragoverHandler);
        dropZone.addEventListener("dragleave", dragleaveHandler);
        dropZone.addEventListener("drop", dropHandler);
        
        eventListeners.push({ element: dropZone, event: 'click', handler: dropZoneClickHandler });
        eventListeners.push({ element: dropZone, event: 'dragover', handler: dragoverHandler });
        eventListeners.push({ element: dropZone, event: 'dragleave', handler: dragleaveHandler });
        eventListeners.push({ element: dropZone, event: 'drop', handler: dropHandler });
    }

    // Contact form
    const contactForm = document.getElementById("contact-form");
    const contactStatus = document.getElementById("contact-status");

    if (contactForm && contactStatus) { 
        const contactSubmitHandler = (e) => {
            e.preventDefault();
            contactStatus.textContent = "✅ Message sent successfully! We'll reply soon.";
            contactStatus.classList.remove("error");
            contactStatus.classList.add("success");
            contactForm.reset();
            const contactTimeout = setTimeout(() => {
                contactStatus.classList.remove("success");
                contactStatus.textContent = "";
            }, 5000);
            activeTimeouts.push(contactTimeout);
        };
        
        contactForm.addEventListener("submit", contactSubmitHandler);
        eventListeners.push({ element: contactForm, event: 'submit', handler: contactSubmitHandler });
    }

    // Escape key handler
    const escapeKeyHandler = (event) => {
        if (event.key === 'Escape') {
            closeReviewPage();
        }
    };
    
    window.addEventListener('keydown', escapeKeyHandler);
    eventListeners.push({ element: window, event: 'keydown', handler: escapeKeyHandler });

    // Splash screen handling
    const splash = document.getElementById("splash-screen");
    const pagePath = window.location.pathname.toLowerCase();
    const isProductPage = pagePath.endsWith('index.html') || pagePath === '/' || pagePath.endsWith('/');

    function finalLoadAction() {
        if (isProductPage && PG && !shouldCleanup) {
            loadProducts(PG);
        }
    }

    const splashDuration = 2000;
    const fadeDuration = 1000;

    if (splash) {
        const splashTimeout = setTimeout(() => {
            splash.classList.add("fade-out");
            const fadeTimeout = setTimeout(() => {
                splash.style.display = "none";
                finalLoadAction();
            }, fadeDuration);
            activeTimeouts.push(fadeTimeout);
        }, splashDuration);
        activeTimeouts.push(splashTimeout);
    } else {
        finalLoadAction();
    }
    
    // Store cleanup function that removes all event listeners
    cleanupCallbacks.push(() => {
        console.log('Cleaning up landing page event listeners...');
        
        // Clear all timeouts
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts = [];
        
        // Clear all intervals
        activeIntervals.forEach(interval => clearInterval(interval));
        activeIntervals = [];
        
        // Remove all event listeners
        eventListeners.forEach(({ element, event, handler, options }) => {
            if (element && handler) {
                element.removeEventListener(event, handler, options);
            }
        });
        
        // Clear any pending fetch requests if possible
        // Note: We can't abort already-sent fetch requests without AbortController
        // but we've already added checks at the beginning of each async function
        
        // Clear cached data
        cachedProducts.length = 0;
        reviewsArray = null;
        
        console.log('Landing page cleanup complete');
    });
}

// Add global cleanup function that can be called when switching to Flutter
window.cleanupLandingPageResources = function() {
    console.log('Starting landing page cleanup...');
    shouldCleanup = true;
    
    // Close any open modals
    if (overall && overall.style.display === 'block') {
        closeProductDetails();
    }
    
    if (oldpage && oldpage.style.display === 'block') {
        closeReviewPage();
    }
    
    // Run all cleanup callbacks
    cleanupCallbacks.forEach(callback => {
        try {
            callback();
        } catch (e) {
            console.error('Error in cleanup callback:', e);
        }
    });
    
    // Clear arrays
    cleanupCallbacks = [];
    activeTimeouts = [];
    activeIntervals = [];
    
    console.log('Landing page resources cleaned up successfully');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLandingPage);
} else {
    // DOM already loaded
    initLandingPage();
}
// Ensure this function exists for the main HTML to call
if (!window.cleanupLandingPageResources) {
    window.cleanupLandingPageResources = function() {
        console.log('Cleaning up landing page resources...');
        // Clear any intervals or timeouts
        // The main cleanup is handled by the HTML removal
    };
}
