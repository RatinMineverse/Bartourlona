// Global state
let tours = [];
let vipStatus = localStorage.getItem('vip') === 'true';

// DOM elements
const toursContainer = document.getElementById('tours-container');
const vipToursContainer = document.getElementById('vip-tours-container');
const vipMessage = document.getElementById('vip-message');
const bookingsList = document.getElementById('bookings-list');
const vipButton = document.getElementById('vip-button');
const modal = document.getElementById('booking-modal');
const modalTourName = document.getElementById('modal-tour-name');
const bookingForm = document.getElementById('booking-form');
const tourIdInput = document.getElementById('tour-id');
const closeModal = document.querySelector('.close');

// Fetch tours
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        tours = data;
        renderTours();
        renderVipSection();
        updateVIPMessage();
    })
    .catch(error => console.error('Error loading tours:', error));

// Render regular tours
function renderTours() {
    const regularTours = tours.filter(t => !t.vip);
    toursContainer.innerHTML = regularTours.map(createTourCard).join('');
    attachBookListeners();
}

// Render VIP tours (if VIP)
function renderVipSection() {
    const vipTours = tours.filter(t => t.vip);
    if (vipStatus) {
        vipToursContainer.innerHTML = vipTours.map(createTourCard).join('');
        attachBookListeners();
    } else {
        vipToursContainer.innerHTML = '<p>🔒 VIP tours are hidden. Become a VIP to unlock them.</p>';
    }
}

// Create a tour card HTML
function createTourCard(tour) {
    return `
        <div class="tour-card" data-id="${tour.id}">
            <img src="${tour.image}" alt="${tour.name}">
            <div class="content">
                ${tour.vip ? '<span class="vip-badge">VIP ONLY</span>' : ''}
                <h3>${tour.name}</h3>
                <p>${tour.description}</p>
                <div class="price">€${tour.price}</div>
                <button class="book-btn" data-id="${tour.id}">Book Now</button>
            </div>
        </div>
    `;
}

// Attach event listeners to book buttons
function attachBookListeners() {
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const tour = tours.find(t => t.id === id);
            if (tour) openBookingModal(tour);
        });
    });
}

// Open modal with tour details
function openBookingModal(tour) {
    modalTourName.textContent = tour.name;
    tourIdInput.value = tour.id;
    modal.style.display = 'block';
}

// Close modal
closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

// Handle booking form submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const tourId = parseInt(tourIdInput.value);
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return;

    const booking = {
        id: Date.now(),
        tourId: tour.id,
        tourName: tour.name,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        date: document.getElementById('date').value,
        guests: parseInt(document.getElementById('guests').value),
        price: tour.price * parseInt(document.getElementById('guests').value)
    };

    // Save to localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    alert(`Booking confirmed for ${tour.name} on ${booking.date}. Total: €${booking.price}`);
    modal.style.display = 'none';
    bookingForm.reset();
    renderBookings();
});

// Render user bookings
function renderBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>No bookings yet. Start planning your trip!</p>';
        return;
    }

    bookingsList.innerHTML = bookings.map(b => `
        <div class="booking-item">
            <div>
                <strong>${b.tourName}</strong> on ${b.date}<br>
                ${b.name} (${b.guests} guest${b.guests > 1 ? 's' : ''})
            </div>
            <div>€${b.price}</div>
        </div>
    `).join('');
}

// VIP simulation
function updateVIPMessage() {
    if (vipStatus) {
        vipMessage.innerHTML = '<p>✅ You are a VIP member! Enjoy exclusive tours.</p>';
        vipButton.textContent = 'Already VIP';
        vipButton.disabled = true;
    } else {
        vipMessage.innerHTML = '<p>🔓 Support Bartourlona with a small donation to unlock VIP tours.</p>';
    }
    renderVipSection();
}

vipButton.addEventListener('click', () => {
    if (!vipStatus) {
        // Simulate donation
        vipStatus = true;
        localStorage.setItem('vip', 'true');
        updateVIPMessage();
        alert('🎉 Thank you for your donation! You now have VIP access. (Simulated)');
    }
});

// Clear bookings
document.getElementById('clear-bookings').addEventListener('click', () => {
    localStorage.removeItem('bookings');
    renderBookings();
});

// Initial render
renderBookings();