import {BadgePercent, BriefcaseBusiness, FileText, History, Sparkles, Upload, User} from "lucide-react"


export const statistics = [
  {
    id: 1, 
    title: "Total Resumes",
    value: 12,
    icon: FileText,
  },
  {
    id: 2,
    title: "Average ATS Score",
    icon: BadgePercent,
    value: "91%"
  },
  {
    id:3,
    title: "Job Matches",
    value: 8,
    icon: BriefcaseBusiness
  },
  {
    id: 4,
    title: "Uploads",
    value: 5,
    icon: Upload,
  }
]

 export const quickActions = [
  {
    id:1, 
    title: "Upload Resume",
    description: "Upload your PDF Resume for AI Analysis",
    icon: Upload,
    path: "/dashboard/upload"
  },
  {
    id: 2,
    title: "AI Analysis",
    description: "View AI insights",
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