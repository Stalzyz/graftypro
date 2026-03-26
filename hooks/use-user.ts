"use client";

import { useState, useEffect } from "react";

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    avatar_url: string | null;
    workspace_id: string;
    workspace: {
        id: string;
        name: string;
        status: string;
        plan: {
            name: string;
            module_crm: boolean;
            module_ecommerce: boolean;
            module_academy: boolean;
            module_drip: boolean;
            module_integration: boolean;
        } | null;
    };
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (res.ok) {
                    setUser(data.user);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError("Failed to fetch user");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    return { user, loading, error };
}
