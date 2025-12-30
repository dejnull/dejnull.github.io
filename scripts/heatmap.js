document.addEventListener("DOMContentLoaded", function() {
    // Single map instance, centered on Europe
    var map = L.map('map').setView([50.8503, 10.3512], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Cities to fetch GitHub user count and top users for
    const cities = [
        {name: "Bucharest", coords: [44.4268, 26.1025]},
        {name: "Berlin", coords: [52.5200, 13.4050]},
        {name: "Paris", coords: [48.8566, 2.3522]},
        {name: "Copenhagen", coords: [55.6761, 12.5683]},
        {name: "Aarhus", coords: [56.1629, 10.2039]},
        {name: "London", coords: [51.5074, -0.1278]},
        {name: "Amsterdam", coords: [52.3676, 4.9041]},
        {name: "Vienna", coords: [48.2082, 16.3738]},
        {name: "Zurich", coords: [47.3769, 8.5417]},
        {name: "Warsaw", coords: [52.2297, 21.0122]},
        {name: "Munich", coords: [48.1351, 11.5820]},
    ];

    // Pre-fetch data for all cities with retries
    cities.forEach(city => {
        addCityMarkerWithRetry(city, 3); // Retry up to 3 times
    });

    // Function to fetch data and add a city marker
    function addCityMarkerWithRetry(city, retries) {
        fetch(`https://api.github.com/search/users?q=location:${encodeURIComponent(city.name)}&sort=followers&order=desc`)
            .then(response => response.json())
            .then(data => {
                const count = data.total_count;
                const topUsers = data.items.slice(0, 5); // Get top 5 users

                // Create a marker with a popup
                const marker = L.marker(city.coords).addTo(map);
                marker.bindPopup(createPopupContent(city.name, count, topUsers));
            })
            .catch(err => {
                console.error(`Error fetching data for ${city.name}:`, err);
                if (retries > 0) {
                    console.log(`Retrying for ${city.name}... (${retries} retries left)`);
                    addCityMarkerWithRetry(city, retries - 1);
                } else {
                    console.error(`Failed to fetch data for ${city.name} after multiple attempts.`);
                }
            });
    }

    // Function to create popup content
    function createPopupContent(cityName, count, topUsers) {
        let userList = `🌍 ${cityName}: <strong>${count}</strong> accounts<br><br>`;
        if (topUsers.length > 0) {
            userList += `Top <strong>5</strong> users by followers:<ul>`;
            topUsers.forEach(user => {
                userList += `<li><a href="${user.html_url}" target="_blank">${user.login}</a></li>`;
            });
            userList += `</ul>`;
        } else {
            userList += `<em>No top users found.</em>`;
        }
        return userList;
    }
});
