import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['startupName', 'contactName', 'email'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Format data for Google Forms submission
    const formData = new URLSearchParams();
    
    // Map your form fields to Google Forms entry IDs
    const fieldMappings = [
      { name: 'entry.161973672', value: data.startupName },
      { name: 'entry.1292942263', value: data.contactName },
      { name: 'entry.2092094953', value: data.email },
      { name: 'entry.263108220', value: data.website || '' },
      { name: 'entry.1907843651', value: data.linkedin || '' },
      { name: 'entry.184834358', value: data.startupDescription || '' },
      { name: 'entry.2089020112', value: data.primaryProblem || '' },
      { name: 'entry.1063815956', value: data.solution || '' },
      { name: 'entry.1750629714', value: data.currentStage || '' },
      { name: 'entry.1032800288', value: data.targetCustomers || '' },
      { name: 'entry.277254229', value: data.businessModel || '' },
      { name: 'entry.2001232321', value: data.competitors || '' },
      { name: 'entry.1189492363', value: data.team || '' },
      { name: 'entry.45775880', value: data.milestoneAchievements || '' },
      { name: 'entry.1881769432', value: data.twelveMonthGoals || '' },
      { name: 'entry.2011166899', value: data.studentRoles || '' },
      { name: 'entry.1001509675', value: data.otherAccelerators || '' },
      { name: 'entry.367328821', value: data.additionalInfo || '' },
      { name: 'entry.1006943153', value: data.pitchDeck || '' },
    ];

    // Add all fields to form data
    fieldMappings.forEach(field => {
      if (field.value) {
        formData.append(field.name, field.value);
      }
    });

    // Submit to Google Forms
    const googleFormsUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfDEZcLD3Q_ZdOfOyIGtPXtyMNTNUxqBAf6qeG0lRjnt3HZdQ/formResponse';
    
    const response = await fetch(googleFormsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; YaleHelix/1.0)',
      },
      body: formData.toString(),
    });

    // Google Forms doesn't return a proper response, so we check if the request was sent
    if (response.status >= 200 && response.status < 400) {
      return NextResponse.json({ 
        success: true,
        message: 'Application submitted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to submit to Google Forms' },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error during submission' },
      { status: 500 }
    );
  }
} 