export interface AuthResponse {
	ok: boolean;
	token: string;
}

export interface UserPayload {
	email: string;
	id: number;
}
