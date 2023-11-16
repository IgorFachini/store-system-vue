import axios from 'axios'
import qs from 'qs'

const http = axios.create(Object.assign({
  baseURL: 'https://www.googleapis.com',
  timeout: 300000,
  // Access-Control-Allow-Origin'
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}))

const googleApiConfig = {
  client_id: process.env.GOOGLE_DRIVE_CLIENT_ID || '375033014225-4biq885c518anvd7n6q66i7asi30gf7b.apps.googleusercontent.com',
  client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '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',
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '1//0hr5TXbJFKbAVCgYIARAAGBESNwF-L9IrmM94XUYgpHImOunxtKVRyv-XLNfXgMrOHK1iKP_FlPld_eFZnnZqdlaXqCsrA5f7E-I',
  grant_type: 'refresh_token'
}
const interceptors = {
  success (response) {
    return response
  },

  error (error) {
    if (error.response) {
      if (error.response.status === 401) {
        return http.post('/token', qs.stringify(googleApiConfig)).then((data) => {
          error.response.config.headers.Authorization = `Bearer ${data.access_token}`
          return http(error.response.config)
        })
      }
      console.log('error.response', error.response)
    }

    return Promise.reject(error)
  }
}

http.interceptors.response.use(interceptors.success, interceptors.error)

function googleDriveApi () {
  return {
    MultipartUpload (name, image) {
      // formData com
      // arquivo campo metadata, deve gerar um arquivo .json com o campo name dentro
      // atrelar image file no form sem nome
      // atrelar metadata file no form com nome metadata
      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify({ name })], { type: 'application/json' }))
      formData.append('image', image)
      return http.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
  }
}

export { http, googleDriveApi }
