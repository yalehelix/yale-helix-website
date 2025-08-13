import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const data = await request.json();

    // Validate required fields
    const requiredFields = ["startupName", "contactName", "email"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Format data for Google Forms submission
    const formData = new URLSearchParams();

    // Map your form fields to Google Forms entry IDs
    const fieldMappings = [
      { name: "entry.171789341", value: data.startupName || "" },
      { name: "entry.359504525", value: data.contactName || "" },
      { name: "entry.58582101", value: data.email || "" },
      { name: "entry.883030032", value: data.website || "" },
      { name: "entry.23302701", value: data.linkedin || "" },
      { name: "entry.1655775433", value: data.startupDescription || "" },
      { name: "entry.1777513500", value: data.primaryProblem || "" },
      { name: "entry.99637537", value: data.solution || "" },
      { name: "entry.1158341576", value: data.currentStage || "" },
      { name: "entry.1667235498", value: data.targetCustomers || "" },
      { name: "entry.298457997", value: data.businessModel || "" },
      { name: "entry.1859300090", value: data.competitors || "" },
      { name: "entry.1684025098", value: data.team || "" },
      { name: "entry.1602431770", value: data.milestoneAchievements || "" },
      { name: "entry.2119814287", value: data.twelveMonthGoals || "" },
      { name: "entry.291054326", value: data.studentRoles || "" },
      { name: "entry.1080397699", value: data.otherAccelerators || "" },
      { name: "entry.1770175107", value: data.additionalInfo || "" },
      { name: "entry.639898116", value: data.pitchDeckLink || "" },
    ];

    // Add all fields to form data
    fieldMappings.forEach((field) => {
      if (field.value) {
        formData.append(field.name, field.value);
      }
    });

    // Submit to Google Forms
    const googleFormsUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSeTs-mkFf0y6AVKzVyg2Qx8eG4azWX_oC3GGRsNNtMYsagExQ/formResponse";

    const response = await fetch(googleFormsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (compatible; YaleHelix/1.0)",
      },
      body: formData.toString(),
    });

    // Google Forms doesn't return a proper response, so we check if the request was sent
    if (response.status >= 200 && response.status < 400) {
      return NextResponse.json({
        success: true,
        message: "Application submitted successfully",
      });
    } else {
      return NextResponse.json({ error: "Failed to submit to Google Forms" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error during submission" }, { status: 500 });
  }
}
