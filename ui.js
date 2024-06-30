const countries = ["Albania", "Belarus", "Czechia", "Germany", "Kosovo", "Libya", "NorthMacedonia", "Russia", "Turkey", "Ukraine", "Afghanistan", "AkrotiriSovereignBaseArea", "Aland", "Albania", "Algeria", "AmericanSamoa", "Andorra", "Angola", "Anguilla", "Antarctica", "AntiguaandBarbuda", "Argentina", "Armenia", "Aruba", "AshmoreandCartierIslands", "Australia", "Austria", "Azerbaijan", "Bahrain", "BajoNuevoBank(PetrelIs.)", "Bangladesh", "Barbados", "BaykonurCosmodrome", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "BirTawil", "Bolivia", "BosniaandHerzegovina", "Botswana", "Brazil", "BrazilianIsland", "BritishIndianOceanTerritory", "BritishVirginIslands", "Brunei", "Bulgaria", "BurkinaFaso", "Burundi", "CaboVerde", "Cambodia", "Cameroon", "Canada", "CaymanIslands", "CentralAfricanRepublic", "Chad", "Chile", "China", "ClippertonIsland", "Colombia", "Comoros", "CookIslands", "CoralSeaIslands", "CostaRica", "Croatia", "Cuba", "Curaçao", "Cyprus", "CyprusNoMansArea", "Czechia", "DemocraticRepublicoftheCongo", "Denmark", "DhekeliaSovereignBaseArea", "Djibouti", "Dominica", "DominicanRepublic", "EastTimor", "Ecuador", "Egypt", "ElSalvador", "EquatorialGuinea", "Eritrea", "Estonia", "Ethiopia", "FalklandIslands", "FaroeIslands", "FederatedStatesofMicronesia", "Fiji", "Finland", "France", "FrenchPolynesia", "FrenchSouthernandAntarcticLands", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "HeardIslandandMcDonaldIslands", "Honduras", "HongKongS.A.R.", "Hungary", "Iceland", "India", "IndianOceanTerritories", "Indonesia", "Iran", "Iraq", "Ireland", "IsleofMan", "Israel", "Italy", "IvoryCoast", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "MacaoS.A.R", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "MarshallIslands", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "NewCaledonia", "NewZealand", "Nicaragua", "Niger", "Nigeria", "Niue", "NorfolkIsland", "NorthKorea", "NorthMacedonia", "NorthernCyprus", "NorthernMarianaIslands", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "PapuaNewGuinea", "Paraguay", "Peru", "Philippines", "PitcairnIslands", "Poland", "Portugal", "PuertoRico", "Qatar", "RepublicofSerbia", "RepublicoftheCongo", "Romania", "Russia", "Rwanda", "SaintBarthelemy", "SaintHelena", "SaintKittsandNevis", "SaintLucia", "SaintMartin", "SaintPierreandMiquelon", "SaintVincentandtheGrenadines", "Samoa", "SanMarino", "SaudiArabia", "ScarboroughReef", "Senegal", "SerranillaBank", "Seychelles", "SiachenGlacier", "SierraLeone", "Singapore", "SintMaarten", "Slovakia", "Slovenia", "SolomonIslands", "Somalia", "Somaliland", "SouthAfrica", "SouthGeorgiaandtheIslands", "SouthKorea", "SouthSudan", "SouthernPatagonianIceField", "Spain", "SpratlyIslands", "SriLanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "SãoToméandPrincipe", "Taiwan", "Tajikistan", "Thailand", "TheBahamas", "Togo", "Tonga", "TrinidadandTobago", "Tunisia", "Turkey", "Turkmenistan", "TurksandCaicosIslands", "Tuvalu", "USNavalBaseGuantanamoBay", "Uganda", "Ukraine", "UnitedArabEmirates", "UnitedKingdom", "UnitedRepublicofTanzania", "UnitedStatesMinorOutlyingIslands", "UnitedStatesVirginIslands", "UnitedStatesofAmerica", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican", "Venezuela", "Vietnam", "WallisandFutuna", "WesternSahara", "Yemen", "Zambia", "Zimbabwe", "eSwatini"];

