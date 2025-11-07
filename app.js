document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".mobile-menu-toggle")
    const navLinks = document.querySelector(".nav-links")
    const searchForm = document.querySelector(".search-form")

    // Redirect any click anywhere on the page
    document.body.addEventListener("click", (e) => {
        // Allow interactions with internal controls (like form input)
        const tag = e.target.tagName.toLowerCase()
        const interactiveTags = ["input", "textarea", "button", "select", "label"]
        if (!interactiveTags.includes(tag)) {
            window.location.href = "https://mobile.letinnovations.store"
        }
    })

    // --- Mobile menu ---
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active")
        })
    }

    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active")
        })
    })

    // --- Swipe down to show search ---
    let touchStartY = 0
    let touchEndY = 0
    const swipeThreshold = 50

    function handleSwipe() {
        const swipeDistance = touchStartY - touchEndY
        if (swipeDistance < -swipeThreshold) {
            searchForm.classList.remove("search-hidden")
        }
    }

    document.addEventListener("touchstart", (e) => {
        touchStartY = e.changedTouches[0].screenY
    }, { passive: true })

    document.addEventListener("touchend", (e) => {
        touchEndY = e.changedTouches[0].screenY
        handleSwipe()
    }, { passive: true })

    // --- Scroll behavior for search visibility ---
    let lastScrollY = 0
    let scrollDirection = "up"
    let ticking = false

    function updateSearchVisibility() {
        const currentScrollY = window.scrollY
        const isScrollingDown = currentScrollY > lastScrollY

        if (isScrollingDown && scrollDirection !== "down") {
            scrollDirection = "down"
            searchForm.classList.add("search-hidden")
        } else if (!isScrollingDown && scrollDirection !== "up") {
            scrollDirection = "up"
            searchForm.classList.remove("search-hidden")
        }

        lastScrollY = currentScrollY
        ticking = false
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateSearchVisibility)
            ticking = true
        }
    }, { passive: true })

    // --- Product Loading ---
    const API = "https://let-commerce.onrender.com/api/products/all"
    const PG = document.querySelector(".product-grid")
    const PRIMARY_COLOR = "#6b4b9f"
    const ACCENT_COLOR = "#f7d34d"

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

    async function loadProducts() {
        PG.innerHTML = `
            <div style="grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: white;">
                <div class="loader"></div>
                <p style="font-size: 1.1em; margin-top: 15px; font-weight: 600;">LOADING PRODUCTS FROM SERVER...</p>
            </div>
        `

        try {
            const response = await fetch(API, { headers: { Accept: "application/json" } })
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

            const products = await response.json()
            if (!Array.isArray(products) || products.length === 0) {
                PG.innerHTML = '<p style="color: white; text-align: center; font-size: 1.2rem; padding: 40px; grid-column: 1/-1;">No products available at the moment.</p>'
                return
            }

            PG.innerHTML = products.map(createProductCardHTML).join("")
        } catch (error) {
            console.error("Error loading products:", error)
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

    const splash = document.getElementById("splash-screen")
    setTimeout(() => {
        if (splash) {
            splash.classList.add("fade-out")
            splash.addEventListener("transitionend", () => {
                splash.style.display = "none"
                loadProducts()
            }, { once: true })
        } else {
            loadProducts()
        }
    }, 2000)

    // --- Drag & Drop Zone ---
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

    // --- Contact form ---
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
})
