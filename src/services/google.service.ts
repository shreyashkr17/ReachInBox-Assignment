import axios from "axios";
interface GoogleTokens {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
    id_token?: string;
}
interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}
export class GoogleOAuthService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly scope: string[];

    constructor(
        clientId: string,
        clientSecret: string,
        redirectUri: string,
        scope: string[] = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/gmail.modify',
        ]
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.scope = scope;
    }

    getAuthorizationUrl(): string {
        const scopeString = this.scope.join(' ');
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: scopeString,
            access_type: 'offline',
            prompt: 'consent',
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async getTokensFromCode(code: string): Promise<GoogleTokens> {
        try {
            const response = await axios.post(
                'https://oauth2.googleapis.com/token',
                {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: this.redirectUri,
                }
            );

            return response.data as Promise<GoogleTokens>;
        } catch (error: any) {
            throw new Error(`Failed to get tokens: ${error.message}`);
        }
    }


    async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
        try {
            const response = await axios.post(
                'https://oauth2.googleapis.com/token',
                {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                }
            );

            return response.data as Promise<GoogleTokens>;
        } catch (error: any) {
            throw new Error(`Failed to refresh token: ${error.message}`);
        }
    }


    async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
        try {
            const response = await axios.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            return response.data as Promise<GoogleUserInfo>;
        } catch (error:any) {
            throw new Error(`Failed to get user info: ${error.message}`);
        }
    }

    async revokeToken(token: string): Promise<void> {
        try {
            await axios.post(
                `https://oauth2.googleapis.com/revoke?token=${token}`
            );
        } catch (error:any) {
            throw new Error(`Failed to revoke token: ${error.message}`);
        }
    }
}