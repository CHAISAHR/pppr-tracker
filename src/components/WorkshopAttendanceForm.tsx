import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { api } from "@/services/api";

const attendanceSchema = z.object({
  workshopId: z.string().min(1, "Please select a workshop"),
  fullName: z.string().min(2, "Full name is required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select gender" }),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  designation: z.string().min(2, "Designation is required"),
  organisation: z.string().min(2, "Organisation is required"),
  province: z.string().min(1, "Province is required"),
  daysAttending: z.array(z.number()).min(1, "Select at least one day of attendance"),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

export function WorkshopAttendanceForm() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      workshopId: "",
      fullName: "",
      gender: undefined,
      phoneNumber: "",
      designation: "",
      organisation: "",
      province: "",
      daysAttending: [],
    },
  });

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    try {
      const data = await api.getWorkshops();
      setWorkshops(data);
    } catch (error) {
      toast.error("Failed to load workshops");
    }
  };

  const handleWorkshopChange = (workshopId: string) => {
    const workshop = workshops.find(w => w.id === workshopId);
    setSelectedWorkshop(workshop);
    form.setValue("workshopId", workshopId);
    form.setValue("daysAttending", []);
  };

  const handleDayToggle = (dayNumber: number, checked: boolean) => {
    const currentDays = form.getValues("daysAttending");
    if (checked) {
      form.setValue("daysAttending", [...currentDays, dayNumber]);
    } else {
      form.setValue("daysAttending", currentDays.filter(d => d !== dayNumber));
    }
  };

  const onSubmit = async (data: AttendanceFormData) => {
    setLoading(true);
    try {
      await api.submitWorkshopAttendance(data);
      toast.success("Registration submitted successfully!");
      form.reset();
      setSelectedWorkshop(null);
    } catch (error) {
      toast.error("Failed to submit registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="workshopId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Workshop</FormLabel>
              <Select onValueChange={handleWorkshopChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a workshop" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {workshops.map((workshop) => (
                    <SelectItem key={workshop.id} value={workshop.id}>
                      {workshop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedWorkshop && (
          <>
            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary rounded-lg">
              <div>
                <Label className="text-muted-foreground">Workshop Name</Label>
                <p className="font-medium text-secondary-foreground">{selectedWorkshop.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Activity</Label>
                <p className="font-medium text-secondary-foreground">{selectedWorkshop.activity}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p className="font-medium text-secondary-foreground">{selectedWorkshop.date}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Venue</Label>
                <p className="font-medium text-secondary-foreground">{selectedWorkshop.venue}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organisation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisation</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your organisation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="daysAttending"
              render={() => (
                <FormItem>
                  <FormLabel>Days of Attendance</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: selectedWorkshop.numberOfDays }, (_, i) => i + 1).map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                        />
                        <Label htmlFor={`day-${day}`} className="cursor-pointer">
                          Day {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Submit Registration"}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
