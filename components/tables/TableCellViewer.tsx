"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";


import { useIsMobile } from "@/hooks/use-mobile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Separator } from "../ui/separator";
import { IconTrendingUp } from "@tabler/icons-react";
import { Input } from "../ui/input";
import { Role } from "@/app/(modules)/dashboard/types/gym-member";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Predefined options for dropdowns
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
  { value: "terminated", label: "Terminated" },
];

const SPECIALIZATION_OPTIONS = [
  { value: "personal_training", label: "Personal Training" },
  { value: "yoga", label: "Yoga" },
  { value: "crossfit", label: "CrossFit" },
  { value: "nutrition", label: "Nutrition" },
  { value: "physiotherapy", label: "Physiotherapy" },
];

const POSITION_OPTIONS = [
  { value: "trainer", label: "Trainer" },
  { value: "front_desk", label: "Front Desk" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig
// --- Types ---
type TableCellViewerProps<TItem, Schema extends z.ZodTypeAny> = {
  item: TItem;
  titleKey: keyof TItem;
  formFields: {
    name: keyof z.infer<Schema>;
    label: string;
    placeholder: string;
    type?: "text" | "select" | "email";
    options?: { value: string; label: string }[];
  }[];
  schema: Schema;
  userId: string;
  onSubmit?: (data: z.infer<Schema>,userId?:string) => void;
  pending:boolean
  role?:Role
};

// --- Component ---
export function TableCellViewer<TItem, Schema extends z.ZodTypeAny>({
  item,
  titleKey,
  formFields,
  schema,
  onSubmit,
  userId,
  pending,
  role
}: TableCellViewerProps<TItem, Schema>) {
  const isMobile = useIsMobile();

  const form = useForm<z.infer<Schema>>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      formFields.map((field) => [
        field.name,
        item[field.name as keyof TItem] ?? "",
      ])
    ) as z.infer<Schema>,
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit?.(data, userId);
  });

  // Helper function to get options for select fields
  const getFieldOptions = (fieldName: string) => {
    switch (fieldName) {
      case "status":
        return STATUS_OPTIONS;
      case "specialization":
        return SPECIALIZATION_OPTIONS;
      case "position":
        return POSITION_OPTIONS;
      default:
        return [];
    }
  };

  // Helper function to determine if a field should be shown
  const shouldShowField = (fieldName: string) => {
    if (role === "member") {
      return !["specialization", "position","status"].includes(fieldName);
    }
    if (role === "staff") {
      // For staff, these fields are required
      return true;
    }
    return true;
  };

  // Helper function to determine if a field should use a select input
  const isSelectField = (fieldName: string) => {
    return ["status", "specialization", "position", "membership_status"].includes(fieldName);
  };

  // Helper function to determine if a field is required
  const isRequiredField = (fieldName: string) => {
    if (role === "staff") {
      return ["specialization", "position"].includes(fieldName);
    }
    return false;
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {String(item[titleKey])} 
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle className="text-center py-4">{String(item[titleKey])}</DrawerTitle>
          <DrawerDescription>Edit information</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
        {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just
                  some random text to test the layout. It spans multiple lines
                  and should wrap around.
                </div>
              </div>
              <Separator />
            </>
          )}
          <DrawerTitle>Edit</DrawerTitle>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {formFields.map((field) => {
                if (!shouldShowField(String(field.name))) return null;

                return (
                  <FormField
                    key={String(field.name)}
                    control={form.control}
                    name={field.name as any}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}{isRequiredField(String(field.name)) && " *"}</FormLabel>
                        <FormControl>
                          {isSelectField(String(field.name)) ? (
                            <Select
                              value={f.value}
                              onValueChange={f.onChange}
                              disabled={field.name === "email"}
                              required={isRequiredField(String(field.name))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                                {getFieldOptions(String(field.name)).map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              disabled={field.name === "email"}
                              placeholder={field.placeholder}
                              {...f}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
              <Button disabled={pending} type="submit">
                {pending ? "Saving..." : "Save"}
              </Button>
            </form>
          </Form>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
