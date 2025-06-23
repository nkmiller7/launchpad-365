import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "blue" | "solarized";

const themes: Theme[] = ["light", "dark", "blue", "solarized"];

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>("light");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedTheme = localStorage.getItem("theme") as Theme | null;

            if (storedTheme && themes.includes(storedTheme)) {
                document.documentElement.setAttribute("data-theme", storedTheme);
                setThemeState(storedTheme);
            } else {
                localStorage.setItem("theme", "light");
                document.documentElement.setAttribute("data-theme", "light");
                setThemeState("light");
            }

            setIsLoaded(true);
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        if (themes.includes(newTheme)) {
            localStorage.setItem("theme", newTheme);
            document.documentElement.setAttribute("data-theme", newTheme);
            setThemeState(newTheme);
        }
    };

    const toggleTheme = () => {
        //@ts-ignore
        setTheme((prev: any) => {
            const currentIndex = themes.indexOf(prev);
            const nextIndex = (currentIndex + 1) % themes.length;
            return themes[nextIndex];
        });
    };

    return {
        theme,
        setTheme,
        toggleTheme,
        availableThemes: themes,
        isLoaded,
    };
}