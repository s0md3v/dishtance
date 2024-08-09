function parseRange(input, defaultMin, defaultMax) {
    if (input === undefined || input === '') {
        return [defaultMin, defaultMax];
    }
    if (typeof input === 'string' && input.includes('-')) {
        const [min, max] = input.split('-').map(Number);
        return [Math.max(min, defaultMin), Math.min(max, defaultMax)];
    }
    const value = parseFloat(input);
    return [Math.max(value, defaultMin), Math.min(value, defaultMax)];
}

function populateCountryInput() {
    const countryInput = document.getElementById('countryInput');
    const datalist = document.createElement('datalist');
    datalist.id = 'countries';

    if (countries_db && countries_db.objects && countries_db.objects.countries) {
        const geojson = topojson.feature(countries_db, countries_db.objects.countries);

        const countryNames = [...new Set(geojson.features.map(feature => feature.properties.name))]
            .sort((a, b) => a.localeCompare(b));

        countryNames.forEach(countryName => {
            const option = document.createElement('option');
            option.value = countryName;
            datalist.appendChild(option);
        });
    } else {
        console.error('countries_db is not available or does not have the expected structure');
    }

    countryInput.setAttribute('list', 'countries');
    document.body.appendChild(datalist);
}

function populateSatellitesDropdown() {
    const satelliteSelector = document.getElementById('satelliteSelector');
    satelliteSelector.innerHTML = '<option value="">I don\'t know</option>';
    for (const group in sat_db) {
        sat_db[group].forEach(satellite => {
            const option = document.createElement('option');
            option.value = satellite.sat;
            option.text = satellite.sat;
            satelliteSelector.appendChild(option);
        });
    }
}

function getSelectedCountries() {
    const tagContainer = document.getElementById('countryTags');
    return Array.from(tagContainer.children).map(tag => tag.textContent.trim().replace(' x', ''));
}

function getSelectedBands() {
    const checkboxes = document.querySelectorAll('#bandSelector input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
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

function exportData() {
    const features = [];
    var processed = [];

    map.pm.getGeomanDrawLayers().forEach((layer) => {
        processed.push(layer);
        addFeatureFromLayer(layer, features, false);
    });

    map.eachLayer((layer) => {
        if (layer instanceof L.Polygon && !processed.includes(layer)) {
            addFeatureFromLayer(layer, features, true);
        }
    });

    // TODO: It works for google earth for now, test on other platforms
    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
<Document>
    <name>Exported Map Data</name>
    <description>Exported from Satellite Location Calculator</description>
    <Style id="redPolygonStyle">
        <LineStyle>
            <color>40ff0000</color>
            <width>2</width>
        </LineStyle>
        <PolyStyle>
            <color>40ff0000</color>
        </PolyStyle>
    </Style>
    <Style id="bluePolygonStyle">
        <LineStyle>
            <color>400000ff</color>
            <width>2</width>
        </LineStyle>
        <PolyStyle>
            <color>400000ff</color>
        </PolyStyle>
    </Style>
`;

    features.forEach((feature, index) => {
        kmlContent += `    <Placemark id="placemark_${index}">
        <styleUrl>${feature.properties.styleUrl}</styleUrl>
${getGeometryKml(feature.geometry)}
    </Placemark>
`;
    });

    kmlContent += '</Document>\n</kml>';

    const blob = new Blob([kmlContent], {type: 'application/vnd.google-earth.kml+xml'});

    const a = document.createElement('a');
    a.download = 'export.kml';
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
}

function addFeatureFromLayer(layer, features, isGeomanLayer) {
    let feature;
    if (layer instanceof L.Circle) {
        feature = {
            type: 'Feature',
            geometry: {
                type: 'Circle',
                coordinates: [layer.getLatLng().lng, layer.getLatLng().lat],
                radius: layer.getRadius()
            },
            properties: {}
        };
    } else {
        feature = layer.toGeoJSON();
    }
    
    if (layer.getPopup()) {
        feature.properties.description = layer.getPopup().getContent();
    }
    feature.properties.styleUrl = isGeomanLayer ? '#bluePolygonStyle' : '#redPolygonStyle';
    features.push(feature);
}

function getGeometryKml(geometry) {
    switch (geometry.type) {
        case 'Point':
            return `        <Point>
            <coordinates>${geometry.coordinates.join(',')}</coordinates>
        </Point>`;
        case 'LineString':
            return `        <LineString>
            <coordinates>${geometry.coordinates.map(coord => coord.join(',')).join(' ')}</coordinates>
        </LineString>`;
        case 'Polygon':
            return `        <Polygon>
            <outerBoundaryIs>
                <LinearRing>
                    <coordinates>${geometry.coordinates[0].map(coord => coord.join(',')).join(' ')}</coordinates>
                </LinearRing>
            </outerBoundaryIs>
        </Polygon>`;
        case 'Circle':
            const points = createCirclePoints(geometry.coordinates, geometry.radius);
            return `        <Polygon>
            <outerBoundaryIs>
                <LinearRing>
                    <coordinates>${points.map(coord => coord.join(',')).join(' ')}</coordinates>
                </LinearRing>
            </outerBoundaryIs>
        </Polygon>`;
        default:
            console.warn('Unsupported geometry type:', geometry.type);
            return '';
    }
}

function createCirclePoints(center, radiusM, numPoints = 64) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * (2 * Math.PI);
        const dx = radiusM * Math.cos(angle);
        const dy = radiusM * Math.sin(angle);
        const lat = center[1] + (180 / Math.PI) * (dy / 6378137);
        const lon = center[0] + (180 / Math.PI) * (dx / 6378137) / Math.cos(center[1] * Math.PI / 180);
        points.push([lon, lat]);
    }
    points.push(points[0]);
    return points;
}