// {
//   "id": "pUSqvf7pRcNpXIy3DlQO",
//   "city": "Jaraguá do Sul",
//   "cep": "89260-842",
//   "number": 11,
//   "createdAt": 1693270820529,
//   "phone": "4733728524",
//   "publicPlace": "Rua Tarcísio José Lescowicz",
//   "district": "Jaraguá 84",
//   "cellphone": "47997564332",
//   "state": "SC",
//   "observation": "observação",
//   "document": "documento",
//   "complement": "casa",
//   "name": "mercado são joão",
//   "updatedAt": 1693270930152
// }
export interface Customer {
  id: string;
  city: string;
  cep: string;
  number: number;
  createdAt: number;
  phone: string;
  publicPlace: string;
  district: string;
  cellphone: string;
  state: string;
  observation: string;
  document: string;
  complement: string;
  name: string;
  updatedAt: number;
}
