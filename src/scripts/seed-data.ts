import { Employee } from "../models/employee";
import { Shift, ShiftStatus } from "../models/shift";
import { TimeOff, TimeOffStatus } from "../models/time-off";
import { AuthUtils } from "../utils/auth-utils";

function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

async function seed() {
  await Promise.all([
    Employee.deleteMany({}),
    Shift.deleteMany({}),
    TimeOff.deleteMany({}),
  ]);

  console.log("Cleared existing Employee/Shift/TimeOff documents.");

  const employeesData = [
    {
      email: "alice.manager@example.com",
      password: "password123",
      firstName: "Alice",
      lastName: "Green",
      role: "manager",
      skills: ["leadership", "scheduling", "conflict-resolution"],
      location: "Dhaka Office",
      team: "Operations",
      employmentType: "full-time",
      availability: [
        { dayOfWeek: 1, startTime: "08:00", endTime: "17:00" },
        { dayOfWeek: 2, startTime: "08:00", endTime: "17:00" },
        { dayOfWeek: 3, startTime: "08:00", endTime: "17:00" },
        { dayOfWeek: 4, startTime: "08:00", endTime: "17:00" },
        { dayOfWeek: 5, startTime: "08:00", endTime: "17:00" },
      ],
    },

    {
      email: "bob.parttime@example.com",
      password: "password123",
      firstName: "Bob",
      lastName: "Khan",
      role: "engineer",
      skills: ["javascript", "react", "testing"],
      location: "Chittagong Office",
      team: "Platform",
      employmentType: "part-time",
      availability: [
        { dayOfWeek: 1, startTime: "17:00", endTime: "22:00" },
        { dayOfWeek: 3, startTime: "17:00", endTime: "22:00" },
        { dayOfWeek: 5, startTime: "17:00", endTime: "22:00" },
      ],
    },

    {
      email: "charlie.devops@example.com",
      password: "password123",
      firstName: "Charlie",
      lastName: "Rahman",
      role: "devops",
      skills: ["aws", "kubernetes", "ci/cd"],
      location: "Dhaka Office",
      team: "Infra",
      employmentType: "full-time",
      availability: [
        { dayOfWeek: 0, startTime: "08:00", endTime: "23:59" },
        { dayOfWeek: 1, startTime: "08:00", endTime: "06:00" },
        { dayOfWeek: 1, startTime: "08:00", endTime: "23:59" },
        { dayOfWeek: 2, startTime: "08:00", endTime: "06:00" },
        { dayOfWeek: 3, startTime: "08:00", endTime: "23:59" },
        { dayOfWeek: 4, startTime: "08:00", endTime: "23:59" },
        { dayOfWeek: 5, startTime: "08:00", endTime: "23:59" },
      ],
    },

    {
      email: "diana.senior@example.com",
      password: "password123",
      firstName: "Diana",
      lastName: "Sarker",
      role: "senior-engineer",
      skills: ["node", "design", "mentoring"],
      location: "Remote",
      team: "Platform",
      employmentType: "full-time",
      availability: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
      ],
    },

    {
      email: "eve.hr@example.com",
      password: await AuthUtils.hashPassword("password123"),
      firstName: "Eve",
      lastName: "Ahmed",
      role: "hr",
      skills: ["recruiting"],
      location: "Dhaka Office",
      team: "People",
      employmentType: "part-time",
      availability: [
        { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
        { dayOfWeek: 4, startTime: "13:00", endTime: "17:00" },
      ],
    },
  ];

  const employees = await Employee.insertMany(employeesData);
  console.log(
    "Inserted employees:",
    employees.map((e) => `${e.firstName} ${e.lastName}`)
  );

  const byEmail = new Map<string, (typeof employees)[0]>();
  employees.forEach((e) => byEmail.set(e.email, e));

  const today = new Date("2025-08-24T00:00:00Z");

  const timeOffData = [
    {
      employee: byEmail.get("diana.senior@example.com")!._id,
      startDate: addDays(today, 2),
      endDate: addDays(today, 2),
      status: TimeOffStatus.APPROVED,
    },
    {
      employee: byEmail.get("alice.manager@example.com")!._id,
      startDate: addDays(today, 7),
      endDate: addDays(today, 9),
      status: TimeOffStatus.PENDING,
    },

    {
      employee: byEmail.get("bob.parttime@example.com")!._id,
      startDate: addDays(today, 3),
      endDate: addDays(today, 4),
      status: TimeOffStatus.APPROVED,
    },

    {
      employee: byEmail.get("eve.hr@example.com")!._id,
      startDate: addDays(today, 1),
      endDate: addDays(today, 1),
      status: TimeOffStatus.REJECTED,
    },
  ];

  const timeOffs = await TimeOff.insertMany(timeOffData);
  console.log("Inserted timeoffs:", timeOffs.length);

  const shiftsData: any[] = [
    {
      date: addDays(today, 2),
      startTime: "09:00",
      endTime: "17:00",
      roles: ["manager", "senior-engineer"],
      skillsRequired: ["scheduling"],
      location: "Dhaka Office",
      team: "Operations",
      assignedEmployees: [byEmail.get("alice.manager@example.com")!._id],
      status: ShiftStatus.OPEN,
    },

    {
      date: addDays(today, 3),
      startTime: "18:00",
      endTime: "22:00",
      roles: ["engineer"],
      skillsRequired: ["javascript"],
      location: "Chittagong Office",
      team: "Platform",
      assignedEmployees: [byEmail.get("bob.parttime@example.com")!._id],
      status: ShiftStatus.OPEN,
    },

    {
      date: addDays(today, 4),
      startTime: "22:00",
      endTime: "06:00",
      roles: ["devops"],
      skillsRequired: ["kubernetes"],
      location: "Dhaka Office",
      team: "Infra",
      assignedEmployees: [],
      status: ShiftStatus.OPEN,
    },

    {
      date: addDays(today, 2),
      startTime: "08:00",
      endTime: "12:00",
      roles: ["senior-engineer"],
      skillsRequired: ["node"],
      location: "Remote",
      team: "Platform",
      assignedEmployees: [byEmail.get("diana.senior@example.com")!._id],
      status: ShiftStatus.OPEN,
    },

    {
      date: addDays(today, 2),
      startTime: "13:00",
      endTime: "17:00",
      roles: ["senior-engineer"],
      skillsRequired: ["design"],
      location: "Remote",
      team: "Platform",
      assignedEmployees: [],
      status: ShiftStatus.OPEN,
    },

    {
      date: addDays(today, 5),
      startTime: "09:00",
      endTime: "17:00",
      roles: ["manager", "engineer"],
      skillsRequired: ["scheduling", "javascript"],
      location: "Dhaka Office",
      team: "Operations",
      assignedEmployees: [byEmail.get("alice.manager@example.com")!._id],
      status: ShiftStatus.OPEN,
    },

    {
      date: addDays(today, 1),
      startTime: "09:00",
      endTime: "12:00",
      roles: ["hr"],
      skillsRequired: ["recruiting"],
      location: "Dhaka Office",
      team: "People",
      assignedEmployees: [byEmail.get("eve.hr@example.com")!._id],
      status: ShiftStatus.OPEN,
    },
  ];

  const insertedShifts = await Shift.insertMany(shiftsData);
  console.log("Inserted shifts:", insertedShifts.length);

  const conflictShift = await Shift.create({
    date: addDays(today, 3),
    startTime: "19:00",
    endTime: "21:00",
    roles: ["engineer"],
    skillsRequired: ["javascript"],
    location: "Chittagong Office",
    team: "Platform",
    assignedEmployees: [byEmail.get("bob.parttime@example.com")!._id],
    status: ShiftStatus.OPEN,
  });

  const totals = {
    employees: await Employee.countDocuments(),
    shifts: await Shift.countDocuments(),
    timeOffs: await TimeOff.countDocuments(),
  };

  console.log("Seeding complete. Totals:", totals);
}

export default seed;
