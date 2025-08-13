import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const data = await request.json();

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "classYear", "intendedMajor", "areasOfInterest"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Format data for Google Forms submission
    const formData = new URLSearchParams();

    // Map your form fields to Google Forms entry IDs
    const fieldMappings = [
      { name: "entry.231588117", value: data.firstName || "" },
      { name: "entry.254464927", value: data.lastName || "" },
      { name: "entry.673409248", value: data.email || "" },
      { name: "entry.1720462299", value: data.classYear || "" },
      { name: "entry.1837266616", value: data.intendedMajor || "" },
      { name: "entry.1907843651", value: data.linkedin || "" },
      { name: "entry.535815391", value: data.resume || "" },
      { name: "entry.2107500991", value: data.whyHelix || "" },
      { name: "entry.1678797299", value: data.building || "" },
      { name: "entry.766347532", value: data.goals || "" },
      { name: "entry.497833455", value: data.longForm || "" },
    ];

    // Add all fields to form data
    fieldMappings.forEach((field) => {
      if (field.value) {
        formData.append(field.name, field.value);
      }
    });

    // Add areas of interest (multiple values)
    if (data.areasOfInterest && Array.isArray(data.areasOfInterest)) {
      data.areasOfInterest.forEach((area: string) => {
        formData.append("entry.1486721923", area);
      });
    }

    // Submit to Google Forms
    const googleFormsUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSfJL1qgGgfl31AFpVn_M8NZBuRePz6XrmWoQjlUqHA024It8g/formResponse";

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
