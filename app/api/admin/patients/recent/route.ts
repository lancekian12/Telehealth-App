import { NextResponse } from "next/server";
import type { PipelineStage } from "mongoose";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Appointment } from "@/models/appointment";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10),
    );
    const search = (searchParams.get("search") || "").trim();

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "patients",
          localField: "patient",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      { $unwind: "$patientInfo" },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      { $unwind: "$doctorInfo" },
    ];

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      pipeline.push({
        $match: {
          $or: [
            { "patientInfo.fullName": regex },
            { "doctorInfo.fullName": regex },
            { reasonForVisit: regex },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                appointmentId: "$_id",
                patientId: "$patientInfo._id",
                patientName: "$patientInfo.fullName",
                patientAvatar: "$patientInfo.profilePicture",
                doctorName: "$doctorInfo.fullName",
                condition: "$reasonForVisit",
                status: "$status",
                date: "$appointmentDate",
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    );

    const [result] = await Appointment.aggregate(pipeline);
    const data = result?.data || [];
    const total = result?.totalCount?.[0]?.count || 0;

    return NextResponse.json({
      success: true,
      patients: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.log("[GET /api/admin/patients/recent] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
