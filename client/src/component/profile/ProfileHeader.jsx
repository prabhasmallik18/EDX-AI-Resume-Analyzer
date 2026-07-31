import { UserCircle2 } from "lucide-react";

function ProfileHeader({ name, email }) {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body text-center py-5">

        <UserCircle2
          size={90}
          className="text-primary mb-3"
        />

        <h3 className="fw-bold mb-2">
          {name}
        </h3>

        <p className="text-muted mb-0">
          {email}
        </p>

      </div>
    </div>
  );
}

export default ProfileHeader;