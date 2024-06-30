function calculateElevation(satelliteLongitude, earthStationLatitude, earthStationLongitude) {
    const longitudeDifferenceRad = (earthStationLongitude - satelliteLongitude) / 57.29578;
    const latitudeRad = earthStationLatitude / 57.29578;
    const r1 = 1 + 35786 / 6378.16;
    const term1 = r1 * Math.cos(latitudeRad) * Math.cos(longitudeDifferenceRad) - 1;
    const term2 = r1 * Math.sqrt(1 - Math.cos(latitudeRad)**2 * Math.cos(longitudeDifferenceRad)**2);
    let elevationAngle = 57.29578 * Math.atan(term1 / term2);

    if (elevationAngle < 30) {
        return (elevationAngle + Math.sqrt(elevationAngle**2 + 4.132)) / 2;
    } else {
        return elevationAngle;
    }
}

function calculateAzimuth(satelliteLongitude, earthStationLatitude, earthStationLongitude) {
    const radiansConversionFactor = 57.29578;
    const longitudeDifferenceRad = (earthStationLongitude - satelliteLongitude) / radiansConversionFactor;
    const latitudeRad = earthStationLatitude / radiansConversionFactor;

    let azimuthAngle = 180 + radiansConversionFactor * Math.atan(Math.tan(longitudeDifferenceRad) / Math.sin(latitudeRad));

    if (earthStationLatitude < 0) {
        azimuthAngle -= 180;
    }
    if (azimuthAngle < 0) {
        azimuthAngle += 360.0;
    }

    return azimuthAngle;
}

function errorFunction(params, targetAzimuth, targetElevation, satelliteLongitude) {
    const [latitude, longitude] = params;
    const calculatedElevation = calculateElevation(satelliteLongitude, latitude, longitude);
    if (calculatedElevation <= 0) {
        return Number.POSITIVE_INFINITY;
    }
    const calculatedAzimuth = calculateAzimuth(satelliteLongitude, latitude, longitude);
    return Math.pow(calculatedElevation - targetElevation, 2) + Math.pow(calculatedAzimuth - targetAzimuth, 2);
}

function minimize(errorFunction, initialGuess, targetAzimuth, targetElevation, satelliteLongitude) {
    let bestParams = initialGuess;
    let minError = Number.POSITIVE_INFINITY;

    // Coarse Search
    for (let lat = -60; lat <= 60; lat += 1.0) {
        for (let lon = -180; lon <= 180; lon += 1.0) {
            const error = errorFunction([lat, lon], targetAzimuth, targetElevation, satelliteLongitude);
            if (error < minError) {
                minError = error;
                bestParams = [lat, lon];
            }
        }
    }

    // Fine-tuning around the bestParams found in coarse search
    const [bestLat, bestLon] = bestParams;
    for (let lat = bestLat - 1; lat <= bestLat + 1; lat += 0.01) {
        for (let lon = bestLon - 1; lon <= bestLon + 1; lon += 0.01) {
            const error = errorFunction([lat, lon], targetAzimuth, targetElevation, satelliteLongitude);
            if (error < minError) {
                minError = error;
                bestParams = [lat, lon];
            }
        }
    }

    return bestParams;
}

function findLocation(targetAzimuth, targetElevation, satelliteLongitude) {
    const initialGuess = [0, 0];
    const result = minimize(errorFunction, initialGuess, targetAzimuth, targetElevation, satelliteLongitude);
    const [latitude, longitude] = result;
    return { latitude, longitude };
}

function pointInPolygon(polygon, point) {
    const pt = turf.point(point);
    const poly = polygon; // Polygon object in GeoJSON format
    return turf.booleanPointInPolygon(pt, poly);
}

function isPointInBounds(lat, lon, bounds) {
    const [bX, bY, bWidth, bHeight] = bounds;
    const east = bX + bWidth;
    const north = bY + bHeight;
    return (lon >= bX && lon <= east) && (lat >= bY && lat <= north);
}

function calculateDistanceFromSatellite(elevationAngle) {
    // Convert elevation angle to radians
    const elevationRad = elevationAngle * Math.PI / 180;
    
    // Earth radius in km
    const earthRadius = 6371;
    
    // Calculate central angle
    const centralAngle = Math.PI / 2 - elevationRad - Math.asin(Math.cos(elevationRad) / (1 + 35786 / earthRadius));
    
    // Calculate distance
    const distance = earthRadius * centralAngle;
    
    return distance;
}
