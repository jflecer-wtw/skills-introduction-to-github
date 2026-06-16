import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, WeatherData, City } from '../../services/weather.service';

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-dashboard.component.html',
  styleUrl: './weather-dashboard.component.scss'
})
export class WeatherDashboardComponent implements OnInit {
  weatherData: WeatherData[] = [];
  isLoading = true;
  lastUpdated: Date | null = null;

  constructor(public weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadWeather();
  }

  loadWeather(): void {
    this.isLoading = true;
    this.weatherData = this.weatherService.CITIES.map(city => ({
      city,
      currentTemperature: 0,
      apparentTemperature: 0,
      weatherCode: 0,
      hourlyTimes: [],
      hourlyTemperatures: [],
      unit: '°C',
      isLoading: true,
      error: null
    }));

    this.weatherService.getAllCitiesWeather().subscribe({
      next: (data) => {
        this.weatherData = data;
        this.isLoading = false;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        this.isLoading = false;
        this.weatherData = this.weatherData.map(wd => ({
          ...wd,
          isLoading: false,
          error: 'Failed to load weather data.'
        }));
      }
    });
  }

  getHourlyForecast(data: WeatherData): { time: string; temp: number }[] {
    return data.hourlyTimes.slice(0, 12).map((time, i) => ({
      time: new Date(time).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temp: data.hourlyTemperatures[i]
    }));
  }

  getTemperatureColor(temp: number): string {
    if (temp >= 38) return 'danger';
    if (temp >= 34) return 'warning';
    if (temp >= 28) return 'success';
    return 'info';
  }
}
