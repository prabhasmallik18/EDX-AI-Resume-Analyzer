import {BadgePercent, BriefcaseBusiness, FileText, History, Sparkles, Trophy, Upload, User} from "lucide-react"


export const statistics = [
  {
    id: 1, 
    title: "Total Resumes",
    hint: "Uploaded so far",
    value: 0,
    icon: FileText,
  },
  {
    id: 2,
    title: "Average ATS Score",
    hint: "Across all resumes",
    icon: BadgePercent,
    value: "NA"
  },
  {
    id:3,
    title: "Job Matches",
    hint: "Jobs you compared",
    value: 0,
    icon: BriefcaseBusiness
  },
  {
    id: 4,
    title: "Best ATS Score",
    hint: "Your highest result",
    value: "NA",
    icon: Trophy,
  }
]

 export const quickActions = [
  {
    id:1, 
    title: "Upload Resume",
    description: "Upload your PDF resume for instant analysis",
    icon: Upload,
    path: "/dashboard/upload"
  },
  {
    id: 2,
    title: "Latest Report",
    description: "Open your newest analysis",
    icon: Sparkles,
  },
   {
    id: 3,
    title: "Analysis History",
    description: "View History",
    icon: History,
    path: "/dashboard/history",
  },
   {
    id: 4,
    title: "Profile",
    description: "View Profile",
    icon: User,
    path: "/dashboard/profile",
  },
]

export const recentAnalysis = [
    {
        id: 1, 
        resumeName: "FrontendResume.pdf",
        atsScore: "44%",
        analyzedOn: "July 20, 2026"
    },
        {
        id: 2, 
        resumeName: "FrontendResume-2.pdf",
        atsScore: "90%",
        analyzedOn: "July 20, 2026"
    },
        {
        id: 2, 
        resumeName: "FrontendResume-3.pdf",
        atsScore: "94%",
        analyzedOn: "July 20, 2026"
    }
]