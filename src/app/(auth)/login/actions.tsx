'use server'

import {createClient} from "../../../db/sbserver";

export const loginUser = async (email: string, password: string) => {
    const supabase = await createClient();

    return await supabase.auth.signInWithPassword({
        email,
        password,
    })
}