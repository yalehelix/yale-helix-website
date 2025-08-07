import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const data = await request.json();

    // Validate required fields
    const requiredFields = ["name", "email", "major"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Define area options to convert values to labels
    const areaOptions = [
      { value: "softwareDev", label: "Software Development" },
      { value: "ml", label: "Machine Learning / AI" },
      { value: "dataSci", label: "Data Science" },
      { value: "ui-ux", label: "UI / UX" },
      { value: "finance", label: "Finance" },
      { value: "biologicalSci", label: "Biological Sciences / Therapeutics" },
      { value: "clinicalResearch", label: "Clinical Research" },
      { value: "digitalHealth", label: "Digital Health" },
      { value: "engineering", label: "Engineering / Product Design" },
      { value: "marketing", label: "Marketing" },
      { value: "policy", label: "Policy" },
    ];

    // Convert interest values to labels
    const interestLabels = data.interests ? data.interests.map((interest: string) => {
      const option = areaOptions.find(opt => opt.value === interest);
      return option ? option.label : interest;
    }) : [];

    // Format data for Google Forms submission
    const formData = new URLSearchParams();

    // Add basic fields
    formData.append("entry.1848089992", data.name || "");
    formData.append("entry.1203704855", data.major || "");
    formData.append("entry.724760969", data.email || "");
    
    // Add each interest as a separate entry (required for Google Forms multi-select)
    interestLabels.forEach((label: string) => {
      formData.append("entry.878899907", label);
    });

    // Submit to Google Forms
    const googleFormsUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeDlUA5uoNE4ecN3wojKeZaQGoBOncZSGmlRteWcKd8nJsD5A/formResponse";

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
        message: "Interest form submitted successfully",
      });
    } else {
      return NextResponse.json({ error: "Failed to submit to Google Forms" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error during submission" }, { status: 500 });
  }
} 