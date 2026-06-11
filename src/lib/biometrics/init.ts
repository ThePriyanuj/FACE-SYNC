const BIOMETRIC_MODEL_CACHE = 'aec-face-sync-biometrics-v1';
const BIOMETRIC_ASSETS = [
  '/models/tiny_face_detector_model-weights_shard1',
  '/models/tiny_face_detector_model.json',
  '/models/face_landmark_68_model-weights_shard1',
  '/models/face_landmark_68_model.json'
];

// Instantly initializes biometric models from local CacheStorage
export async function initializeLocalBiometricModels(): Promise<boolean> {
  if (!('caches' in window)) {
    return false; // Fallback to standard network fetching if Cache API is unsupported
  }

  try {
    const cache = await caches.open(BIOMETRIC_MODEL_CACHE);
    
    for (const url of BIOMETRIC_ASSETS) {
      const matchedResponse = await cache.match(url);
      if (!matchedResponse) {
        // Fetch asset from network and store a clone in cache
        const freshResponse = await fetch(url);
        if (freshResponse.ok) {
          await cache.put(url, freshResponse.clone());
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Local biometric cache retrieval failed:", error);
    return false;
  }
}
