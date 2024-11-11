import { useCV } from '@/context/CVContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, Briefcase, Award, TrendingUp, 
  AlertTriangle, Lightbulb 
} from 'lucide-react';

export default function ProfileView() {
  const { cvData } = useCV();

  if (!cvData) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6" />
          Professional Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold">{cvData.personalInfo.name}</h2>
            <p className="text-lg text-muted-foreground">{cvData.personalInfo.title}</p>
            <p className="mt-2">{cvData.personalInfo.summary}</p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Award className="h-5 w-5" />
              Skills
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {cvData.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-5 w-5" />
              Experience
            </h3>
            <div className="mt-2 space-y-4">
              {cvData.experience.map((exp, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold">{exp.role}</h4>
                      <p className="text-muted-foreground">{exp.company}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {exp.period}
                    </span>
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {exp.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm">
                  {cvData.insights.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm">
                  {cvData.insights.improvements.map((improvement, i) => (
                    <li key={i}>{improvement}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm">
                  {cvData.insights.recommendations.map((recommendation, i) => (
                    <li key={i}>{recommendation}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}