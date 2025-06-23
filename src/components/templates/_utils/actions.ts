'use server'

import {createClient} from "@/src/db/sbserver";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const getUser = async() => {
    const supabase = await createClient()

    const {data, error} = await supabase.auth.getUser()

    return data;

}

export const signOut = async() => {
    const supabase = await createClient()

    await supabase.auth.signOut()

    revalidatePath("/", "layout")
    redirect("/login")
}