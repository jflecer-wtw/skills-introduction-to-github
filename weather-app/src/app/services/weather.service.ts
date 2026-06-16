import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  city: City;
  currentTemperature: number;
  apparentTemperature: number;
  weatherCode: number;
  hourlyTimes: string[];
  hourlyTemperatures: number[];
  unit: string;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly API_BASE = 'https://api.open-meteo.com/v1/forecast';

  readonly CITIES: City[] = [
    { name: 'Manila', latitude: 14.5995, longitude: 120.9842 },
    { name: 'Cebu', latitude: 10.3157, longitude: 123.8854 },
    { name: 'Boracay', latitude: 11.9674, longitude: 121.9248 },
    { name: 'Palawan', latitude: 9.8349, longitude: 118.7384 },
    { name: 'Laguna', latitude: 14.1407, longitude: 121.4692 }
  ];

  constructor(private http: HttpClient) {}

  getWeather(city: City): Observable<WeatherData> {
    const params = {
      latitude: city.latitude.toString(),
      longitude: city.longitude.toString(),
      current: 'temperature_2m,apparent_temperature,weather_code',
      hourly: 'temperature_2m',
      forecast_days: '1',
      timezone: 'Asia/Manila',
      temperature_unit: 'celsius'
    };

    const url = `${this.API_BASE}?${new URLSearchParams(params).toString()}`;

    return this.http.get<any>(url).pipe(
      map(response => ({
        city,
        currentTemperature: response.current?.temperature_2m ?? 0,
        apparentTemperature: response.current?.apparent_temperature ?? 0,
        weatherCode: response.current?.weather_code ?? 0,
        hourlyTimes: response.hourly?.time ?? [],
        hourlyTemperatures: response.hourly?.temperature_2m ?? [],
        unit: response.current_units?.temperature_2m ?? '°C',
        isLoading: false,
        error: null
      }))
    );
  }

  getAllCitiesWeather(): Observable<WeatherData[]> {
    return forkJoin(this.CITIES.map(city => this.getWeather(city)));
  }

  getWeatherDescription(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 9) return 'Foggy';
    if (code <= 19) return 'Drizzle';
    if (code <= 29) return 'Rain';
    if (code <= 39) return 'Snow';
    if (code <= 49) return 'Fog';
    if (code <= 59) return 'Drizzle';
    if (code <= 69) return 'Rain';
    if (code <= 79) return 'Snow';
    if (code <= 84) return 'Rain Showers';
    if (code <= 94) return 'Thunderstorm';
    return 'Thunderstorm';
  }

  getWeatherIcon(code: number): string {
    if (code === 0) return 'bi-sun';
    if (code <= 3) return 'bi-cloud-sun';
    if (code <= 9) return 'bi-cloud-fog2';
    if (code <= 19) return 'bi-cloud-drizzle';
    if (code <= 29) return 'bi-cloud-rain';
    if (code <= 39) return 'bi-cloud-snow';
    if (code <= 49) return 'bi-cloud-fog';
    if (code <= 59) return 'bi-cloud-drizzle';
    if (code <= 69) return 'bi-cloud-rain-heavy';
    if (code <= 79) return 'bi-cloud-snow';
    if (code <= 84) return 'bi-cloud-rain';
    if (code <= 94) return 'bi-cloud-lightning-rain';
    return 'bi-cloud-lightning';
  }
}
