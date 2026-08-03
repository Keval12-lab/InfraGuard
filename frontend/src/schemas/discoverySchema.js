import { z } from "zod";

const cidrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/;

export const cidrFormSchema = z.object({
  subnet: z
    .string()
    .min(1, { message: "Target Subnet CIDR is required. Example: 192.168.29.0/24" })
    .trim()
    .refine((val) => cidrRegex.test(val), {
      message: "Invalid IPv4 CIDR range format. Example: 192.168.29.0/24",
    }),
  protocol: z.enum(["icmp", "snmp"]).default("icmp"),
});

export const searchFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().default("ALL"),
  vendor: z.string().default("ALL"),
  device_type: z.string().default("ALL"),
});
