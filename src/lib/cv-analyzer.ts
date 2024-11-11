import { openai } from './openai';
import type { CVData } from '@/types';

export class CVAnalyzer {
  private static readonly SYSTEM_PROMPT = `You are a CV analysis expert. Extract and structure the following information from the CV text.
Return ONLY a valid JSON object with this exact structure, no markdown or code blocks:

{
  "personalInfo": {
    "name": "Full Name",
    "title": "Professional Title",
    "summary": "Brief professional summary"
  },
  "skills": ["Skill 1", "Skill 2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "period": "Employment Period",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "insights": {
    "strengths": ["Strength 1", "Strength 2"],
    "improvements": ["Area 1", "Area 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  }
}

Important:
- Return ONLY the JSON object, no markdown formatting
- Include all required fields
- Use arrays for lists
- Keep text concise and professional
- If a field cannot be determined, use appropriate placeholder text`;

  static async analyze(text: string): Promise<CVData> {
    try {
      console.debug('Starting CV analysis...', { textLength: text.length });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: this.SYSTEM_PROMPT },
          { role: "user", content: text }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error('No content in CV analysis response');
        throw new Error('No analysis results received');
      }

      console.debug('Received analysis response');

      try {
        // Clean the response string
        const cleanContent = content
          .replace(/^```json\s*/, '') // Remove leading ```json
          .replace(/\s*```$/, '')     // Remove trailing ```
          .trim();

        console.debug('Parsing JSON response');
        const parsedData = JSON.parse(cleanContent) as CVData;
        
        // Validate required fields
        if (!this.validateCVData(parsedData)) {
          console.error('Invalid CV data structure:', parsedData);
          throw new Error('Invalid CV data structure');
        }

        console.debug('Successfully parsed CV data');
        return parsedData;
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Raw content:', content);
        throw new Error('Failed to parse CV analysis results');
      }
    } catch (error) {
      console.error('CV analysis error:', error);
      throw error;
    }
  }

  private static validateCVData(data: any): data is CVData {
    const isValid = !!(
      data &&
      data.personalInfo?.name &&
      data.personalInfo?.title &&
      data.personalInfo?.summary &&
      Array.isArray(data.skills) &&
      Array.isArray(data.experience) &&
      data.experience.every((exp: any) =>
        exp.company &&
        exp.role &&
        exp.period &&
        Array.isArray(exp.highlights)
      ) &&
      data.insights?.strengths &&
      data.insights?.improvements &&
      data.insights?.recommendations
    );

    if (!isValid) {
      console.error('CV data validation failed:', {
        hasPersonalInfo: !!data?.personalInfo,
        hasName: !!data?.personalInfo?.name,
        hasTitle: !!data?.personalInfo?.title,
        hasSummary: !!data?.personalInfo?.summary,
        hasSkills: Array.isArray(data?.skills),
        hasExperience: Array.isArray(data?.experience),
        hasInsights: !!data?.insights,
        data
      });
    }

    return isValid;
  }
}