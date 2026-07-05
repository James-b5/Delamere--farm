"use client";

import { useEffect, useState } from "react";

const weatherCodeLabels: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Heavy showers",
  82: "Stormy showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

const getWindDirection = (degrees: number) => {
  if (degrees >= 337.5 || degrees < 22.5) return "N";
  if (degrees < 67.5) return "NE";
  if (degrees < 112.5) return "E";
  if (degrees < 157.5) return "SE";
  if (degrees < 202.5) return "S";
  if (degrees < 247.5) return "SW";
  if (degrees < 292.5) return "W";
  return "NW";
};

interface WeatherState {
  temperature: number;
  description: string;
  windSpeed: number;
  windDirection: string;
  humidity: number | null;
  precipitation: number | null;
}

export default function FarmWeather() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWeather() {
      try {
        const latitude = -0.3031;
        const longitude = 36.0800;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability&timezone=auto`;
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Weather fetch failed");
        }

        const data = await response.json();
        const current = data.current_weather;
        const timeIndex = data.hourly?.time?.findIndex((time: string) => time === current.time);
        const humidity = timeIndex >= 0 ? data.hourly.relativehumidity_2m[timeIndex] : null;
        const precipitation = timeIndex >= 0 ? data.hourly.precipitation_probability[timeIndex] : null;

        setWeather({
          temperature: Math.round(current.temperature),
          description: weatherCodeLabels[current.weathercode] ?? "Clear",
          windSpeed: Math.round(current.windspeed),
          windDirection: getWindDirection(current.winddirection),
          humidity,
          precipitation,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Unable to load weather right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();

    return () => controller.abort();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-xl min-w-64">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-semibold text-lg">Nakuru Farm</h3>
          <p className="text-sm text-green-100">Live weather from Open-Meteo</p>
        </div>
        <div className="rounded-2xl bg-yellow-500/15 p-3 text-yellow-200">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3.25a1 1 0 011 1V6a1 1 0 11-2 0V4.25a1 1 0 011-1zM19.78 5.22a1 1 0 010 1.41l-1.06 1.06a1 1 0 01-1.42-1.42l1.06-1.06a1 1 0 011.42 0zM20.75 12a1 1 0 01-1 1H18a1 1 0 110-2h1.75a1 1 0 011 1zM19.78 18.78a1 1 0 01-1.42 0l-1.06-1.06a1 1 0 011.42-1.42l1.06 1.06a1 1 0 010 1.42zM12 18.75a1 1 0 011 1V20a1 1 0 11-2 0v-.25a1 1 0 011-1zM6.64 18.07a1 1 0 01-1.42 0l-1.06-1.06a1 1 0 011.42-1.42l1.06 1.06a1 1 0 010 1.42zM4.25 12a1 1 0 01-1 1H2a1 1 0 110-2h1.25a1 1 0 011 1zM6.64 5.93a1 1 0 00-1.42 0L4.16 7a1 1 0 001.42 1.42l1.06-1.06a1 1 0 000-1.42zM12 7a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <span className="text-5xl font-bold">
          {loading ? "--" : weather ? weather.temperature : "--"}
        </span>
        <span className="text-xl pb-1">°C</span>
      </div>

      <p className="text-green-100 text-sm mb-6">
        {loading ? "Loading current weather..." : error ? error : weather?.description}
      </p>

      <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/20 pt-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-green-200">Wind</p>
          <p className="font-semibold text-white">{weather ? `${weather.windSpeed} km/h ${weather.windDirection}` : "--"}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-green-200">Humidity</p>
          <p className="font-semibold text-white">{weather?.humidity != null ? `${weather.humidity}%` : "--"}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-green-200">Precipitation</p>
          <p className="font-semibold text-white">{weather?.precipitation != null ? `${weather.precipitation}%` : "--"}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-green-200">Location</p>
          <p className="font-semibold text-white">Nakuru, Kenya</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-300">
        {loading ? "" : error ? "Check network or try again later." : "Updated from Open-Meteo."}
      </p>
    </div>
  );
}
