import { jsPDF } from 'jspdf';
import { DocumentStorage } from './document-storage';
import type { CVData } from '@/types';

export async function generateAssessmentReport(
  candidateId: string,
  jobDescription: string,
  matchScore: number,
  analysis: string
): Promise<Uint8Array> {
  try {
    console.debug('Generating assessment report:', { 
      candidateId,
      matchScore 
    });

    // Get candidate profile
    const profile = await DocumentStorage.getCandidateProfile(candidateId);
    
    // Create PDF
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Candidate Assessment Report', 20, 20);
    
    // Add candidate info
    doc.setFontSize(14);
    doc.text('Candidate Profile', 20, 40);
    doc.setFontSize(12);
    doc.text(`Name: ${profile.personalInfo.name}`, 20, 50);
    doc.text(`Title: ${profile.personalInfo.title}`, 20, 60);
    
    // Add match score
    doc.setFontSize(14);
    doc.text('Role Fit Analysis', 20, 80);
    doc.setFontSize(12);
    doc.text(`Match Score: ${matchScore}%`, 20, 90);
    
    // Add analysis
    const splitAnalysis = doc.splitTextToSize(analysis, 170);
    doc.text(splitAnalysis, 20, 100);
    
    // Add experience
    doc.setFontSize(14);
    doc.text('Experience', 20, doc.internal.pageSize.height - 100);
    doc.setFontSize(12);
    profile.experience.forEach((exp, i) => {
      const y = doc.internal.pageSize.height - 90 + (i * 20);
      doc.text(`${exp.role} at ${exp.company} (${exp.period})`, 20, y);
    });

    console.debug('Report generated successfully');
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate assessment report');
  }
}