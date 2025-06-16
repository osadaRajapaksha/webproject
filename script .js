// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Car filtering functionality (for cars.html)
const filterButtons = document.querySelectorAll('.filter-btn');
const carCards = document.querySelectorAll('.car-card');
const noResults = document.getElementById('noResults');

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            filterCars(filterValue);
        });
    });
}

// Search functionality
const searchInput = document.getElementById('carSearch');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterCars(getActiveFilter(), searchTerm);
    });
}

// Sort functionality
const sortSelect = document.getElementById('sortCars');
if (sortSelect) {
    sortSelect.addEventListener('change', function() {
        sortCars(this.value);
    });
}

function getActiveFilter() {
    const activeButton = document.querySelector('.filter-btn.active');
    return activeButton ? activeButton.getAttribute('data-filter') : 'all';
}

function filterCars(filterValue, searchTerm = '') {
    let visibleCount = 0;
    
    carCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const carName = card.getAttribute('data-name').toLowerCase();
        
        const matchesFilter = filterValue === 'all' || category === filterValue;
        const matchesSearch = searchTerm === '' || carName.includes(searchTerm);
        
        if (matchesFilter && matchesSearch) {
            card.classList.remove('hidden');
            card.classList.add('show');
            visibleCount++;
        } else {
            card.classList.add('hidden');
            card.classList.remove('show');
        }
    });
    
    // Show/hide no results message
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function sortCars(sortBy) {
    const carsGrid = document.getElementById('carsGrid');
    if (!carsGrid) return;
    
    const carArray = Array.from(carCards);
    
    carArray.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
            case 'price-low':
                return parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price'));
            case 'price-high':
                return parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price'));
            case 'seats':
                return parseInt(a.getAttribute('data-seats')) - parseInt(b.getAttribute('data-seats'));
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    carArray.forEach(card => carsGrid.appendChild(card));
}

// URL parameter handling for car selection
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Auto-select car from URL parameters (for booking.html)
document.addEventListener('DOMContentLoaded', function() {
    const carParam = getUrlParameter('car');
    const priceParam = getUrlParameter('price');
    
    if (carParam && priceParam) {
        selectCar(carParam, parseInt(priceParam));
    }
    
    // Handle filter parameter for cars.html
    const filterParam = getUrlParameter('filter');
    if (filterParam && filterButtons.length > 0) {
        const filterButton = document.querySelector(`[data-filter="${filterParam}"]`);
        if (filterButton) {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            filterButton.classList.add('active');
            filterCars(filterParam);
        }
    }
    
    // Initialize cars display
    if (carCards.length > 0) {
        carCards.forEach(card => {
            card.classList.add('show');
        });
    }
});

// Car selection functionality (for booking.html)
function selectCar(carName, dailyRate) {
    const selectedCarInput = document.getElementById('selectedCar');
    const dailyRateInput = document.getElementById('dailyRate');
    const summaryCarName = document.getElementById('summaryCarName');
    const summaryDailyRate = document.getElementById('summaryDailyRate');
    
    if (selectedCarInput) selectedCarInput.value = carName;
    if (dailyRateInput) dailyRateInput.value = `$${dailyRate}/day`;
    if (summaryCarName) summaryCarName.textContent = carName;
    if (summaryDailyRate) summaryDailyRate.textContent = `$${dailyRate}`;
    
    // Update booking steps
    updateBookingSteps(1);
    
    // Calculate total cost
    calculateTotalCost();
    
    // Scroll to form if on booking page
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Quick car selection
function selectQuickCar(carName, dailyRate) {
    selectCar(carName, dailyRate);
}

// Update booking steps
function updateBookingSteps(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index < activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Calculate total cost
function calculateTotalCost() {
    const pickupDate = document.getElementById('pickupDate');
    const returnDate = document.getElementById('returnDate');
    const dailyRateText = document.getElementById('dailyRate');
    
    if (!pickupDate || !returnDate || !dailyRateText) return;
    
    const pickup = pickupDate.value;
    const returnD = returnDate.value;
    const dailyRateValue = dailyRateText.value;
    
    if (pickup && returnD && dailyRateValue) {
        const pickupDateObj = new Date(pickup);
        const returnDateObj = new Date(returnD);
        const dailyRate = parseInt(dailyRateValue.replace(/[^0-9]/g, ''));
        
        if (returnDateObj > pickupDateObj && dailyRate > 0) {
            const timeDiff = returnDateObj.getTime() - pickupDateObj.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            // Calculate base cost
            const baseCost = daysDiff * dailyRate;
            
            // Calculate additional options cost
            const additionalCost = calculateAdditionalOptions(daysDiff);
            
            // Calculate taxes (10%)
            const subtotal = baseCost + additionalCost;
            const taxes = Math.round(subtotal * 0.1);
            const totalCost = subtotal + taxes;
            
            // Update summary
            updateBookingSummary(daysDiff, baseCost, additionalCost, taxes, totalCost);
        }
    }
}

function calculateAdditionalOptions(days) {
    let additionalCost = 0;
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        switch (checkbox.name) {
            case 'gps':
                additionalCost += 5 * days;
                break;
            case 'childSeat':
                additionalCost += 3 * days;
                break;
            case 'additionalDriver':
                additionalCost += 10 * days;
                break;
            case 'fullInsurance':
                additionalCost += 15 * days;
                break;
        }
    });
    
    return additionalCost;
}

