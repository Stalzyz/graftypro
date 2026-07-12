import { prisma } from "../db";

export class SheetsService {
    /**
     * Retrieve and refresh (if needed) the Google Sheets access token for a workspace.
     */
    static async getValidToken(workspaceId: string): Promise<string | null> {
        const integration = await prisma.integrations.findUnique({
            where: {
                workspace_id_type: {
                    workspace_id: workspaceId,
                    type: 'GOOGLE_SHEETS'
                }
            }
        });

        if (!integration || !integration.is_active || !integration.credentials) {
            return null;
        }

        let creds: any;
        try {
            creds = typeof integration.credentials === 'string' 
                ? JSON.parse(integration.credentials) 
                : integration.credentials;
        } catch (e) {
            console.error("[SheetsService] Failed to parse credentials");
            return null;
        }

        const now = Date.now();
        // Add a 5 minute buffer before actual expiry
        if (creds.expiry_date && now > (creds.expiry_date - 300000)) {
            console.log("[SheetsService] Token expired. Refreshing...");
            
            const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
            const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

            if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
                console.error("[SheetsService] Missing Google Client ID/Secret for refresh");
                return null;
            }

            try {
                const response = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: GOOGLE_CLIENT_ID,
                        client_secret: GOOGLE_CLIENT_SECRET,
                        refresh_token: creds.refresh_token,
                        grant_type: "refresh_token"
                    })
                });

                if (!response.ok) {
                    const err = await response.text();
                    console.error("[SheetsService] Failed to refresh token:", err);
                    // Disable integration if refresh token is revoked
                    if (err.includes('invalid_grant')) {
                        await prisma.integrations.update({
                            where: { id: integration.id },
                            data: { is_active: false }
                        });
                    }
                    return null;
                }

                const data = await response.json();
                
                const newCreds = {
                    ...creds,
                    access_token: data.access_token,
                    expiry_date: now + (data.expires_in * 1000)
                };

                await prisma.integrations.update({
                    where: { id: integration.id },
                    data: { credentials: newCreds }
                });

                return data.access_token;

            } catch (err) {
                console.error("[SheetsService] Error refreshing token:", err);
                return null;
            }
        }

        return creds.access_token;
    }

    /**
     * Appends a row of data to the specified Google Sheet.
     * dataValues should be an array of strings/numbers representing the cells in the row.
     */
    static async appendRow(workspaceId: string, spreadsheetId: string, sheetName: string, dataValues: any[]): Promise<boolean> {
        try {
            const token = await this.getValidToken(workspaceId);
            if (!token) {
                console.warn(`[SheetsService] No valid GOOGLE_SHEETS integration found for workspace ${workspaceId}`);
                return false;
            }

            // Encode the sheet name in case it contains spaces or special characters
            const range = encodeURIComponent(sheetName);
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    values: [dataValues]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[SheetsService] Failed to append row:", response.status, errorText);
                return false;
            }

            console.log(`[SheetsService] ✅ Successfully appended row to sheet ${spreadsheetId}`);
            return true;

        } catch (error: any) {
            console.error("[SheetsService] Exception while appending row:", error.message);
            return false;
        }
    }
}
