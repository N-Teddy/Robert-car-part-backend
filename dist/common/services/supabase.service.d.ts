import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private configService;
    private supabaseClient;
    private supabaseAdmin;
    constructor(configService: ConfigService);
    getClient(): SupabaseClient;
    getAdmin(): SupabaseClient;
    isConfigured(): boolean;
}
