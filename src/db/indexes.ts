import mongoose from "mongoose";
import { Employee } from "../models/employee";
import { Shift } from "../models/shift";
import { TimeOff } from "../models/time-off";
import { Location } from "../models/location";
import { Team } from "../models/team";
import { User } from "../models/user";

/**
 * Database indexes for optimal query performance
 * This script ensures all necessary indexes are created for the Employee Daily Scheduler
 */

export const createDatabaseIndexes = async () => {
  try {
    console.log("🚀 Creating database indexes for Employee Daily Scheduler...");

    // User model indexes
    await User.createIndexes();
    console.log("✅ User indexes created");

    // Employee model indexes
    await Employee.createIndexes();

    // Additional compound indexes for Employee
    await Employee.collection.createIndex(
      { userId: 1, isActive: 1 },
      { background: true }
    );
    await Employee.collection.createIndex(
      { department: 1, employmentType: 1, isActive: 1 },
      { background: true }
    );
    await Employee.collection.createIndex(
      {
        "availabilityWindows.dayOfWeek": 1,
        "availabilityWindows.startTime": 1,
      },
      { background: true }
    );
    console.log("✅ Employee indexes created");

    // Location model indexes
    await Location.createIndexes();
    console.log("✅ Location indexes created");

    // Team model indexes
    await Team.createIndexes();

    // Additional compound indexes for Team
    await Team.collection.createIndex(
      { locationId: 1, isActive: 1 },
      { background: true }
    );
    console.log("✅ Team indexes created");

    // Shift model indexes
    await Shift.createIndexes();

    // Additional compound indexes for Shift (critical for performance)
    await Shift.collection.createIndex(
      { date: 1, locationId: 1, status: 1 },
      { background: true }
    );
    await Shift.collection.createIndex(
      { date: 1, teamId: 1, startTime: 1 },
      { background: true }
    );
    await Shift.collection.createIndex(
      { assignedEmployeeIds: 1, date: 1, status: 1 },
      { background: true }
    );
    await Shift.collection.createIndex(
      { locationId: 1, date: 1, startTime: 1, endTime: 1 },
      { background: true }
    );
    await Shift.collection.createIndex(
      { requiredSkills: 1, date: 1 },
      { background: true }
    );
    await Shift.collection.createIndex(
      { shiftType: 1, date: 1 },
      { background: true }
    );
    console.log("✅ Shift indexes created");

    // TimeOff model indexes
    await TimeOff.createIndexes();

    // Additional compound indexes for TimeOff (critical for conflict detection)
    await TimeOff.collection.createIndex(
      { employeeId: 1, status: 1, startDate: 1, endDate: 1 },
      { background: true }
    );
    await TimeOff.collection.createIndex(
      { startDate: 1, endDate: 1, status: 1 },
      { background: true }
    );
    await TimeOff.collection.createIndex(
      { type: 1, status: 1, appliedDate: 1 },
      { background: true }
    );
    console.log("✅ TimeOff indexes created");

    // Text indexes for search functionality
    await Employee.collection.createIndex(
      {
        employeeId: "text",
        department: "text",
        position: "text",
        skills: "text",
      },
      {
        background: true,
        name: "employee_search_text",
      }
    );

    await Location.collection.createIndex(
      {
        name: "text",
        address: "text",
        city: "text",
      },
      {
        background: true,
        name: "location_search_text",
      }
    );

    await Team.collection.createIndex(
      {
        name: "text",
        description: "text",
        department: "text",
      },
      {
        background: true,
        name: "team_search_text",
      }
    );

    console.log("✅ Text search indexes created");

    // Sparse indexes for optional fields
    await Employee.collection.createIndex(
      { hourlyRate: 1 },
      { sparse: true, background: true }
    );

    await Shift.collection.createIndex(
      { parentShiftId: 1 },
      { sparse: true, background: true }
    );

    await Shift.collection.createIndex(
      { hourlyRate: 1 },
      { sparse: true, background: true }
    );

    await TimeOff.collection.createIndex(
      { approvedBy: 1, reviewedDate: 1 },
      { sparse: true, background: true }
    );

    console.log("✅ Sparse indexes created");

    // Performance-critical compound indexes for aggregation queries
    await Shift.collection.createIndex(
      { date: 1, locationId: 1, teamId: 1, status: 1 },
      { background: true }
    );

    await Shift.collection.createIndex(
      { assignedEmployeeIds: 1, shiftType: 1, date: 1 },
      { background: true }
    );

    // For workload calculations
    await Shift.collection.createIndex(
      { assignedEmployeeIds: 1, date: 1, startTime: 1, endTime: 1 },
      { background: true }
    );

    // For coverage analytics
    await Shift.collection.createIndex(
      { locationId: 1, teamId: 1, date: 1, requiredSkills: 1 },
      { background: true }
    );

    console.log("✅ Aggregation performance indexes created");

    console.log("🎉 All database indexes created successfully!");

    // List all indexes for verification
    const collections = [
      { name: "users", model: User },
      { name: "employees", model: Employee },
      { name: "locations", model: Location },
      { name: "teams", model: Team },
      { name: "shifts", model: Shift },
      { name: "timeoffs", model: TimeOff },
    ];

    console.log("\n📊 Index Summary:");
    for (const collection of collections) {
      const indexes = await collection.model.collection.getIndexes();
      console.log(`\n${collection.name.toUpperCase()}:`);
      Object.keys(indexes).forEach((indexName) => {
        const index = indexes[indexName];
        const keys = Object.keys(index.key || {}).join(", ");
        console.log(`  - ${indexName}: [${keys}]`);
      });
    }
  } catch (error) {
    console.error("❌ Error creating database indexes:", error);
    throw error;
  }
};

/**
 * Drop all custom indexes (use with caution)
 */
export const dropCustomIndexes = async () => {
  try {
    console.log("🗑️ Dropping custom indexes...");

    const collections = [User, Employee, Location, Team, Shift, TimeOff];

    for (const collection of collections) {
      const indexes = await collection.collection.getIndexes();
      for (const indexName of Object.keys(indexes)) {
        if (indexName !== "_id_") {
          try {
            await collection.collection.dropIndex(indexName);
            console.log(`✅ Dropped index: ${indexName}`);
          } catch (error: any) {
            if (!error.message.includes("index not found")) {
              console.warn(
                `⚠️ Could not drop index ${indexName}:`,
                error.message
              );
            }
          }
        }
      }
    }

    console.log("✅ Custom indexes dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping indexes:", error);
    throw error;
  }
};

/**
 * Check index performance and usage
 */
export const analyzeIndexUsage = async () => {
  try {
    console.log("📈 Analyzing index usage...");

    const collections = [
      { name: "users", collection: User.collection },
      { name: "employees", collection: Employee.collection },
      { name: "locations", collection: Location.collection },
      { name: "teams", collection: Team.collection },
      { name: "shifts", collection: Shift.collection },
      { name: "timeoffs", collection: TimeOff.collection },
    ];

    for (const { name, collection } of collections) {
      console.log(`\n${name.toUpperCase()} Collection:`);

      // Get index stats
      const indexStats = await collection
        .aggregate([{ $indexStats: {} }])
        .toArray();

      indexStats.forEach((stat: any) => {
        console.log(`  Index: ${stat.name}`);
        console.log(`    Usage count: ${stat.accesses.ops}`);
        console.log(`    Since: ${stat.accesses.since}`);
      });
    }
  } catch (error) {
    console.error("❌ Error analyzing index usage:", error);
  }
};
