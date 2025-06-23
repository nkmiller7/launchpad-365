import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';


export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		"https://ribcayxeubylkmwsqnef.supabase.co",
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpYmNheXhldWJ5bGttd3NxbmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTQ4NjIsImV4cCI6MjA1NDE5MDg2Mn0.6ia2H0ADkleHwzBDbuzI8UfAgaMTEWL7tc3wY1SDahI",
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch {
					}
				},
			},
		}
	);
}