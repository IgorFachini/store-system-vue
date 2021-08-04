import axios from 'axios'
const http = axios.create()
const urlBase = 'https://viacep.com.br/ws'

const Cep = {
  get (cep) {
    return http.get(`${urlBase}/${cep}/json/`)
  }
}

export default Cep
