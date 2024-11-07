import axios from "axios";

export class GoogleAuth {
    private readonly appClientId: string;
    private readonly appClientSecret: string;
    private readonly callbackUri: string;
    private readonly permissions: string[];

    constructor(
        appClientId: string,
        appClientSecret: string,
        callbackUri: string,
        permissions: string[] = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/gmail.modify',
        ]
    ) {
        this.appClientId = appClientId;
        this.appClientSecret = appClientSecret;
        this.callbackUri = callbackUri;
        this.permissions = permissions;
    }

    getAuthUrl(): string {
        const permissionsString = this.permissions.join(' ');
        const queryParams = new URLSearchParams({
            client_id: this.appClientId,
            redirect_uri: this.callbackUri,
            response_type: 'code',
            scope: permissionsString,
            access_type: 'offline',
            prompt: 'consent',
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${queryParams.toString()}`;
    }

    async retrieveTokens(authCode: string): Promise<GoogleTokens> {
        try {
            const response = await axios.post(
                'https://oauth2.googleapis.com/token',
                {
                    client_id: this.appClientId,
                    client_secret: this.appClientSecret,
                    code: authCode,
                    grant_type: 'authorization_code',
                    redirect_uri: this.callbackUri,
                }
            );

            return response.data as Promise<GoogleTokens>;
        } catch (error: any) {
            throw new Error(`Failed to get tokens: ${error.message}`);
        }
    }

    async updateAccessToken(refreshToken: string): Promise<GoogleTokens> {
        try {
            const response = await axios.post(
                'https://oauth2.googleapis.com/token',
                {
                    client_id: this.appClientId,
                    client_secret: this.appClientSecret,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                }
            );

            return response.data as Promise<GoogleTokens>;
        } catch (error: any) {
            throw new Error(`Failed to refresh token: ${error.message}`);
        }
    }

    async fetchUserInfo(bearerToken: string): Promise<GoogleUserInfo> {
        try {
            const response = await axios.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                {
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                    },
                }
            );

            return response.data as Promise<GoogleUserInfo>;
        } catch (error:any) {
            throw new Error(`Failed to get user info: ${error.message}`);
        }
    }

    async revokeAuthToken(authToken: string): Promise<void> {
        try {
            await axios.post(
                `https://oauth2.googleapis.com/revoke?token=${authToken}`
            );
        } catch (error:any) {
            throw new Error(`Failed to revoke token: ${error.message}`);
        }
    }
}
