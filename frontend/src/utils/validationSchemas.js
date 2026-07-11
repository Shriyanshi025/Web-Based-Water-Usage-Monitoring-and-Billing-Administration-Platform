import { z } from "zod";
import { VALIDATION_RULES } from "../constants/validationRules";

// Helper validator functions
export const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address format")
    .max(VALIDATION_RULES.EMAIL.MAX_LENGTH, `Email must be under ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`);

export const passwordSchema = z
    .string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH, `Password must be under ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`);

export const phoneSchema = z
    .string()
    .min(1, "Phone number is required")
    .regex(VALIDATION_RULES.PHONE.REGEX, VALIDATION_RULES.PHONE.MESSAGE);

export const fullNameSchema = z
    .string()
    .min(VALIDATION_RULES.FULL_NAME.MIN_LENGTH, VALIDATION_RULES.FULL_NAME.MESSAGE)
    .max(VALIDATION_RULES.FULL_NAME.MAX_LENGTH, `Name must be under ${VALIDATION_RULES.FULL_NAME.MAX_LENGTH} characters`);

// Shared Schemas
export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

export const residentRegistrationSchema = z.object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    phoneNumber: phoneSchema,
    communityId: z.preprocess((val) => Number(val), z.number({ required_error: "Community selection is required" }).positive("Please select a valid community")),
    blockId: z.preprocess((val) => Number(val), z.number({ required_error: "Block selection is required" }).positive("Please select a valid block")),
    unitId: z.preprocess((val) => Number(val), z.number({ required_error: "Unit selection is required" }).positive("Please select a valid unit")),
    inviteToken: z.string().optional()
});

export const adminRegistrationSchema = z.object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    phoneNumber: phoneSchema,
    communityId: z.preprocess((val) => Number(val), z.number({ required_error: "Community selection is required" }).positive("Please select a valid community")),
    officeAddress: z.string().min(5, "Office Address must be at least 5 characters").max(250, "Office Address is too long")
});

export const invitationSchema = z.object({
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits").optional().or(z.literal("")),
    whatsapp: z.string().regex(/^[0-9]{10}$/, "WhatsApp number must be exactly 10 digits").optional().or(z.literal(""))
}).refine(data => data.email || data.phone || data.whatsapp, {
    message: "At least one contact method (Email, Phone, or WhatsApp) is required",
    path: ["email"]
});

export const profileUpdateSchema = z.object({
    fullName: fullNameSchema,
    phoneNumber: phoneSchema,
    officeAddress: z.string().min(5, "Office Address must be at least 5 characters").max(250).optional()
});

export const waterMeterSchema = z.object({
    meterSerial: z.string().min(3, "Serial number must be at least 3 characters").max(50),
    communityId: z.number().positive("Community is required"),
    blockId: z.number().positive("Block is required"),
    unitId: z.number().positive("Unit is required"),
    initialReading: z.preprocess((val) => Number(val), z.number().nonnegative("Initial reading cannot be negative"))
});

export const waterUsageSchema = z.object({
    meterId: z.preprocess((val) => Number(val), z.number().positive("Meter selection is required")),
    readingValue: z.preprocess((val) => Number(val), z.number().nonnegative("Reading value must be a positive number"))
});
