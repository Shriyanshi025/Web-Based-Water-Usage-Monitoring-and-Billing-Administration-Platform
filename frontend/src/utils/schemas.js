import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required.")
});

export const wizardStep1BasicSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters.").max(100, "Full name is too long."),
    email: z.string().email("Please enter a valid email address.")
});

export const wizardStep3ResidentSchema = z.object({
    communityId: z.coerce.string().min(1, "Please select a community."),
    blockId: z.coerce.string().min(1, "Please select a block."),
    unitId: z.coerce.string().min(1, "Please select a unit.")
});

export const wizardStep3AdminSchema = z.object({
    communityId: z.coerce.string().min(1, "Please select a community."),
    professionalInfo: z.string().min(10, "Please provide brief professional information (min 10 chars)."),
    invitationToken: z.string().optional()
});

export const wizardStep4CredentialsSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters.").max(20, "Password must be less than 20 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions.")
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});
