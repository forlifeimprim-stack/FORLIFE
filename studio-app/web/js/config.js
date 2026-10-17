// Configuration de l'application web ForLife Studio.
//
// FIREBASE : collez ici la configuration « Web » du projet Firebase
// (Console Firebase > Paramètres du projet > Vos applications > SDK). Tant que
// la valeur est `null`, l'application tourne en MODE DÉMONSTRATION : les photos
// restent dans ce navigateur (aucun envoi), pratique pour essayer le parcours.
export const FIREBASE_CONFIG = null;

export const STUDIO = {
  id: "forlife-studio",
  name: "ForLife Studio",
  timezone: "Africa/Abidjan",
  galleryDays: 30, // durée d'accès client
};

// Reconnaissance faciale dans le navigateur (face-api, licence MIT).
export const FACE_API_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/dist/face-api.esm.js";
export const FACE_MODELS_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";
// Moteur WebAssembly de TensorFlow.js (même version que celle intégrée à face-api).
export const TF_WASM_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/";
// Distance maximale entre deux visages pour dire « c'est la même personne ».
// face-api recommande 0,6 ; on est plus strict pour ne jamais montrer la photo d'un autre.
export const MATCH_DISTANCE = 0.5;

export const QR_LIB_URL = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js";
