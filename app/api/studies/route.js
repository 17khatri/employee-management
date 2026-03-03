import "@/models";
import Study from "@/models/Studies";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAdmin, verifyUser } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const studies = await Study.find();

    return NextResponse.json(studies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// export async function POST(req) {
//   const auth = verifyAdmin(req);
//   if (auth.error) {
//     return auth.error;
//   }
//   try {
//     await connectDB();
//     const { employeeId, education } = await req.json();

//     if (!employeeId || !education) {
//       return NextResponse.json(
//         { message: "Employee ID, grade, and passing year are required" },
//         { status: 400 },
//       );
//     }

//     const studyData = education.map((item) => ({
//       employeeId,
//       grade: item.grade,
//       percentage: item.percentage,
//       passingYear: item.passingYear,
//     }));

//     const newStudy = await Study.insertMany(studyData);

//     return NextResponse.json(newStudy, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function POST(req) {
  const auth = verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectDB();

    const { employeeId, education } = await req.json();

    if (!employeeId || !education) {
      return NextResponse.json(
        { message: "Employee ID and education are required" },
        { status: 400 },
      );
    }

    // 🔥 1️⃣ Get existing studies from DB
    const existingStudies = await Study.find({ employeeId });

    const existingIds = existingStudies.map((s) => s._id.toString());

    const incomingIds = education.filter((e) => e._id).map((e) => e._id);

    /* =====================================================
       🔹 2️⃣ DELETE removed records
    ====================================================== */
    const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

    if (idsToDelete.length > 0) {
      await Study.deleteMany({ _id: { $in: idsToDelete } });
    }

    /* =====================================================
       🔹 3️⃣ UPDATE existing records
    ====================================================== */
    for (const item of education) {
      if (item._id) {
        await Study.findByIdAndUpdate(item._id, {
          grade: item.grade,
          percentage: item.percentage,
          passingYear: item.passingYear,
        });
      }
    }

    /* =====================================================
       🔹 4️⃣ INSERT new records
    ====================================================== */
    const newItems = education.filter((e) => !e._id);

    if (newItems.length > 0) {
      const studyData = newItems.map((item) => ({
        employeeId,
        grade: item.grade,
        percentage: item.percentage,
        passingYear: item.passingYear,
      }));

      await Study.insertMany(studyData);
    }

    return NextResponse.json(
      { message: "Studies synced successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          message: "Id is required",
        },
        { status: 400 },
      );
    }

    const study = await Study.findByIdAndDelete(id);
    if (!study) {
      return NextResponse.json({ message: "study not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "study delted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
