function satelliteHasSelectedCountries(satellite, selectedCountries) {
    if (selectedCountries.length === 0) return true;
    for (const band in satellite.bands) {
        const bandCountries = satellite.bands[band].countries || [];
        if (selectedCountries.some(country => bandCountries.includes(country))) {
            return true;
        }
    }
    return false;
}

function getSatelliteCoverage(satellite) {
    const selectedBands = getSelectedBands();

    const selectedCountries = getSelectedCountries();

    const countriesMultiPolygon = getSelectedCountriesMultiPolygon(selectedCountries);

    let satelliteCoverage = turf.multiPolygon([]);

    for (const band in satellite.bands) {
        if (!selectedBands.includes(band)) continue;

        const bandCountries = satellite.bands[band].countries || [];
        if (selectedCountries.length === 0 || selectedCountries.some(country => bandCountries.includes(country))) {
            for (const coverage of satellite.bands[band].coverage) {
                coverage.features.forEach(feature => {
                    const coveragePolygon = turf.polygon(feature.geometry.coordinates);
                    satelliteCoverage = turf.union(satelliteCoverage, coveragePolygon);
                });
            }
        }
    }

    if (selectedCountries.length > 0 && satelliteCoverage) {
        satelliteCoverage = turf.intersect(satelliteCoverage, countriesMultiPolygon);
    }

    if (!satelliteCoverage) return [];

    const polygons = [];

    if (satelliteCoverage.geometry.type === 'Polygon') {
        polygons.push(satelliteCoverage.geometry.coordinates[0].map(coord => [coord[1], coord[0]]));
    } else if (satelliteCoverage.geometry.type === 'MultiPolygon') {
        satelliteCoverage.geometry.coordinates.forEach(polygon => {
            polygons.push(polygon[0].map(coord => [coord[1], coord[0]]));
        });
    }

    return polygons;
}

function drawSatelliteArea(northAngleRange, elevationAngleRange, satellite) {
    const intersectedPoints = getSatelliteCoverage(satellite);
    const processedArea = processArea(northAngleRange, elevationAngleRange, satellite, intersectedPoints);

    if (processedArea.length > 0) {
        let bounds;
        if (Array.isArray(processedArea[0]) && Array.isArray(processedArea[0][0])) {
            // multiple polygons
            processedArea.forEach(polygonPoints => {
                L.polygon(polygonPoints, {color: 'red', fillColor: 'red', fillOpacity: 0.2}).addTo(map);
            });
            bounds = L.latLngBounds(processedArea.flat(1)); // Flatten the array of arrays
        } else {
            // It's a single polygon
            L.polygon(processedArea, {color: 'red', fillColor: 'red', fillOpacity: 0.2}).addTo(map);
            bounds = L.latLngBounds(processedArea);
        }

        if (bounds.isValid()) {
            try {
                map.fitBounds(bounds);
            } catch (error) {
                console.warn('Error fitting bounds:', error);
                map.setView([0, 0], 2);
            }
        } else {
            console.warn('Invalid bounds, unable to fit map');
            map.setView([0, 0], 2);
        }
    } else {
        console.log('No intersection with satellite coverage or selected countries');
        map.setView([0, 0], 2);
    }
}

function processArea(northAngleRange, elevationAngleRange, satellite, intersectedPoints) {
    const [minNorthAngle, maxNorthAngle] = parseRange(northAngleRange, 0, 360);
    const [minElevation, maxElevation] = parseRange(elevationAngleRange, 0, 90);
    const satelliteLongitude = satellite.long;
    const center = [satelliteLongitude, 0];

    let coverage = turf.multiPolygon(intersectedPoints);

    // create maximum range circle and intersect with coverage
    const minElevationRadius = calculateRadius(center, minElevation);
    console.log(minElevationRadius);
    const minElevationCircle = turf.circle(center, minElevationRadius, { units: 'kilometers' });
    
    try {
        coverage = turf.intersect(coverage, minElevationCircle);
        if (!coverage) {
            console.warn("intersect operation resulted in null geometry");
            return [];
        }
    } catch (error) {
        console.error("Error in intersect operation:", error);
        return [];
    }

    // create minimum range circle and subtract from modified coverage
    const maxElevationRadius = calculateRadius(center, maxElevation);
    const maxElevationCircle = turf.circle(center, maxElevationRadius, { units: 'kilometers' });
    
    try {
        coverage = turf.difference(coverage, maxElevationCircle);
        if (!coverage) {
            console.warn("difference with max elevation circle resulted in null geometry");
            return [];
        }
    } catch (error) {
        console.error("Error in difference operation:", error);
        console.log("Coverage:", JSON.stringify(coverage));
        console.log("Max Elevation Circle:", JSON.stringify(maxElevationCircle));
        return [];
    }

    // create triangle for north angle range
    const pointB = findLocation(minNorthAngle, 0, satelliteLongitude);
    const pointC = findLocation(maxNorthAngle, 0, satelliteLongitude);

    const triangleABC = turf.polygon([[
        center,
        [pointB.longitude, pointB.latitude],
        [pointC.longitude, pointC.latitude],
        center
    ]]);

    // intersect triangle and the modified coverage
    let processedArea;
    try {
        processedArea = turf.intersect(triangleABC, coverage);
        if (!processedArea) {
            console.warn("Final intersection resulted in null geometry");
            return [];
        }
    } catch (error) {
        console.error("Error in final intersection operation:", error);
        return [];
    }

    return turf.getCoords(processedArea);
}

function getSelectedCountriesMultiPolygon(selectedCountries) {
    let multiPolygon = turf.multiPolygon([]);

    if (!countries_db || !countries_db.objects || !countries_db.objects.countries) {
        console.error('Countries TopoJSON not loaded or in unexpected format');
        return multiPolygon;
    }

    const countries = topojson.feature(countries_db, countries_db.objects.countries);

    selectedCountries.forEach(countryName => {
        const countryFeature = countries.features.find(feature => 
            feature.properties.name === countryName || 
            feature.properties.name.toLowerCase() === countryName.toLowerCase()
        );
        
        if (countryFeature) {
            if (countryFeature.geometry.type === 'Polygon') {
                multiPolygon = turf.union(multiPolygon, turf.polygon(countryFeature.geometry.coordinates));
            } else if (countryFeature.geometry.type === 'MultiPolygon') {
                countryFeature.geometry.coordinates.forEach(polygonCoords => {
                    multiPolygon = turf.union(multiPolygon, turf.polygon(polygonCoords));
                });
            }
        } else {
            console.warn(`Country not found: ${countryName}`);
        }
    });

    return multiPolygon;
}
