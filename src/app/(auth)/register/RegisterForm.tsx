'use client'

import {Input} from "../../../components/ui/input";
import {Button} from "../../../components/ui/button";
import {Label} from "../../../components/ui/label";
import React, {FormEvent, useState} from "react";
import {toast} from "@/src/hooks/use-toast";
import {useRouter} from "next/navigation";
import { createClient } from "../../../db/sbclient";

export function RegisterForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            toast({title: 'Error', description: 'Passwords do not match'});
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if(error) {
                toast({title: 'Error Signing Up', description: error.message});
            } else {
                toast({
                    title: 'Success', 
                    description: 'Account created! Please check your email to confirm your account, or try logging in directly.'
                });
                router.push('/login');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast({title: 'Error', description: 'An unexpected error occurred'});
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={"flex flex-col gap-6"}>
            <form onSubmit={onSubmit} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold">Create Account</h1>
                        <p className="text-balance text-muted-foreground">Sign up for your Launchpad 365 account</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            name="email" 
                            placeholder="you@example.com" 
                            required 
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            name="password" 
                            id="password" 
                            type="password" 
                            required 
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input 
                            name="confirmPassword" 
                            id="confirmPassword" 
                            type="password" 
                            required 
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full" 
                        variant="default"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <a href="/login" className="underline underline-offset-4">
                            Sign in
                        </a>
                    </div>
                </div>
            </form>
        </div>
    )
}
