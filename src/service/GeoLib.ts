import axios from 'axios'

interface GeoLocationResponse {
  results: Array<{
    formatted: string
    geometry: {
      lat: number
      lng: number
    }
  }>
}

class GeoLocationService {
  private apiKey: string
  static resolveLocation: any

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async resolveLocation(location: {
    address?
    coordinates?
  }): Promise<{ address?; coordinates? }> {
    try {
      if (location.address) {
        // Resolve endereço para coordenadas
        const response = await axios.get<GeoLocationResponse>(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            `${location.address.street}, ${location.address.city}, ${location.address.zipCode}`,
          )}&key=${this.apiKey}`,
        )

        const firstResult = response.data.results[0]
        if (firstResult) {
          return {
            coordinates: {
              latitude: firstResult.geometry.lat,
              longitude: firstResult.geometry.lng,
            },
          }
        }
      } else if (location.coordinates) {
        // Resolve coordenadas para endereço
        const response = await axios.get<GeoLocationResponse>(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            `${location.coordinates.latitude},${location.coordinates.longitude}`,
          )}&key=${this.apiKey}`,
        )

        const firstResult = response.data.results[0]
        if (firstResult) {
          const [street, city, zipCode] = firstResult.formatted.split(', ')
          return {
            address: {
              street,
              city,
              zipCode,
            },
          }
        }
      }

      return location // Retorna a localização original se não puder ser resolvida
    } catch (error) {
      console.error('Erro na resolução de localização:', error)
      throw new Error('Erro na resolução de localização')
    }
  }
}

export default GeoLocationService
