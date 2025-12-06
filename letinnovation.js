const cachedProducts = [];
const BASE_URL = "https://letstore-backend-main-x0dezv.laravel.cloud";
const API = `${BASE_URL}/api/products/all`;
const PRIMARY_COLOR = "#6b4b9f";
const MOBILE_STORE_URL = "https://letinnovations.store";
const AUTH_TOKEN = "50|IOrMHx8J7IGbhjvgX2pgx9TFu830KDXagzunoidI812c2540";
const modalDetails = document.getElementById('product-modal');
const overall = document.getElementById('biggestbox');
const product_description = document.getElementById('product-description');
const product_review = document.getElementById('product-review');
const oldpage = document.getElementById('oldpage');
const newpage = document.getElementById('newpage');
//const PG = document.getElementById('product-grid');
function formatCurrency(price) {
    if (typeof price !== 'number') return 'N 0.00';
    return price.toLocaleString("en-US", {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).replace('NGN', 'N');
}
/**
 * Generates the HTML string for the star rating.
 * @param {number} rating - The numerical rating (1-5).
 * @returns {string} HTML string with star symbols.
 */
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
        <div role="button" class="boxes product-card" data-action="box" data-product-id="${uniqueId}"  tabindex="0" aria-label="View product details for ${product.name}">
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


/**
 * Generates the HTML for a single review item using the styled structure.
 * This maps a single data object to the structured HTML.
 * @param {object} HELP - A single review object {reviewerName, city, score, comment}
 * @returns {string} The HTML string for one review.
 */
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
/**
 * Takes an array of reviews, maps them to HTML, and injects them into the container.
 * This is the core mapping structure you requested.
 * @param {Array<object>} reviewsArray - An array of review objects.
 */
function renderReviews(reviewsArray) {
    product_review.innerHTML = '';

    const allReviewsHTML = reviewsArray.map(HELP => {
        return reviewPart(HELP);
    }).join(''); 
    product_review.innerHTML = allReviewsHTML;
    akolo(product_review);  
}
function akolo(nehemiah){
    newpage.innerHTML = nehemiah.innerHTML;
}
function oldPage() {
    if (oldpage) {
        oldpage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}
function openProductDetails(HELLO) {
    welcomehome(HELLO);
    loadProductData(HELLO);
    product_description.innerHTML = HELLO.description;
    if (overall) {
        overall.style.display = 'block'; 
        document.body.style.overflow = 'hidden';
    }

}



window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeReviewPage();
    }
});

/**
 * Central event delegation function to handle clicks on the product grid and modal buttons.
 * @param {HTMLElement} PG - The parent container to attach the listener to.
 */
function setupProductActionDelegation(PG) {
    if (!PG || PG.__listener_set) {
        if (!PG.__listener_set || PG.id !== 'biggestbox') return;
    }
    
    PG.addEventListener('click', (e) => {
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
            setTimeout(() => {
                messageDiv.classList.remove('message-visible');
                window.location.href = MOBILE_STORE_URL;
            }, 2000); 
        } else if (action === 'oldpage') {
            e.preventDefault();
            oldPage();
        }
    });

    PG.__listener_set = true;
}


async function loadProducts(PG) {
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
        
        cachedProducts.length = 0;
        cachedProducts.push(...products);

        if (!Array.isArray(products) || products.length === 0) {
            PG.innerHTML = '<p style="color: black; text-align: center; font-size: 1.2rem; padding: 40px; grid-column: 1/-1;">No products available at the moment.</p>';
            return;
        }
        
        PG.innerHTML = products.map(createProductCardHTML).join("");

        setupProductActionDelegation(PG); 
        
        console.log("Products loaded:", products);
    } catch (error) {
        console.error("Error loading products:", error);
        PG.innerHTML = `<p style="text-align: center; color: red; padding: 40px; grid-column: 1/-1;">Error loading products. ${error.message}</p>`;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const searchForm = document.querySelector(".search-form");
    const PG = document.querySelector(".product-grid"); 
    document.body.addEventListener("click", (e) => {
        const tag = e.target.tagName.toLowerCase();
        const interactiveTags = ["input", "textarea", "button", "select", "label", "a"];
        if (!interactiveTags.includes(tag) && !e.target.closest('.boxes') && !e.target.closest('.nav-links') && !e.target.closest('.search-form')) {
        }
    });

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });

    let touchStartY = 0;
    let touchEndY = 0;
    const swipeThreshold = 50;

    function handleSwipe() {
        const swipeDistance = touchStartY - touchEndY;
        if (swipeDistance < -swipeThreshold) {
            searchForm.classList.remove("search-hidden");
        }
    }
    document.addEventListener("touchstart", (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    document.addEventListener("touchend", (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

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
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateSearchVisibility);
            ticking = true;
        }
    }, { passive: true });
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");

    if (dropZone && fileInput) { 
        dropZone.addEventListener("click", () => fileInput.click());
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("drag-over");
        });
        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("drag-over");
        });
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("drag-over");
            fileInput.files = e.dataTransfer.files; 
        });
    }

    const contactForm = document.getElementById("contact-form");
    const contactStatus = document.getElementById("contact-status");

    if (contactForm && contactStatus) { 
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            contactStatus.textContent = "✅ Message sent successfully! We'll reply soon.";
            contactStatus.classList.remove("error");
            contactStatus.classList.add("success");
            contactForm.reset();
            setTimeout(() => {
                contactStatus.classList.remove("success");
                contactStatus.textContent = "";
            }, 5000);
        });
    }

    const splash = document.getElementById("splash-screen");
    const pagePath = window.location.pathname.toLowerCase();
    
    const isProductPage = pagePath.endsWith('index.html') || pagePath === '/' || pagePath.endsWith('/');


    function finalLoadAction() {
        if (isProductPage && PG) {
            loadProducts(PG);
        }
    }

    const splashDuration = 2000;
    const fadeDuration = 1000;

    if (splash) {
        setTimeout(() => {
            splash.classList.add("fade-out");
            setTimeout(() => {
                splash.style.display = "none";
                finalLoadAction();
            }, fadeDuration);
        }, splashDuration);
    } else {
        finalLoadAction();
    }
});