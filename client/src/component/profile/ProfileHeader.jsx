import { UserCircle2, Mail } from "lucide-react";

function ProfileHeader({ name, email }) {
  return (
    <div
      className="card border-0"
      style={{
        borderRadius: "22px",
        boxShadow: "0 15px 35px rgba(0,0,0,.08)",
      }}
    >
      <div className="card-body text-center py-5">

        <div
          className="mx-auto mb-4 d-flex justify-content-center align-items-center"
          style={{
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg,#2563eb,#4f46e5)",
            color: "#fff",
          }}
        >
          <UserCircle2 size={70} />
        </div>

        <h3 className="fw-bold mb-2">
          {name}
        </h3>

        <div
          className="d-flex justify-content-center align-items-center text-muted"
        >
          <Mail size={18} className="me-2" />
          {email}
        </div>

      </div>
    </div>
  );
}

export default ProfileHeader;