"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSupabaseClient = createUserSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
function createUserSupabaseClient(accessToken) {
    return (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_PUBLISHABLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
}
