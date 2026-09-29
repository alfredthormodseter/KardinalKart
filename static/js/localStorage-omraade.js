const OMRAADE_STORAGE_KEY = 'kardinalKart_omraade';

export function hentOmraade() {
    const data = localStorage.getItem(OMRAADE_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

export function lagre Omraade(coordinates) {
    localStorage.setItem(OMRAADE_STORAGE_KEY, JSON.stringify(coordinates));
}

export function slettOmraade() {
    localStorage.removeItem(OMRAADE_STORAGE_KEY);
}