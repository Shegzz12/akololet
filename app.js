// API endpoint
const API = "https://let-commerce.onrender.com/api/products/all"
const PG = document.querySelector(".product-grid")
const PRIMARY_COLOR = "#6b4b9f"
const ACCENT_COLOR = "#f7d34d"

/**
 * Creates the HTML string for a single product card
 * @param {object} product - Product data from the API
 * @returns {string} HTML string
 */
function createProductCardHTML(product) {
    const priceValue = product.price || 0
    const formattedPrice = priceValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return `
        <div class="boxes">
            <p class="par1">EXCLUSIVE DISCOUNT</p>
            <img src="${product.image_urls || "placeholder.svg?height=200&width=200"}" alt="${product.category || "Product"}" class="imgsrc">
            <h1>${product.name || "Product Not Named"}</h1>
            <h2>${product.description || "No description available"}</h2>
            <p class="par2">LAST CALL -- <span class="discount">${product.discount || 0}%</span> OFF &  <span class="discount">${product.stock}</span> IN STOCK</p>
            <p class="par3">$ <span class="price">${formattedPrice}</span></p>
            <a href="${product.url || "#"}" target="_blank" class="sub" rel="noopener noreferrer">SHOP NOW</a>
        </div>
    `
}

/**
 * Fetches products and renders them
 */
async function loadProducts() {
    PG.innerHTML = `
        <div style="grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: white;">
            <div class="loader"></div>
            <p style="font-size: 1.1em; margin-top: 15px; font-weight: 600;">LOADING PRODUCTS FROM SERVER...</p>
        </div>
    `

    try {
        const response = await fetch(API, {
            headers: {
                Accept: "application/json",
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const products = await response.json()

        console.log("[v0] Products loaded successfully:", products.length)

        if (!Array.isArray(products) || products.length === 0) {
            PG.innerHTML =
                '<p style="color: white; text-align: center; font-size: 1.2rem; padding: 40px; grid-column: 1/-1;">No products available at the moment.</p>'
            return
        }

        const allCardsHTML = products.map(createProductCardHTML).join("")
        PG.innerHTML = allCardsHTML
    } catch (error) {
        console.error("[v0] Error loading products:", error)
        PG.innerHTML = `
            <div style="
                grid-column: 1/-1;
                border: 2px solid white;
                text-align: center;
                padding: 30px;
                color: white;
                background-color: ${PRIMARY_COLOR};
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            ">
                <p style="font-weight: 700; font-size: 1.3em; margin-bottom: 10px;">CONNECTION ERROR</p>
                <p style="margin-bottom: 20px;">Unable to load products. Please check your connection.</p>
                <button onclick="loadProducts()" style="
                    background-color: ${ACCENT_COLOR};
                    color: ${PRIMARY_COLOR};
                    border: none;
                    padding: 10px 20px;
                    font-weight: 700;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">RETRY</button>
                <p style="font-size: 0.9em; color: rgba(255, 255, 255, 0.7); margin-top: 15px;">Error: ${error.message}</p>
            </div>
        `
    }
}

// Splash screen and initial load
document.addEventListener("DOMContentLoaded", () => {
    console.log("[v0] DOM loaded, initializing app")
    const splash = document.getElementById("splash-screen")

    setTimeout(() => {
        if (splash) {
            splash.classList.add("fade-out")
            splash.addEventListener(
                "transitionend",
                () => {
                    splash.style.display = "none"
                    loadProducts()
                },
                { once: true },
            )
        } else {
            loadProducts()
        }
    }, 2000)
})

// Mobile menu toggle
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
const navLinks = document.querySelector(".nav-links")

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active")
    })

    // Close menu when link is clicked
    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active")
        })
    })
}

// Drag and drop handling
const dropZone = document.getElementById("drop-zone")
const fileInput = document.getElementById("file-input")

if (dropZone) {
    dropZone.addEventListener("click", () => fileInput.click())

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault()
        dropZone.classList.add("drag-over")
    })

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over")
    })

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault()
        dropZone.classList.remove("drag-over")
        const files = Array.from(e.dataTransfer.files)
        fileInput.files = e.dataTransfer.files
    })
}

// Form submission
const contactForm = document.getElementById("contact-form")
const contactStatus = document.getElementById("contact-status")

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault()

        contactStatus.textContent = "✅ Message sent successfully! We'll reply soon."
        contactStatus.classList.remove("error")
        contactStatus.classList.add("success")

        contactForm.reset()

        setTimeout(() => {
            contactStatus.classList.remove("success")
            contactStatus.textContent = ""
        }, 5000)
    })
}
