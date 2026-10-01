export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyAfYDTXPe6YjUHdxCTDpddKd9D8MZBEFrM',
    authDomain: 'opti-proces.firebaseapp.com',
    projectId: 'opti-proces',
    storageBucket: 'opti-proces.firebasestorage.app',
    messagingSenderId: '177265076610',
    appId: '1:177265076610:web:8373dd3a30793f96e0479b',
  },
};

export function isFirebaseConfigured(): boolean {
  const { apiKey, projectId, appId } = environment.firebase;
  return (
    !!apiKey &&
    !!projectId &&
    !!appId &&
    !apiKey.startsWith('PEGA_AQUI') &&
    !projectId.startsWith('PEGA_AQUI')
  );
}
