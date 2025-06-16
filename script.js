
document.addEventListener("DOMContentLoaded", function () {
    const sortSelect = document.getElementById("sortCars");
    const carsGrid = document.getElementById("carsGrid");
    const filterButtons = document.querySelectorAll(".filter-btn");

    // Sorting Functionality
    sortSelect.addEventListener("change", function () {
        const cards = Array.from(carsGrid.querySelectorAll(".car-card"));
        let sortedCards;

        switch (sortSelect.value) {
            case "name":
                sortedCards = cards.sort((a, b) => 
                    a.dataset.name.localeCompare(b.dataset.name)
                );
                break;
            case "price-low":
                sortedCards = cards.sort((a, b) => 
                    parseFloat(a.dataset.price) - parseFloat(b.dataset.price)
                );
                break;
            case "price-high":
                sortedCards = cards.sort((a, b) => 
                    parseFloat(b.dataset.price) - parseFloat(a.dataset.price)
                );
                break;
            case "seats":
                sortedCards = cards.sort((a, b) => 
                    parseInt(b.dataset.seats) - parseInt(a.dataset.seats)
                );
                break;
            default:
                sortedCards = cards;
        }

        carsGrid.innerHTML = "";
        sortedCards.forEach(card => carsGrid.appendChild(card));
    });

    // Filtering Functionality
    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            const filter = this.getAttribute("data-filter");
            const cards = carsGrid.querySelectorAll(".car-card");

            let visibleCount = 0;
            cards.forEach(card => {
                if (filter === "all" || card.dataset.category === filter) {
                    card.style.display = "";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            const noResults = document.getElementById("noResults");
            noResults.style.display = visibleCount === 0 ? "block" : "none";
        });
    });
});
