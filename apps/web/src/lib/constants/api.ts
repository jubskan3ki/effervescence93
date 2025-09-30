// --- src/lib/constants/api.ts ---
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	SERVER_ERROR: 500,
} as const;

export const API_ERRORS = {
	NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
	SERVER: 'Erreur serveur. Veuillez réessayer.',
	UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
	FORBIDDEN: 'Accès non autorisé.',
	NOT_FOUND: 'Ressource introuvable.',
	VALIDATION: 'Données invalides.',
} as const;
