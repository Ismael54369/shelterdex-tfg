// Cabeceras con token JWT para peticiones autenticadas
export const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('tokenShelterDex')}`
});

export const authHeadersJSON = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('tokenShelterDex')}`
});