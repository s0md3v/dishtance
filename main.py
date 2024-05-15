import math
from scipy.optimize import minimize

def calculate_elevation(satellite_longitude, earth_station_latitude, earth_station_longitude):
    longitude_difference_rad = (earth_station_longitude - satellite_longitude) / 57.29578
    latitude_rad = earth_station_latitude / 57.29578
    r1 = 1 + 35786 / 6378.16
    term1 = r1 * math.cos(latitude_rad) * math.cos(longitude_difference_rad) - 1
    term2 = r1 * math.sqrt(1 - math.cos(latitude_rad)**2 * math.cos(longitude_difference_rad)**2)
    elevation_angle = 57.29578 * math.atan(term1 / term2)
    
    if elevation_angle < 30:
        refracted_elevation = (elevation_angle + math.sqrt(elevation_angle**2 + 4.132)) / 2
    else:
        refracted_elevation = elevation_angle
        
    return refracted_elevation

def calculate_azimuth_magnetic(satellite_longitude, earth_station_latitude, earth_station_longitude):
    longitude_difference_rad = (earth_station_longitude - satellite_longitude) / 57.29578
    sin_latitude = math.sin(earth_station_latitude / 57.29578)
    
    if sin_latitude == 0:
        return 999

    azimuth_angle = 180 + 57.29578 * math.atan(math.tan(longitude_difference_rad) / sin_latitude)
    
    if earth_station_latitude < 0:
        azimuth_angle -= 180
    if azimuth_angle < 0:
        azimuth_angle += 360.0

    magnetic_declination = [
        2.73, 6.52, 9.69, 16.79, 47.45, 15.96, 11.36, 9.27, 17.5, 43.22,
        18.28, 11.48, 8.62, 16.64, 39.01, -7.5, -0.93, 3.24, 13.32, 28.59,
        -25.01, -15.4, -15.83, -10.12, 10.0, -15.8, -9.98, -17.7, -24.74, -5.7,
        -1.43, 0.12, -5.06, -22.39, -20.11, 10.72, 4.35, 1.67, -25.4, -41.87,
        17.47, 2.62, -3.6, -31.48, -62.34, 7.54, -0.32, -1.87, -16.13, -74.45,
        -13.19, -5.43, 0.25, 0.47, -60.84, -11.28, -3.22, 5.04, 10.85, 42.14,
        2.73, 6.52, 9.69, 16.79, 47.45
    ]

    lat = float(earth_station_latitude)
    long = float(earth_station_longitude)
    
    if lat == 60.0:
        lat = 59.99999
    if lat > 59.999999:
        return azimuth_angle + 1000
    if lat < -60:
        return azimuth_angle + 1000
    if long == 180.0:
        long = 179.99999
    if long > 179.999999:
        long -= 360
    if long < -180:
        long += 360

    a = round(((long + 180) / 30) - 0.5)
    b = 3 - round(((lat + 60) / 30) - 0.5)
    index = a * 5 + b

    if lat >= 30:
        lat_offset = lat - 30
    elif lat >= 0:
        lat_offset = lat
    elif lat >= -30:
        lat_offset = 30 + lat
    else:
        lat_offset = 60 + lat

    long_offset = long + 180 - a * 30

    u1 = magnetic_declination[index + 1] + (magnetic_declination[index] - magnetic_declination[index + 1]) * lat_offset / 30
    u2 = magnetic_declination[index + 6] + (magnetic_declination[index + 5] - magnetic_declination[index + 6]) * lat_offset / 30
    declination_adjustment = u1 + (u2 - u1) * long_offset / 30

    adjusted_azimuth = azimuth_angle - declination_adjustment
    
    if adjusted_azimuth < -180:
        adjusted_azimuth += 360
    if adjusted_azimuth > 360:
        adjusted_azimuth -= 360.0
    
    return adjusted_azimuth

def error_function(params, target_azimuth, target_elevation, satellite_longitude):
    latitude, longitude = params
    calculated_elevation = calculate_elevation(satellite_longitude, latitude, longitude)
    calculated_azimuth = calculate_azimuth_magnetic(satellite_longitude, latitude, longitude)
    return (calculated_elevation - target_elevation)**2 + (calculated_azimuth - target_azimuth)**2

def find_location(target_azimuth, target_elevation, satellite_longitude):
    initial_guess = [0, 0]
    result = minimize(error_function, initial_guess, args=(target_azimuth, target_elevation, satellite_longitude), method='BFGS')
    latitude, longitude = result.x
    return latitude, longitude

# poc for now
north_angle = 183.7
elevation_angle = 56.6
satellite_longitude = 74.0

latitude, longitude = find_location(north_angle, elevation_angle, satellite_longitude)
print(f"Latitude: {latitude}, Longitude: {longitude}")