function updateBookingSummary(days, baseCost, additionalCost, taxes, totalCost) {
    const summaryPeriod = document.getElementById('summaryPeriod');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryExtras = document.getElementById('summaryExtras');
    const summaryTaxes = document.getElementById('summaryTaxes');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summaryPeriod) summaryPeriod.textContent = `${days} day${days > 1 ? 's' : ''}`;
    if (summarySubtotal) summarySubtotal.textContent = `$${baseCost}`;
    if (summaryExtras) summaryExtras.textContent = `$${additionalCost}`;
    if (summaryTaxes) summaryTaxes.textContent = `$${taxes}`;
    if (summaryTotal) summaryTotal.textContent = `$${totalCost}`;
}

// Add event listeners for date changes and additional options
document.addEventListener('DOMContentLoaded', function() {
    const pickupDate = document.getElementById('pickupDate');
    const returnDate = document.getElementById('returnDate');
    const pickupLocation = document.getElementById('pickupLocation');
    const returnLocation = document.getElementById('returnLocation');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    if (pickupDate) {
        pickupDate.setAttribute('min', today);
        pickupDate.addEventListener('change', function() {
            if (returnDate) {
                returnDate.setAttribute('min', this.value);
            }
            calculateTotalCost();
        });
    }
    
    if (returnDate) {
        returnDate.setAttribute('min', today);
        returnDate.addEventListener('change', calculateTotalCost);
    }
    
    // Auto-populate return location same as pickup location
    if (pickupLocation && returnLocation) {
        pickupLocation.addEventListener('change', function() {
            if (!returnLocation.value) {
                returnLocation.value = this.value;
            }
        });
    }
    
    // Add event listeners for additional options
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotalCost);
    });
});

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
        }
        e.target.value = value;
    });
}

// Form validation
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        const selectedCar = document.getElementById('selectedCar').value;
        const pickupDate = document.getElementById('pickupDate').value;
        const returnDate = document.getElementById('returnDate').value;
        
        if (!selectedCar) {
            e.preventDefault();
            alert('Please select a car first.');
            return;
        }
        
        if (!pickupDate || !returnDate) {
            e.preventDefault();
            alert('Please select both pickup and return dates.');
            return;
        }
        
        const pickup = new Date(pickupDate);
        const returnD = new Date(returnDate);
        
        if (returnD <= pickup) {
            e.preventDefault();
            alert('Return date must be after pickup date.');
            return;
        }
        
        // Update booking steps to show completion
        updateBookingSteps(3);
    });
}

// Contact form validation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        const firstName = this.querySelector('input[name="firstName"]');
        const lastName = this.querySelector('input[name="lastName"]');
        const email = this.querySelector('input[name="email"]');
        const subject = this.querySelector('select[name="subject"]');
        const message = this.querySelector('textarea[name="message"]');
        
        // Check if elements exist (for compatibility with different form structures)
        const name = firstName ? firstName.value : this.querySelector('input[name="name"]')?.value;
        const emailValue = email ? email.value : '';
        const subjectValue = subject ? subject.value : this.querySelector('input[name="subject"]')?.value;
        const messageValue = message ? message.value : '';
        
        if (!name || !emailValue || !subjectValue || !messageValue) {
            e.preventDefault();
            alert('Please fill in all required fields.');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            e.preventDefault();
            alert('Please enter a valid email address.');
            return;
        }
        
        if (messageValue.length < 10) {
            e.preventDefault();
            alert('Please enter a message with at least 10 characters.');
            return;
        }
    });
}

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '#fff';
            navbar.style.backdropFilter = 'none';
        }
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .car-card, .stat-item, .testimonial-card, .contact-card, .location-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Sticky booking summary scroll behavior
window.addEventListener('scroll', function() {
    const bookingSummary = document.querySelector('.booking-summary');
    if (bookingSummary && window.innerWidth > 768) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (scrolled > 200) {
            bookingSummary.style.transform = `translateY(${rate}px)`;
        }
    }
});

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on and initialize accordingly
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'cars.html':
            initializeCarsPage();
            break;
        case 'booking.html':
            initializeBookingPage();
            break;
        case 'contact.html':
            initializeContactPage();
            break;
        default:
            initializeHomePage();
    }
});

function initializeCarsPage() {
    // Initialize car filtering and sorting
    if (carCards.length > 0) {
        filterCars('all');
    }
}

function initializeBookingPage() {
    // Focus on first form field
    const firstInput = document.querySelector('input:not([readonly]):not([type="checkbox"])');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 500);
    }
}

function initializeContactPage() {
    // Focus on first name field
    const firstNameInput = document.getElementById('firstName') || document.querySelector('input[name="name"]');
    if (firstNameInput) {
        setTimeout(() => firstNameInput.focus(), 500);
    }
}

function initializeHomePage() {
    // Add any home page specific initialization
    console.log('Home page loaded');
}

// Utility function to show loading state
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        element.style.pointerEvents = 'none';
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
        element.style.pointerEvents = 'auto';
    }
}

// Error handling for forms
function showError(message, element = null) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error';
    errorDiv.textContent = message;
    
    if (element) {
        element.parentNode.insertBefore(errorDiv, element);
    } else {
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message, element = null) {
    const successDiv = document.createElement('div');
    successDiv.className = 'message success';
    successDiv.textContent = message;
    
    if (element) {
        element.parentNode.insertBefore(successDiv, element);
    } else {
        document.body.insertBefore(successDiv, document.body.firstChild);
    }
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}