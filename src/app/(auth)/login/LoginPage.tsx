'use client';

import {Input} from "../../../components/ui/input";
import {Button} from "../../../components/ui/button";
import {Label} from "../../../components/ui/label";
import React, {FormEvent, useState} from "react";
import {loginUser} from "../login/actions";
import {useRouter} from "next/navigation";
import {createClient} from "../../../db/sbclient";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        
        try {
            // First try to log in
            const {error} = await loginUser(email, password);
            
            if (!error) {
                // Get user profile to check role
                const supabase = createClient();
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (user && !authError) {
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", user.id)
                        .single();
                    
                    // Redirect based on role
                    if (profile && profile.role === "manager") {
                        router.push("/admin");
                    } else {
                        router.push("/dashboard");
                    }
                } else {
                    router.push("/dashboard");
                }
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Unexpected login error:', error);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={"flex flex-col gap-6"}>
            <form onSubmit={onSubmit} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">                           
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold">Welcome!</h1>
                        <p className="text-balance text-muted-foreground">
                            Login to your Launchpad 365 account<br/>
                        </p>
                    </div><div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            name="email" 
                            placeholder="alias@microsoft.com" 
                            required 
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input 
                            name="password" 
                            id="password" 
                            type="password" 
                            required 
                            disabled={isLoading}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full" 
                        variant="default"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Login'}
                    </Button>                            
                </div>
            </form>
        </div>
    )
}