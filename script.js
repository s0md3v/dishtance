let map;

function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.pm.addControls({
        position: 'topleft',
        editMode: true,
        dragMode: true,
        removalMode: true,
    });
}

function calculateLocation() {
    const calculateButton = document.getElementById('calculateButton');
    calculateButton.textContent = 'Processing...';
    calculateButton.disabled = true;

    setTimeout(() => {
        try {
            const northAngleInput = document.getElementById('northAngle').value;
            const elevationAngleInput = document.getElementById('elevationAngle').value;
            const satelliteName = document.getElementById('satelliteSelector').value;
            const northAngleRange = parseRange(northAngleInput, 0, 360);
            const elevationAngleRange = parseRange(elevationAngleInput, 0, 90);

            map.eachLayer((layer) => {
                if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                    map.removeLayer(layer);
                }
            });

            const selectedCountries = getSelectedCountries();
            const selectedBands = getSelectedBands();

            if (satelliteName == '') {
                for (const group in sat_db) {
                    sat_db[group].forEach(satellite => {
                        if (satelliteHasSelectedCountries(satellite, selectedCountries) && 
                            selectedBands.some(band => satellite.bands.hasOwnProperty(band))) {
                            drawSatelliteArea(northAngleInput, elevationAngleInput, satellite);
                        }
                    });
                }
            } else {
                for (const group in sat_db) {
                    sat_db[group].forEach(satellite => {
                        if (satellite.sat === satelliteName && 
                            satelliteHasSelectedCountries(satellite, selectedCountries) &&
                            selectedBands.some(band => satellite.bands.hasOwnProperty(band))) {
                            drawSatelliteArea(northAngleInput, elevationAngleInput, satellite);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error in calculateLocation:', error);
            alert('An error occurred while calculating the location. Please try again.');
        } finally {
            calculateButton.textContent = 'Calculate Location';
            calculateButton.disabled = false;
        }
    }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    populateCountryInput();
    populateSatellitesDropdown();

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('countryInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const country = e.target.value.trim();
            if (country) {
                addTag(country);
                e.target.value = '';
            }
        }
    });
});