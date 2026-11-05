from django.shortcuts import render
import requests
import datetime

def index(request):
    api_key = open('D:\\Project\\weather-app\\API_KEY',"r").read()
    current_weather_url = 'https://api.openweathermap.org/data/2.5/weather?q={}&units=metric&appid={}'
    forecast_url1 = 'https://api.openweathermap.org/data/2.5/forecast?lat={}&lon={}&units=metric&appid={}'

    if request.method == 'POST':
        city1 = request.POST['city1']
        city2 = request.POST.get('city2', None)
        weather_data1, daily_forecasts1 = fetch_weather_and_forecast_1(city1, api_key, current_weather_url, forecast_url1)


        if city2:
            weather_data2, daily_forecasts2 = fetch_weather_and_forecast_1(city2, api_key, current_weather_url, forecast_url1)

        else:
            weather_data2, daily_forecasts2 = None, None

        context = {
            'weather_data1': weather_data1,
            'daily_forecasts1': daily_forecasts1,
            'weather_data2': weather_data2,
            'daily_forecasts2': daily_forecasts2,
        }

        return render(request, 'weather_app/index.html', context)
    else:
        return render(request, 'weather_app/index.html')

def fetch_weather_and_forecast_1(city, api_key, current_weather_url, forecast_url1):
    current_weather_response = requests.get(current_weather_url.format(city, api_key))
    if current_weather_response.status_code != 200:
        return None, None
    current_weather = current_weather_response.json()
    weather_data = {
        'city': city,
        'temperature': round(current_weather['main']['temp'], 2),
        'description': current_weather['weather'][0]['description'],
        'icon': current_weather['weather'][0]['icon'],
    }
    lat, lon = current_weather['coord']['lat'], current_weather['coord']['lon']
    forecast_response = requests.get(forecast_url1.format(lat, lon, api_key))
    if forecast_response.status_code != 200:
        return weather_data, None
    forecast_data = forecast_response.json()
    daily_forecasts = []
    forecasts_by_day = {}
    for forecast in forecast_data.get('list', []):
        date = datetime.datetime.fromtimestamp(forecast['dt']).strftime('%Y-%m-%d')
        if date not in forecasts_by_day:
            forecasts_by_day[date] = []
        forecasts_by_day[date].append(forecast)

    for date_str, forecasts in sorted(forecasts_by_day.items())[:5]:
        noon_forecast = min(forecasts, key=lambda f: abs(datetime.datetime.fromtimestamp(f['dt']).hour - 12))
        daily_forecasts.append({
            'day': datetime.datetime.strptime(date_str, '%Y-%m-%d').strftime('%A'),
            'min_temp': round(min(f['main']['temp_min'] for f in forecasts), 2),
            'max_temp': round(max(f['main']['temp_max'] for f in forecasts), 2),
            'description': noon_forecast['weather'][0]['description'],
            'icon': noon_forecast['weather'][0]['icon'],
        })
    print(weather_data, daily_forecasts)
    return weather_data, daily_forecasts