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

function minimize(errorFunction, initialGuess, targetAzimuth, targetElevation, satelliteLongitude, learningRate = 0.01, maxIterations = 1000) {
    let [lat, lon] = initialGuess;
    let minError = errorFunction([lat, lon], targetAzimuth, targetElevation, satelliteLongitude);

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const [latGradient, lonGradient] = computeGradient(errorFunction, lat, lon, targetAzimuth, targetElevation, satelliteLongitude);
        lat -= learningRate * latGradient;
        lon -= learningRate * lonGradient;

        const error = errorFunction([lat, lon], targetAzimuth, targetElevation, satelliteLongitude);
        if (error < minError) {
            minError = error;
        } else {
            break;
        }
    }

    return [lat, lon];
}

function computeGradient(errorFunction, lat, lon, targetAzimuth, targetElevation, satelliteLongitude, delta = 0.0001) {
    const baseError = errorFunction([lat, lon], targetAzimuth, targetElevation, satelliteLongitude);

    const latError = errorFunction([lat + delta, lon], targetAzimuth, targetElevation, satelliteLongitude);
    const latGradient = (latError - baseError) / delta;

    const lonError = errorFunction([lat, lon + delta], targetAzimuth, targetElevation, satelliteLongitude);
    const lonGradient = (lonError - baseError) / delta;

    return [latGradient, lonGradient];
}


function findLocation(targetAzimuth, targetElevation, satelliteLongitude) {
    const initialGuess = [0, 0];
    const result = minimize(errorFunction, initialGuess, targetAzimuth, targetElevation, satelliteLongitude);
    const [latitude, longitude] = result;
    return { latitude, longitude };
}

function calculateRadius(center, elevationAngle) {
    const point = findLocation(0, elevationAngle, center[0]);
    
    const centerPoint = turf.point(center);
    const edgePoint = turf.point([point.longitude, point.latitude]);
    
    const radius = turf.distance(centerPoint, edgePoint, {units: 'kilometers'});
    
    return radius;
}