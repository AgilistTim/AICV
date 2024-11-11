import { useState } from 'react';
import { useCV } from '@/context/CVContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, PieChart } from 'lucide-react';

export default function JobMatcher() {
  const { jobMatch, setJobMatch } = useCV();

  const handleJobDescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement job description analysis
      setJobMatch({
        score: 85,
        matchedSkills: ['React', 'TypeScript'],
        missingSkills: ['AWS'],
        recommendations: ['Consider getting AWS certification']
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-6 w-6" />
          Job Match Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Button variant="outline" className="w-full" onClick={() => document.getElementById('jd-upload')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Job Description
            </Button>
            <input
              id="jd-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleJobDescriptionUpload}
            />
          </div>

          {jobMatch && (
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Match Score</span>
                  <span className="text-sm text-muted-foreground">
                    {jobMatch.score}%
                  </span>
                </div>
                <Progress value={jobMatch.score} className="h-2" />
              </div>

              <div>
                <h4 className="mb-2 font-medium">Matched Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {jobMatch.matchedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-green-500/10">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {jobMatch.missingSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-red-500/10">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Recommendations</h4>
                <ul className="list-disc pl-5 text-sm">
                  {jobMatch.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}