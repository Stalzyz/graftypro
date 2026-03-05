"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SmartPartnerLinkProps {
    className?: string;
    children: React.ReactNode;
    destinationType?: "affiliate" | "portal"; // affiliate = /reseller-register, portal = /partner/dashboard
}

export function SmartPartnerLink({ className, children, destinationType = "affiliate" }: SmartPartnerLinkProps) {
    const [href, setHref] = useState<string>(destinationType === "portal" ? "/partner/login" : "/reseller-register");
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // We need to check both reseller auth and normal user auth
        Promise.all([
            fetch("/api/reseller/auth/me", { credentials: "include" })
                .then(res => res.ok ? res.json() : null)
                .catch(() => null),
            fetch("/api/auth/me", { credentials: "include" })
                .then(res => res.ok ? res.json() : null)
                .catch(() => null)
        ]).then(([resellerAuth, userAuth]) => {
            // Scenario 2.4 / 2.3: If they are logged in as a partner/reseller
            if (resellerAuth && !resellerAuth.error && resellerAuth.authenticated !== false) {
                setHref("/partner/dashboard");
            }
            // Scenario 2.2: Existing vendor (user) but NOT a partner.
            else if (userAuth && !userAuth.error && userAuth.user) {
                setHref("/reseller-register");
            }
            // Scenario 2.1: New user (not logged in at all)
            else {
                setHref("/reseller-register");
            }
        }).finally(() => setChecked(true));
    }, [destinationType]);

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}
