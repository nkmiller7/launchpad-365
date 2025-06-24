'use client'

import {Input} from "../../../components/ui/input";
import {Button} from "../../../components/ui/button";
import {Label} from "../../../components/ui/label";
import React, {FormEvent} from "react";
import {signUp} from "../login/mock-actions";
import {toast} from "@/src/hooks/use-toast";
import {useRouter} from "next/navigation";

export function RegisterForm() {

    const router = useRouter();

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            toast({title: 'Error', description: 'Passwords do not match'});
            return;
        }        const response = await signUp(email, password);

        if(response.error) {
            toast({title: 'Error Signing Up', description: response.error.message});
        } else {
            toast({title: 'Success', description: 'Account created successfully! You can now log in.'});
            router.push('/login');
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
                        <Input id="email" type="email" name={'email'} placeholder="email@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input name={'password'} id="password" type="password" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input name={'confirmPassword'} id="confirmPassword" type="password" required />
                    </div>
                    <Button type="submit" className="w-full" variant={'default'}>
                        Sign Up
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