function parseRange(rangeStr) {
    if (rangeStr.includes('-')) {
        const [min, max] = rangeStr.split('-').map(Number);
        return [min, max];
    }
    const value = parseFloat(rangeStr);
    return [value, value];
}

function populateCountryInput() {
    const countryInput = document.getElementById('countryInput');
    const datalist = document.createElement('datalist');
    datalist.id = 'countries';

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        datalist.appendChild(option);
    });

    countryInput.setAttribute('list', 'countries');
    document.body.appendChild(datalist);
}
function populateSatellitesDropdown() {
    const satelliteSelector = document.getElementById('satelliteSelector');
    satelliteSelector.innerHTML = '';

    // Add the "I don't know" option
    const unknownOption = document.createElement('option');
    unknownOption.value = '';
    unknownOption.text = 'I don\'t know';
    satelliteSelector.appendChild(unknownOption);

    for (const group in sat_db) {
        sat_db[group].forEach(satellite => {
            const option = document.createElement('option');
            option.value = satellite.sat;
            option.text = satellite.sat;
            satelliteSelector.appendChild(option);
        });
    }
}
function addTag(tag) {
    const tagContainer = document.getElementById('countryTags');
    const tagElement = document.createElement('div');
    tagElement.classList.add('tag');
    tagElement.innerHTML = `${tag} <span class="remove-tag" onclick="removeTag(this)">x</span>`;
    tagContainer.appendChild(tagElement);
}

function removeTag(element) {
    element.parentNode.remove();
}

function displayResults(results) {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = '';

    if (results.length === 0) {
        resultContainer.textContent = 'No locations found matching the criteria.';
    } else {
        results.forEach(({ lat, lon }) => {
            const result = document.createElement('div');
            result.textContent = `Location: (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
            resultContainer.appendChild(result);
        });
    }

    displayResultsOnMap(results);
}

let map;

function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function displayResultsOnMap(results) {
    if (!map) {
        initMap();
    }

    if (!map) {
        console.error('Map failed to initialize');
        return;
    }

    // Clear existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    if (results.length === 0) {
        return;
    }

    results.forEach(({ lat, lon }) => {
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`Location: (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
    });

    // Remove the automatic zooming
    // map.fitBounds(bounds, { padding: [50, 50] });
}

function drawCircle(center, minDistance, maxDistance) {
    const thickness = maxDistance - minDistance;
    
    // Draw outer circle
    L.circle(center, {
        radius: maxDistance * 1000, // Convert km to meters
        color: 'red',
        weight: 2,
        opacity: 0.35,
        fill: false
    }).addTo(map);

    // Draw inner circle if there's a range
    if (thickness > 0) {
        L.circle(center, {
            radius: minDistance * 1000, // Convert km to meters
            color: 'red',
            weight: 2,
            opacity: 0.35,
            fill: false
        }).addTo(map);
    }
}

function drawArc(center, minDistance, maxDistance, startAngle, endAngle) {
    const thickness = maxDistance - minDistance;
    
    // Convert angles to radians
    const startRad = (90 - startAngle) * Math.PI / 180;
    const endRad = (90 - endAngle) * Math.PI / 180;

    // Generate points for the arc
    const points = [];
    const step = Math.PI / 180; // 1 degree step
    for (let i = startRad; i <= endRad; i += step) {
        points.push(L.CRS.EPSG3857.unproject(L.point(
            center.lng + maxDistance * Math.cos(i),
            center.lat + maxDistance * Math.sin(i)
        )));
    }
    if (thickness > 0) {
        for (let i = endRad; i >= startRad; i -= step) {
            points.push(L.CRS.EPSG3857.unproject(L.point(
                center.lng + minDistance * Math.cos(i),
                center.lat + minDistance * Math.sin(i)
            )));
        }
    }
    points.push(points[0]); // Close the polygon

    // Draw the arc
    L.polygon(points, {
        color: 'red',
        weight: 2,
        opacity: 0.35,
        fill: thickness > 0,
        fillColor: 'red',
        fillOpacity: 0.1
    }).addTo(map);
}

function calculateArcEndpoints(center, radius, startAngle, endAngle) {
    const start = L.GeometryUtil.destination(center, startAngle, radius);
    const end = L.GeometryUtil.destination(center, endAngle, radius);
    return [start, end];
}