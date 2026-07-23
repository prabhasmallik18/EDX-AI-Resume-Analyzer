import StatCard from "../component/dashboard/StatCard"
import QuickActionCards from "../component/dashboard/QuickActionCards"
import RecentAnalysisCard from "../component/dashboard/RecentAnalysisCard"

import { useNavigate } from "react-router-dom"

import { statistics, quickActions, recentAnalysis } from "../data/dashboard"



function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-4">
        <h2>Dashboard</h2>

        <p className="text-muted">Here's a quick overview of your activity.</p>
      </div>

      <div className="row g-4">
        {statistics.map((stat) => (
          <div key={stat.id} className="col-md-6 col-xl-3">
            <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
          </div>
        ))}
      </div>

      <h4 className="mt-5 mb-4">Quick Actions</h4>

      <div className="row mt-5">


  <div className="col-lg-7">

    <h4 className="mb-4">
      Quick Actions
    </h4>

    <div className="row g-4">

      {quickActions.map((action) => (

        <div
          key={action.id}
          className="col-md-6"
        >

          <QuickActionCards

            title={action.title}

            description={action.description}

            icon={action.icon}

            onClick={() => navigate(action.path)}

          />

        </div>

      ))}

    </div>

  </div>

  <div className="col-lg-5">

    <div className="d-flex justify-content-between align-items-center mb-4">

      <h4 className="mb-0">
        Recent Analyses
      </h4>

      <button
        className="btn btn-outline-primary btn-sm"
      >
        View All
      </button>

    </div>

    {recentAnalysis.map((analysis) => (

      <RecentAnalysisCard

        key={analysis.id}

        resumeName={analysis.resumeName}

        atsScore={analysis.atsScore}

        analyzedOn={analysis.analyzedOn}

      />

    ))}

  </div>

</div>
    </>
  );
}

export default Dashboard;
