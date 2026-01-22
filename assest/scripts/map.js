const map = L.map('map', { 
    zoomControl: false, 
    preferCanvas: true,
    tap: false,
    bounceAtZoomLimits: true
}).setView([21.0285, 105.8542], 13);

// Sử dụng lớp nền bản đồ tối giản Positron
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

const iconMap = { 
    "start": "🏠", "sightseeing": "🏔️", "culture": "🏮", "history": "🏛️", 
    "nature": "🌲", "market": "🛍️", "hotel": "🏨", "end": "🏁", "photo": "📸" 
};

let allLocations = [], globalIndex = 0, markers = [], routeControl = null, movingMarker = null;

// Tải dữ liệu từ data.json
fetch('../data.json').then(res => res.json()).then(data => {
    Object.keys(data.itinerary).forEach(dayKey => {
        data.itinerary[dayKey].locations.forEach(loc => {
            allLocations.push({ 
                ...loc, dayKey: dayKey,
                latLng: L.latLng(loc.coords[0], loc.coords[1])
            });
        });
    });
    initUI(data.itinerary);
    renderMarkers();
    updateState();
});

function initUI(itinerary) {
    const container = document.getElementById('daySelector');
    Object.keys(itinerary).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'day-btn'; btn.id = 'btn-' + key;
        btn.innerText = itinerary[key].label;
        btn.onclick = () => jumpToDay(key);
        container.appendChild(btn);
    });
}

function renderMarkers() {
    allLocations.forEach((loc, i) => {
        const icon = L.divIcon({
            className: 'custom-div-icon',
            // iconSize: [null, null] cho phép CSS điều khiển kích thước dựa trên độ dài chữ
            iconSize: [null, null], 
            html: `<div class="marker-card" id="marker-ui-${i}">
                        <div class="marker-icon">${iconMap[loc.type] || "📍"}</div>
                        <div class="marker-label">${loc.name}</div>
                    </div>`,
            iconAnchor: [20, 20] 
        });
        const m = L.marker(loc.latLng, { icon }).addTo(map)
            .bindPopup(`<strong>${loc.name}</strong><br>${loc.desc}`, {
                autoPanPadding: L.point(20, 150)
            });
        markers.push(m);
    });
    if(markers[0]) markers[0].openPopup();
}

async function navigate(direction) {
    const newIndex = globalIndex + direction;
    if (newIndex < 0 || newIndex >= allLocations.length) return;

    const start = allLocations[globalIndex].latLng;
    const end = allLocations[newIndex].latLng;
    const distance = start.distanceTo(end);

    markers[globalIndex].closePopup();
    
    if (distance < 20000) { 
        let finalTime = (distance / 15) * 1000;
        finalTime = finalTime > 4000 ? 4000 : finalTime;
        await animateJourney(start, end, finalTime);
    } else {
        await flyToPoint(end);
    }

    globalIndex = newIndex;
    updateState();
    markers[globalIndex].openPopup();
}

function animateJourney(start, end, duration) {
    return new Promise((resolve) => {
        if (routeControl) map.removeControl(routeControl);
        routeControl = L.Routing.control({
            waypoints: [start, end],
            createMarker: () => null,
            lineOptions: { styles: [{ color: '#D4AF37', weight: 6, opacity: 0.6 }] },
            addWaypoints: false, show: false
        }).addTo(map);

        routeControl.on('routesfound', function(e) {
            const coords = e.routes[0].coordinates;
            if (movingMarker) map.removeLayer(movingMarker);
            // Sử dụng xe BMW bay nav.png
            movingMarker = L.marker(coords[0], { icon: L.divIcon({ className: 'moving-pulse' }) }).addTo(map);

            const startTime = performance.now();
            function step(now) {
                const p = Math.min((now - startTime) / duration, 1);
                const idx = Math.floor(p * (coords.length - 1));
                if (coords[idx]) {
                    movingMarker.setLatLng(coords[idx]);
                    map.panTo(coords[idx], { animate: false });
                }
                if (p < 1) requestAnimationFrame(step);
                else {
                    if (movingMarker) map.removeLayer(movingMarker);
                    map.flyTo(end, 15, { duration: 0.5 });
                    setTimeout(resolve, 500);
                }
            }
            requestAnimationFrame(step);
        });
    });
}

function flyToPoint(end) {
    return new Promise((resolve) => {
        map.flyTo(end, 15, { duration: 2.5, easeLinearity: 0.25 });
        map.once('moveend', resolve);
    });
}

function jumpToDay(dayKey) {
    const dayLocs = allLocations.filter(l => l.dayKey === dayKey);
    if (dayLocs.length > 0) {
        const bounds = L.latLngBounds(dayLocs.map(l => l.latLng));
        map.fitBounds(bounds, { padding: [60, 150], maxZoom: 14, duration: 1.5 });
        globalIndex = allLocations.findIndex(l => l.dayKey === dayKey);
        updateState();
        document.getElementById('btn-' + dayKey).scrollIntoView({ behavior: 'smooth', inline: 'center' });
        setTimeout(() => markers[globalIndex].openPopup(), 1600);
    }
}

function updateState() {
    const current = allLocations[globalIndex];
    document.getElementById('pointName').innerText = current.name;
    
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + current.dayKey);
    if (activeBtn) activeBtn.classList.add('active');

    document.getElementById('prevBtn').disabled = (globalIndex === 0);
    document.getElementById('nextBtn').disabled = (globalIndex === allLocations.length - 1);

    document.querySelectorAll('.custom-div-icon').forEach(el => el.classList.remove('active-marker'));
    const currentEl = markers[globalIndex].getElement();
    if (currentEl) currentEl.classList.add('active-marker');
}
