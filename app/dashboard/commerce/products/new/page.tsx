import { redirect } from "next/navigation";

export default function NewProductRedirect() {
    // Automatically redirect back to the main commerce page with the trigger parameter
    redirect("/dashboard/commerce?add=true");
}
