import { NextResponse } from 'next/server';
import * as stytch from 'stytch';

const client = new stytch.Client({
  project_id: process.env.NEXT_PUBLIC_STYTCH_PROJECT_ID!,
  secret: process.env.STYTCH_SECRET_KEY!,
});

export async function POST(request: Request) {
    try {
        const { token } = await request.json();
        console.log("🔄 Authenticating token:", token);
        
        const response = await client.magicLinks.authenticate({
            token: token,
            session_duration_minutes: 60,
        });
        
        return NextResponse.json({ 
            success: true,
            session: response.session 
        });
        
    } catch (error) {
        console.error('Authentication failed:', error);

        if (error instanceof stytch.StytchError) {
            console.error('Stytch error details:', {
                status_code: error.status_code,
                error_type: error.error_type,
                error_message: error.error_message
            });
        }
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Authentication failed' 
        });
    }
} 